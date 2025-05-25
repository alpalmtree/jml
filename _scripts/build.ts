import { bundle } from "jsr:@deno/emit"

const result = await bundle(`${Deno.cwd()}/src/html.ts`, { minify: true})
Deno.writeTextFileSync(`${Deno.cwd()}/dist/html.esm.js`, result.code)