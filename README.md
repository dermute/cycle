# Cycle

![Cycle calendar screenshot](docs/screenshot.png)

A small, private period calendar. Data is stored in a SQLite database on the server, in the Docker volume `cycle-data`, so every client using the same deployment sees the same calendar.

## Run locally

```sh
docker compose up -d
```

Open `http://localhost:8080`. Back up the `cycle-data` Docker volume to preserve the calendar. There is deliberately no authentication, so expose this deployment only on a trusted private network or behind your own access control.

The GitHub workflow builds and publishes `ghcr.io/<owner>/cycle:latest` on pushes to `main`, manually, and every Monday. For use on multiple devices, access this same container via its private-network address or a reverse proxy.
