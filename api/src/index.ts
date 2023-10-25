"use strict"

import "dotenv/config"

import fetchVehicleData from "@/routes/fetchVehicleData"
import {fastify} from "@/server"

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
