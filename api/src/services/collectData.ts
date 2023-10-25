import {NUM_DATA_FETCHERS} from "@/config"
import {client, db} from "@/database"
import {fastify} from "@/server"
import {DataFetcher} from "@/utils/DataFetcher"

import {setProgressDone, setProgressStatus} from "./dataCollectionState"

export const collectData = async (
	allVehicleMakes: {
		makeId: string
		makeName: string
	}[],
) => {
	const dataFetchers = new Array(NUM_DATA_FETCHERS).fill(null).map(() => new DataFetcher())

	let progress = 0
	const vehicleTypes = await Promise.all(
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

	fastify.log.info(`Data collection finished. Writing to database...`)

	const session = client.startSession()
	try {
		await session.withTransaction(async () => {
			await db.collection(`vehicleMakes`).deleteMany({}, {session})
			await db.collection(`vehicleMakes`).insertMany(vehicleTypes, {session})
		})
	} finally {
		session.endSession()
		setProgressStatus(`idle`)
	}

	fastify.log.info(`Data written to database.`)

	setProgressStatus(`idle`)
}
