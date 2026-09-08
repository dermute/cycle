# Cycle

A small, private period calendar. Data is stored only in the browser's local storage, so it remains on that device and is not sent anywhere.

## Run locally

```sh
docker build -t cycle .
docker run --rm -p 8080:80 cycle
```

Open `http://localhost:8080`.

The GitHub workflow builds and publishes `ghcr.io/<owner>/cycle:latest` on pushes to `main`, manually, and every Monday. For use on multiple devices, run the same container behind your preferred private network or reverse proxy. Browser-local data does not automatically sync between devices.
