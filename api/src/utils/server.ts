"use strict"

import "dotenv/config"
import Fastify from "fastify"
import fs from "node:fs"
import path from "node:path"

import dirName from "./dirName"
import {DB_CONNECTION_STRING, NODE_ENV} from "./env"
import mongoosePlugin from "@/mongoose-plugin"

const envToLogger = {
	development: {
		transport: {
			target: `pino-pretty`,
		},
	},
	production: true,
}

export const fastify = Fastify({
	logger: envToLogger[NODE_ENV as keyof typeof envToLogger],
	http2: true,
	https: {
		allowHTTP1: true,
		cert: fs.readFileSync(path.resolve(dirName(import.meta.url), `../localhost-cert.pem`)),
		key: fs.readFileSync(path.resolve(dirName(import.meta.url), `../localhost-privkey.pem`)),
	},
})

fastify.register(mongoosePlugin, {
	url: DB_CONNECTION_STRING,
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
