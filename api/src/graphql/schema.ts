import {createSchema} from "graphql-yoga"
import {readFileSync} from "node:fs"
import path from "node:path"

import type {Resolvers} from "./resolvers-types"
import {VehicleMake} from "@/models/VehicleMake"
import dirName from "@/utils/dirName"
import type {FastifyReply, FastifyRequest, RouteGenericInterface} from "fastify"
import type {Http2SecureServer} from "http2"
import type mongoose from "mongoose"

export type GqlContext = {
	req: FastifyRequest<RouteGenericInterface, Http2SecureServer>
	reply: FastifyReply<Http2SecureServer>
	mongoose: typeof mongoose
}

const resolvers: Resolvers<GqlContext> = {
	Query: {
		vehicleMakes: async (obj, {makeId, makeName}) => {
			const query: Record<string, string> = {}
			if (makeId) query.makeId = makeId
			if (makeName) query.makeName = makeName

			const vehicleMakes = await VehicleMake.find(query).select(`-_id`).exec()
			return vehicleMakes.map((make) => make.toObject())
		},
	},
}

export const schema = createSchema<GqlContext>({
	typeDefs: readFileSync(path.resolve(dirName(import.meta.url), `./schema.graphql`), `utf-8`),
	resolvers,
})
