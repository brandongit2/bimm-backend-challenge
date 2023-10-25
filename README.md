# BIMM coding challenge, back-end (Brandon Tsang)

**Gathers all vehicle data in 8m40s (in my testing).**

By poking around at the NHTSA vPIC API, I realized that you could circumvent rate limits by changing your user agent string, even on the same computer and network. I took advantage of this by running multiple "data fetchers" (see `DataFetcher.ts`) at a time, each data fetcher creating a maximum of five API connections concurrently. By default, I've set the number of data fetchers to 40 (`NUM_DATA_FETCHERS`). Without multiple data fetchers the total data fetching time could exceed 16 minutes, so this is a 2x speed increase.

## Features

- Fetches all vehicle makes, then all vehicles per make, from the NHTSA vPIC API.
- Many requests are made concurrently, massively speeding up data fetching.
- Only one data-fetching task is allowed to run at a time; hitting `/fetch-vehicle-data` when data fetching is already happening will show an error message.
- All vehicle data is saved in a MongoDB database.
- All services are written in TypeScript.
- Entire application (Node.js server and MongoDB) is Dockerized, and can be started in a single command via Docker Compose.
- Contains a REST API as well as a GraphQL API. The GraphQL API is for querying the saved data only.

## API routes

- `/`: A simple route for verifying the server is up.
- `/fetch-vehicle-data`: The primary route; kicks off data fetching in the background.
- `/progress`: Use to check the progress of data fetching, and whether it's active or idle.
- `/saved-vehicle-data`: Pull the saved data from MongoDB; returns a JSON object.
- `/graphql`: The GraphQL API endpoint; you can also navigate here in a browser to bring up the GraphiQL interface.

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
mkcert -cert-file api/src/localhost-cert.pem -key-file api/src/localhost-privkey.pem localhost 127.0.0.1 ::1
```

### Note on IPv6

> If you don't want to do the below, you can always connect in web browsers by going to https://127.0.0.1:<api-port> instead of localhost, which will try (and fail) to use IPv6.

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

### Running the service

First, make your own copy of `.env`:

```bash
cp api/.env.template api/.env
```

If you're running in prod, make the following changes to the new `.env`:
- `NODE_ENV=production`. Right now all this does is disable prettier logging.
- `DB_CONNECTION_STRING=mongodb://service-db-prod:27017/vehicleMakes` for the production database.

To start the application, assuming you have Docker installed:

```bash
./start.sh
```

> TO DO: Create a production version of the service.

This will use Docker Compose to spin up two Docker services: a MongoDB database, and a Node.js server. The database listens on port 27018, and the Node.js server listens on port 8444.

## Development

### pnpm (optional)

This project uses [pnpm](https://pnpm.io/) as its package manager. Node.js bundles pnpm by default via its Corepack utility, so if you don't already have pnpm, you can run `corepack enable` to enable it.

You don't technically need to install the pnpm dependencies locally, since the dependencies are installed automatically in the development container. However for development your IDE will benefit if you have the dependencies installed outside the container.

```bash
cd api
pnpm install
```

All package management has to be done in the `api/` folder as that's where the Node.js project lies. So no running pnpm commands in the project root.

### GraphQL typegen

When you update the GraphQL schema, the TypeScript types will need to be regenerated. To do this:

```bash
cd api
pnpm generate
```

This will put the generated types in `api/src/graphql/resolvers-types.ts`.

### Starting development environment

The development environment starts the Node.js server in watch mode, meaning changes to the source will restart the server. pnpm package installs should also automatically mirror themselves in the Docker container, but I'm not 100% sure this is working right now.

To start the development containers:

```bash
./develop.sh
```

This will use Docker Compose to spin up two Docker services: a MongoDB database, and a Node.js server. The database listens on port 27017, and the Node.js server listens on port 8443.

### Using MongoDB Compass

Sometimes MongoDB Compass has issues connecting to the Dockerized database with the regular connection string. Enabling direct connection should fix this: `mongodb://127.0.0.1:<database-port>/?directConnection=true`.
