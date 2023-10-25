import {type RouteHandlerMethod} from "fastify"

import {VehicleMake} from "@/models/VehicleMake"
import type {Http2SecureServer} from "http2"

const savedVehicleData: RouteHandlerMethod<Http2SecureServer> = async function () {
	const vehicleMakes = await VehicleMake.find({}, {projection: {_id: 0}}).exec()

	return {vehicleMakes}
}

export default savedVehicleData
