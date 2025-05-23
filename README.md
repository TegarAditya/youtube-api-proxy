# Simple YouTube Data API v3 Proxy

The reason this project was created is because YouTube limits API access to only 10,000 hits per day. Applications that start to grow larger and use the API directly from YouTube will drain the quota to the limits.

This project is intended to save quota by storing search results based on ID into a local database. So when hundreds or even thousands of users hit the API with the same ID, it will only cause 1 direct hit to the YouTube API. The rest will be served using data that is already stored in the database.

## Usage
This API has only one endpoint.
```
GET /api/yt/[id]
```
where [id] is the YouTube Content ID

## Development Setup

To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000 or whatever port you specified in the environment variables

## Using Docker Compose

Setup the docker
```sh
docker compose up -d
```