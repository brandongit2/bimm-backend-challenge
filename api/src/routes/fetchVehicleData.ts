import {type RouteHandlerMethod} from "fastify"

import type {Http2SecureServer} from "http2"

import {collectData} from "@/services/collectData"
import {getProgress, setProgressStatus, setProgressTotal} from "@/services/dataCollectionState"
import {DataFetcher} from "@/utils/DataFetcher"
import {fastify} from "@/utils/server"

const fetchVehicleData: RouteHandlerMethod<Http2SecureServer> = async function (request, reply) {
	if (getProgress().status === `running`)
		return reply.type(`application/json`).code(429).send({error: `Data collection is already running.`})

	try {
		setProgressStatus(`running`)

		// Get all makes
		const jsonData = await new DataFetcher().fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML`)
		const allVehicleMakesRaw = jsonData.Response.Results[0].AllVehicleMakes as any[]
		const allVehicleMakes = allVehicleMakesRaw.map((make: any) => ({
			makeId: make.Make_ID[0] as string,
			makeName: make.Make_Name[0] as string,
		}))

		// Begin data collection
		setProgressTotal(allVehicleMakes.length)
		collectData(allVehicleMakes, this.mongoose) // Purposefully not awaited because this is a background task
		fastify.log.info(`Data collection started.`)

		return reply
			.type(`application/json`)
			.code(200)
			.send({text: `Data collection started. Use the /progress endpoint to check on the progress.`})
	} catch (error) {
		setProgressStatus(`idle`)
		fastify.log.error(`Error fetching data: ${error.message}`)
		fastify.log.error(error)
		return reply.code(500).send({error: `Internal Server Error`})
	}
}

export default fetchVehicleData
