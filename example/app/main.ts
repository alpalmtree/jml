import { serveDir } from "jsr:@std/http/file-server";
import Index from "./pages/Index.ts";


Deno.serve((req) => {
  const pathname = new URL(req.url).pathname;
 if (pathname.startsWith("/static")) {

    return serveDir(req, {
      fsRoot: "public",
      urlRoot: "static",
    });
  }
  return new Response(Index().toString(), {
    headers: {
      "content-type": "html; charset=utf-8",
    },
  })
}
);
