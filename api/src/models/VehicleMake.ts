import mongoose from "mongoose"

export const VehicleMake = mongoose.model(
	`VehicleMake`,
	new mongoose.Schema({
		makeId: {type: String, required: true},
		makeName: {type: String, required: true},
		vehicleTypes: [
			{
				typeId: {type: String, required: true},
				typeName: {type: String, required: true},
			},
		],
	}),
)
