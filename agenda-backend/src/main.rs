use anyhow::Result;
use std::convert::Infallible;
use std::env;
use std::sync::Arc;
use std::time::Duration;

use agenda_backend::generate_html::generate_html;
use serde::Deserialize;
use tokio::sync::RwLock;
use warp::{Filter, http::StatusCode, reply::Response};

static TTL_SECONDS: u64 = 20 * 60; // 20 minutes

struct Cache {
    value: String,
    expires_at: std::time::Instant,
}

impl Cache {
    fn expired(&self) -> bool {
        std::time::Instant::now() >= self.expires_at
    }
}

async fn get_html_text() -> Result<String> {
    generate_html()
}

async fn get_cached_html(cache: Arc<RwLock<Cache>>) -> Result<String> {
    {
        let read = cache.read().await;
        if !read.expired() {
            return Ok(read.value.clone());
        }
    }

    let new = get_html_text().await?;

    let mut write = cache.write().await;
    if !write.expired() {
        return Ok(write.value.clone());
    }

    write.value = new.clone();
    write.expires_at = std::time::Instant::now() + Duration::from_secs(TTL_SECONDS);
    Ok(new)
}

#[derive(Deserialize)]
struct QueryParams {
    personal_key: Option<String>,
}

#[tokio::main]
async fn main() {
    let expected_key = env::var("PERSONAL_KEY").expect("Must set PERSONAL_KEY env variable.");
    let cache = Arc::new(RwLock::new(Cache {
        value: String::new(),
        expires_at: std::time::Instant::now() - Duration::from_secs(1),
    }));

    let cache_filter = {
        let cache = cache.clone();
        warp::any().map(move || cache.clone())
    };

    let key_filter = warp::query::query::<QueryParams>().map(|q: QueryParams| q.personal_key);

    let route = warp::get()
        .and(warp::path::end())
        .and(key_filter)
        .and(cache_filter)
        .and_then(move |key: Option<String>, cache: Arc<RwLock<Cache>>| {
            let expected_key = expected_key.clone();
            async move {
                match key {
                    Some(k) if k == expected_key => {
                        let body = get_cached_html(cache.clone()).await;
                        let body = match body {
                            Ok(body) => body,
                            Err(_) => match get_cached_html(cache).await {
                                Ok(x) => x,
                                Err(err) => {
                                    eprintln!("Error: {err:?}");
                                    format!("Error: {err}")
                                }
                            }
                        };
                        let mut resp = Response::new(body.into());
                        resp.headers_mut().insert(
                            warp::http::header::CONTENT_TYPE,
                            warp::http::HeaderValue::from_static("text/html; charset=utf-8"),
                        );
                        Ok::<_, Infallible>(resp)
                    }
                    _ => {
                        let mut resp = Response::new("Unauthorized".into());
                        *resp.status_mut() = StatusCode::UNAUTHORIZED;
                        Ok::<_, Infallible>(resp)
                    }
                }
            }
        });

    warp::serve(route).run(([0, 0, 0, 0], 6969)).await;
}
