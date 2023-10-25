import type {TMongoose} from "@/mongoose-plugin/TMongoose"

import {setProgressDone, setProgressStatus} from "./dataCollectionState"
import {NUM_DATA_FETCHERS} from "@/config"
import {VehicleMake} from "@/models/VehicleMake"
import {DataFetcher} from "@/utils/DataFetcher"
import {fastify} from "@/utils/server"

export const collectData = async (
	allVehicleMakes: {
		makeId: string
		makeName: string
	}[],
	mongoose: TMongoose,
) => {
	const dataFetchers = new Array(NUM_DATA_FETCHERS).fill(null).map(() => new DataFetcher())

	let progress = 0
	try {
		// eslint-disable-next-line no-var -- For access outside the try block
		var vehicleMakes = await Promise.all(
			allVehicleMakes.map(async (make, i) => {
				const dataFetcher = dataFetchers[i % dataFetchers.length]

				// Get vehicle types, normalize the data
				const jsonData = await dataFetcher.fetch(
					`https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${make.makeId}?format=xml`,
				)
				const vehicleTypesForMakeIdsRaw = (jsonData.Response.Results[0]?.VehicleTypesForMakeIds ?? []) as any[]
				const vehicleTypesForMakeIds = vehicleTypesForMakeIdsRaw.map((result) => ({
					typeId: result.VehicleTypeId[0] as string,
					typeName: result.VehicleTypeName[0] as string,
				}))

				setProgressDone(progress)
				if (++progress % 20 === 0) fastify.log.info(`Fetched ${progress}/${allVehicleMakes.length} makes.`)

				return {
					makeId: make.makeId,
					makeName: make.makeName,
					vehicleTypes: vehicleTypesForMakeIds,
				}
			}),
		)
	} catch (error) {
		// This is a bit of a silent error. Maybe in the future, functionality could be added to make it easier to verify
		// whether all the data was fetched successfully or not.
		setProgressStatus(`idle`)
		fastify.log.error(`Error fetching data: ${error.message}`)
		fastify.log.error(error)
		return
	}

	fastify.log.info(`Data collection finished. Writing to database...`)

	const session = await mongoose.startSession()
	try {
		await session.withTransaction(async () => {
			await VehicleMake.deleteMany({}, {session})
			await VehicleMake.insertMany(vehicleMakes, {session})
		})
	} catch (error) {
		fastify.log.error(`Error writing data to database: ${error.message}`)
		fastify.log.error(error)
	} finally {
		session.endSession()
		setProgressStatus(`idle`)
	}

	fastify.log.info(`Data written to database.`)

	setProgressStatus(`idle`)
}
