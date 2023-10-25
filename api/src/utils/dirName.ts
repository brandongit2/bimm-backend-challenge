import {dirname} from "node:path"
import {fileURLToPath} from "node:url"

export default function dirName(importMetaUrl: string) {
	return dirname(fileURLToPath(importMetaUrl))
}
