import { bundle } from "jsr:@deno/emit"

const result = await bundle(`${Deno.cwd()}/src/html.ts`)
Deno.writeTextFileSync(`${Deno.cwd()}/example/app/public/html.esm.js`, result.code)