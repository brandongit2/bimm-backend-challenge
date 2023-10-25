import invariant from "tiny-invariant"

invariant(process.env.NODE_ENV, `process.env.NODE_ENV is not defined`)
export const NODE_ENV = process.env.NODE_ENV

invariant(process.env.DB_CONNECTION_STRING, `process.env.DB_CONNECTION_STRING is not defined`)
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING
