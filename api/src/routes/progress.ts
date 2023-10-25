import {type RouteHandlerMethod} from "fastify"

import {getProgress} from "@/services/dataCollectionState"
import type {Http2SecureServer} from "http2"

const progress: RouteHandlerMethod<Http2SecureServer> = async function () {
	return getProgress()
}

export default progress
