use anyhow::{Result, anyhow};
use serde::Deserialize;
use std::env;
use std::process::Command;

#[derive(Debug, Deserialize)]
struct Root {
    rsp: Rsp,
}

#[derive(Debug, Deserialize)]
struct Rsp {
    #[allow(dead_code)]
    stat: String,
    tasks: Tasks,
}

#[derive(Debug, Deserialize)]
struct Tasks {
    list: Vec<ListItem>,
}

#[derive(Debug, Deserialize)]
struct ListItem {
    taskseries: Vec<TaskSeries>,
}

#[derive(Debug, Deserialize)]
struct TaskSeries {
    id: String,
    created: Option<String>,
    modified: Option<String>,
    name: Option<String>,
    source: Option<String>,
    url: Option<String>,
    location_id: Option<String>,
    tags: Option<TagsField>,
    // participants, notes omitted since not used
    task: Vec<TaskInner>,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum TagsField {
    Obj { tag: Vec<String> },
    List(Vec<String>),
}

#[derive(Debug, Deserialize)]
struct TaskInner {
    id: String,
    due: Option<String>,
    has_due_time: Option<String>,
    added: Option<String>,
    completed: Option<String>,
    deleted: Option<String>,
    priority: Option<String>,
    postponed: Option<String>,
    estimate: Option<String>,
}

#[derive(Debug, Clone)]
pub struct Task {
    pub task_id: String,
    pub taskseries_id: String,
    pub name: Option<String>,
    pub created: Option<String>,
    pub modified: Option<String>,
    pub source: Option<String>,
    pub url: Option<String>,
    pub location_id: Option<String>,
    pub tags: Vec<String>,
    pub due: Option<String>,
    pub has_due_time: Option<String>,
    pub added: Option<String>,
    pub completed: Option<String>,
    pub deleted: Option<String>,
    pub priority: Option<String>,
    pub postponed: Option<String>,
    pub estimate: Option<String>,
}

/// Call ~/bin/get_tasks.sh, parse the JSON it emits, and return a Vec of merged tasks
/// (each per-task entry combined with its parent taskseries fields).
pub fn get_tasks() -> Result<Vec<Task>> {
    let home = env::var("HOME").map_err(|e| anyhow!("could not read HOME: {}", e))?;
    let script = format!("{}/bin/get_tasks.sh", home);

    let output = Command::new(script).output()?;
    if !output.status.success() {
        return Err(anyhow!(
            "script failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let root: Root = serde_json::from_slice(&output.stdout)?;

    let mut out = Vec::new();
    for list_item in root.rsp.tasks.list {
        for series in list_item.taskseries {
            let tags = match series.tags {
                Some(TagsField::Obj { tag }) => tag,
                Some(TagsField::List(v)) => v,
                None => Vec::new(),
            };

            for t in series.task {
                out.push(Task {
                    task_id: t.id,
                    taskseries_id: series.id.clone(),
                    name: series.name.clone(),
                    created: series.created.clone(),
                    modified: series.modified.clone(),
                    source: series.source.clone(),
                    url: series.url.clone(),
                    location_id: series.location_id.clone(),
                    tags: tags.clone(),
                    due: t.due,
                    has_due_time: t.has_due_time,
                    added: t.added,
                    completed: t.completed,
                    deleted: t.deleted,
                    priority: t.priority,
                    postponed: t.postponed,
                    estimate: t.estimate,
                });
            }
        }
    }

    Ok(out)
}
