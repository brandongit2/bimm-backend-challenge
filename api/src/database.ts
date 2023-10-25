import {MongoClient} from "mongodb"

const uri = `mongodb://service-db:27017`

export const client = new MongoClient(uri)
export const db = client.db(`vehicleMakes`)
