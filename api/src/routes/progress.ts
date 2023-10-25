import {type RouteHandlerMethod} from "fastify"

import type {Http2SecureServer} from "http2"

import {getProgress} from "@/services/dataCollectionState"

const progress: RouteHandlerMethod<Http2SecureServer> = async function () {
	return getProgress()
}

export default progress
