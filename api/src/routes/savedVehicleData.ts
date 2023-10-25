import {type RouteHandlerMethod} from "fastify"

import {db} from "@/database"
import type {Http2SecureServer} from "http2"

const savedVehicleData: RouteHandlerMethod<Http2SecureServer> = async () => {
	const vehicleMakes = await db.collection(`vehicleMakes`).find({}).toArray()

	return {vehicleMakes}
}

export default savedVehicleData
