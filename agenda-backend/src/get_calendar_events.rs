use serde::Serialize;
use std::process::Command;
use anyhow::{Context, Result};
use serde::Deserialize;

#[derive(Debug, Deserialize, Serialize)]
pub struct Event {
    pub start_date: String,
    pub start_time: String,
    pub end_date: String,
    pub end_time: String,
    pub title: String,
}

pub fn get_calendar_events() -> Result<Vec<Event>> {
    let out = Command::new("gcalcli")
        .args(&["agenda", "today", "three days from now", "--tsv", "--nocache"])
        .output()
        .context("failed to run gcalcli")?;

    if !out.status.success() {
        return Err(anyhow::anyhow!("gcalcli exited with status {}", out.status));
    }

    let mut rdr = csv::ReaderBuilder::new()
        .delimiter(b'\t')
        .has_headers(true)
        .from_reader(&out.stdout[..]);

    let mut events = Vec::new();
    for record in rdr.deserialize() {
        let ev: Event = record.context("failed to deserialize TSV record")?;
        events.push(ev);
    }

    Ok(events)
}
