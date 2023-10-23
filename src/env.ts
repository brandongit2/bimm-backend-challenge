import invariant from "tiny-invariant"

invariant(process.env.NODE_ENV, `process.env.NODE_ENV is not defined`)
export const NODE_ENV = process.env.NODE_ENV
