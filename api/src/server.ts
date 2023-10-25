"use strict"

import "dotenv/config"
import Fastify from "fastify"
import fs from "node:fs"
import path, {dirname} from "node:path"
import {fileURLToPath} from "node:url"

import {NODE_ENV} from "./env"

const envToLogger = {
	development: {
		transport: {
			target: `pino-pretty`,
		},
	},
	production: true,
}

const __dirname = dirname(fileURLToPath(import.meta.url))
export const fastify = Fastify({
	logger: envToLogger[NODE_ENV as keyof typeof envToLogger],
	http2: true,
	https: {
		allowHTTP1: true,
		cert: fs.readFileSync(path.resolve(__dirname, `localhost-cert.pem`)),
		key: fs.readFileSync(path.resolve(__dirname, `localhost-privkey.pem`)),
	},
})

fastify.addHook(`onRequest`, (request, reply, done) => {
	fastify.log.info(`Request received: ${request.method} ${request.url}`)
	done()
})

fastify.addHook(`onError`, (request, reply, error, done) => {
	fastify.log.error(`Error processing ${request.method} request on ${request.url}: ${error.message}`)
	done()
})

fastify.listen({host: `0.0.0.0`, port: 8443})
