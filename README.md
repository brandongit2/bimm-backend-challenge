# BIMM coding challenge, back-end (Brandon Tsang)

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

### Run the services

This project uses [pnpm](https://pnpm.io/) as its package manager. Node.js bundles pnpm by default via its Corepack utility, so if you don't already have pnpm, you can run `corepack enable` to enable it.

To start the application, assuming you have Docker installed:

```bash
pnpm dev
```

This will use Docker Compose to spin up two Docker services: a MongoDB database, and a Node.js server with an HTTP REST API.

The database listens on port 27017, and the API listens on port 8443.
