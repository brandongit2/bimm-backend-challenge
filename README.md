# BIMM coding challenge, back-end (Brandon Tsang)

Gathers all vehicle data in 8m40s (in my testing).

By poking at the DOT API, I realized that you could circumvent rate limits by changing your user agent string, even on the same computer and network. I took advantage of this by running multiple "data fetchers" (see `DataFetcher.ts`) at a time, each data fetcher creating a maximum of five API connections concurrently. By default, I've set the number of data fetchers to 40 (`NUM_DATA_FETCHERS`). Without multiple data fetchers the total data fetching time could exceed 16 minutes.

## Features

- Upon invoking an endpoint (`/fetch-vehicle-data`), a task is started up to fetch all vehicle data from the DOT API.
- Many requests are made concurrently, massively speeding up this process.
- Subsequent requests to start data fetching are blocked, so long as the task is already running.
- All vehicle data is saved in a MongoDB database.
- All services written in TypeScript.
- Entire application is Dockerized, and can be started in a single command via Docker Compose.
- Docker containers follow the single-purpose principle, and all dependencies are inside the containers, meaning nothing needs to be installed on the host machine other than Docker.
- Both a development entirement with hot reload, and a production environment.

## Setup instructions

> These setup instructions are written for Mac environments, and have only been tested on my computer. All commands assume your terminal session is in the base of the repository.

### TLS certificate

The API in this application supports HTTP/2 requests, which means you'll have to set up a TLS certificate to run the server. A simple way to set up a certificate locally on your computer is by using [mkcert](https://github.com/FiloSottile/mkcert):

```bash
# Install mkcert, if you don't already have it. NSS is required for Firefox
brew install mkcert nss

# Install the CA created by mkcert onto your computer
mkcert -install

# Create a certificate for the app
mkcert -cert-file src/localhost-cert.pem -key-file src/localhost-privkey.pem localhost 127.0.0.1 ::1
```

### Note on IPv6

> If you don't want to do the below, you can always connect in web browsers by going to https://127.0.0.1:8443 instead of localhost, which will try (and fail) to use IPv6.

All modern web browsers will prefer IPv6 to IPv4 if it's available. Docker requires IPv6 support to be enabled manually which you can do via the following:

Edit your Docker `daemon.json` file (located at `~/.docker/daemon.json`, or wherever you installed Docker) to include the following:

```json
{
	"experimental": true,
	"ip6tables": true
}
```

Then restart your Docker Engine. If you use Docker Desktop, this can be done from the Docker icon in the menu bar, clicking "Restart". Starting the Docker Compose services now should allow IPv6 connections to the API.

_These instructions were adapted from the Linux-based instructions [here](https://docs.docker.com/config/daemon/ipv6/)._

### pnpm (optional)

This project uses [pnpm](https://pnpm.io/) as its package manager. Node.js bundles pnpm by default via its Corepack utility, so if you don't already have pnpm, you can run `corepack enable` to enable it.

You don't technically need to install the pnpm dependencies locally, since the dependencies are installed automatically in the development container. However for development your IDE will benefit if you have the dependencies installed outside the container.

```bash
pnpm install
```

### Running the service

To start the application, assuming you have Docker installed:

```bash
./develop.sh
```

> TO DO: Create a production version of the service.

This will use Docker Compose to spin up two Docker services: a MongoDB database, and a Node.js server with an HTTP REST API.

The database listens on port 27017, and the API listens on port 8443.

## API routes

- `/`: A simple route for verifying the server is up.
- `/fetch-vehicle-data`: The primary route; kicks off data fetching in the background.
- `/progress`: Use to check the progress of data fetching, and whether it's active or idle.
- `/saved-vehicle-data`: Pull the saved data from MongoDB; returns a JSON object.
