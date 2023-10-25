import {createYoga} from "graphql-yoga"

import type {GqlContext} from "./schema"

import {schema} from "./schema"
import {fastify} from "@/utils/server"

export const yoga = createYoga<GqlContext>({
	schema,
	logging: {
		debug: (...args) => args.forEach((arg) => fastify.log.debug(arg)),
		info: (...args) => args.forEach((arg) => fastify.log.info(arg)),
		warn: (...args) => args.forEach((arg) => fastify.log.warn(arg)),
		error: (...args) => args.forEach((arg) => fastify.log.error(arg)),
	},
})
