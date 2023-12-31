/* A Fastify plugin for Mongoose. Doesn't do much but makes things a little more idiomatic to Fastify. */

import fastifyPlugin from "fastify-plugin"
import mongoose from "mongoose"

import type {FastifyInstance} from "fastify"

export type FastifyMongooseOpts = {
	url: string
}

async function fastifyMongoose(fastify: FastifyInstance, {url}: FastifyMongooseOpts) {
	try {
		await mongoose.connect(url, {
			serverSelectionTimeoutMS: 3000,
		})
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}

	fastify.addHook(`onClose`, async () => {
		await mongoose.disconnect()
	})

	fastify.decorate(`mongoose`, mongoose)
}

export default fastifyPlugin(fastifyMongoose)

declare module "fastify" {
	interface FastifyInstance {
		mongoose: typeof mongoose
	}
}
