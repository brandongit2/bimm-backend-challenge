import path from "node:path"

import dirName from "@/utils/dirName"
import type {CodegenConfig} from "@graphql-codegen/cli"

const config: CodegenConfig = {
	schema: path.resolve(dirName(import.meta.url), `./schema.graphql`),
	generates: {
		[path.resolve(dirName(import.meta.url), `./resolvers-types.ts`)]: {
			plugins: [`typescript`, `typescript-resolvers`],
		},
	},
}
export default config
