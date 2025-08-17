use std::borrow::Cow;
use anyhow::Result;
use agenda_backend::{get_calendar_events::get_calendar_events, get_tasks::get_tasks};

fn format_date_ymd(s: &str) -> String {
    // expect YYYY-MM-DD
    let parts: Vec<&str> = s.split('-').collect();
    if parts.len() != 3 {
        return s.to_string();
    }
    let year = parts[0];
    let month = parts[1].parse::<usize>().ok();
    let day = parts[2].trim_start_matches('0').parse::<u32>().ok();
    let months = [
        "", "January", "February", "March", "April", "May", "June", "July", "August", "September",
        "October", "November", "December",
    ];
    if let (Some(m), Some(d)) = (month, day) {
        if (1..=12).contains(&m) {
            return format!("{} {}", months[m], d);
        }
    }
    // fallback to original if parsing fails
    format!("{}-{}-{}", year, parts.get(1).unwrap_or(&""), parts.get(2).unwrap_or(&""))
}

fn escape_html(s: &str) -> Cow<'_, str> {
    if !s.chars().any(|c| matches!(c, '&' | '<' | '>' | '"' | '\'')) {
        return Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 8);
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            other => out.push(other),
        }
    }
    Cow::Owned(out)
}

fn attempt() -> Result<()> {
    let (maybe_events, maybe_tasks) = std::thread::scope(|s| {
        let events_thread = s.spawn(get_calendar_events);
        let tasks_thread = s.spawn(get_tasks);
        (events_thread.join(), tasks_thread.join())
    });

    let tasks = maybe_tasks.map_err(|e| anyhow::anyhow!("{e:?}"))??;
    let events = maybe_events.map_err(|e| anyhow::anyhow!("{e:?}"))??;

    let mut days = vec!["Tomorrow", "Today"];

    let mut html = String::with_capacity(8 * 1024);
    html.push_str(
        "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style type=\"text/css\">
table td {
    border: 1px solid gray;
    font-size: 20px;
}

.event-start-time {
    width: 55px;
}

.event-title {
    font-weight: bold;
}

.date {
    font-size: 28px;
}

.tasks-header {
    font-size: 28px;
    }

.task-title {
    font-size: 20px;
    font-weight: bold;
}
         </style></head><body>",
    );

    let mut current_date = String::new();
    for event in events {
        if event.start_date != current_date {
            current_date = event.start_date.clone();

            let date_display = if !days.is_empty() {
                days.pop().unwrap().to_string()
            } else {
                format_date_ymd(&current_date)
            };
            html.push_str("<div class=\"date\">");
            html.push_str(&escape_html(&date_display));
            html.push_str("</div>");
        }

        html.push_str("<table class=\"day\"><tr class=\"event\"><td class=\"event-start-time\">");
        html.push_str(&escape_html(&event.start_time));
        html.push_str("</td><td class=\"event-title\">");
        html.push_str(&escape_html(&event.title));
        html.push_str("</td></tr></table>");
    }

    html.push_str("<hr>");

    html.push_str("<div class=\"tasks-header\">Tasks</div>");

    for task in &tasks {
        html.push_str("<div class=\"task-title\">☐&nbsp;");
        html.push_str(&escape_html(&task.name.clone().unwrap_or_default()));
        html.push_str("</div>");
    }

    html.push_str("</body></html>");
    println!("{}", html);

    Ok(())
}

fn main() -> Result<()> {
    attempt()
}
