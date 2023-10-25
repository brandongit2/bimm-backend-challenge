import {type RouteHandlerMethod} from "fastify"

import type {Http2SecureServer} from "http2"

import {VehicleMake} from "@/models/VehicleMake"

const savedVehicleData: RouteHandlerMethod<Http2SecureServer> = async function () {
	const vehicleMakes = await VehicleMake.find({}).select(`-_id -__v -vehicleTypes._id`).exec()

	return {vehicleMakes}
}

export default savedVehicleData
