import pLimit from "p-limit"
import xml2js from "xml2js"

import {fastify} from "@/server"

let globalUserAgentMajor = 1

export class DataFetcher {
	userAgentMajor = globalUserAgentMajor++
	userAgentMinor = 0
	limit = pLimit(5) // Max 5 concurrent requests per fetcher. More than that and you'll hit rate limits.

	async fetch(url: string, retry = false): Promise<Record<string, any>> {
		const res = await this.limit(() =>
			fetch(url, {
				headers: {"User-Agent": `Mozilla/${this.userAgentMajor}.${this.userAgentMinor}`},
			}),
		)
		const xmlData = await res.text()

		try {
			const jsonData = await xml2js.parseStringPromise(xmlData)
			return jsonData
		} catch (error) {
			if (retry) throw error

			this.userAgentMinor++
			fastify.log.info(`User agent updated to ${this.userAgentMajor}.${this.userAgentMinor}`)
			return await this.fetch(url, true)
		}
	}
}
