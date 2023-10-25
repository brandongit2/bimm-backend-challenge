"use strict"

import "dotenv/config"

import fetchVehicleData from "@/routes/fetchVehicleData"
import {fastify} from "@/utils/server"

import {yoga} from "./graphql/yoga"
import progress from "./routes/progress"
import savedVehicleData from "./routes/savedVehicleData"

// Just a dummy route to confirm the server is up and running
fastify.get(`/`, async (request, reply) => {
	reply.type(`application/json`).code(200)
	return {text: `Server is working :)`}
})

// The primary application route
fastify.get(`/fetch-vehicle-data`, fetchVehicleData)

// Get the current progress of data fetching
fastify.get(`/progress`, progress)

// Get the saved vehicle data from the database
fastify.get(`/saved-vehicle-data`, savedVehicleData)

// GraphQL route with GraphQL Yoga
fastify.route({
	url: yoga.graphqlEndpoint,
	method: [`GET`, `POST`, `OPTIONS`],
	handler: async function (req, reply) {
		const response = await yoga.handleNodeRequest(req, {req, reply, mongoose: this.mongoose})
		response.headers.forEach((value, key) => {
			reply.header(key, value)
		})

		reply.status(response.status)
		reply.send(response.body)

		return reply
	},
})
