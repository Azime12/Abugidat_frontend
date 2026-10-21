import { NextRequest } from "next/server.js";
import createMiddleware from "next-intl/middleware.js";

const routing = {
  locales: ["am", "en", "om"],
  defaultLocale: "am",
  localePrefix: "as-needed",
};

const i18nMiddleware = createMiddleware(routing);

const req = new NextRequest("http://localhost:3000/");
const res = i18nMiddleware(req);
console.log("Root rewrite:", res.headers.get("x-middleware-rewrite"));

const req2 = new NextRequest("http://localhost:3000/login");
const res2 = i18nMiddleware(req2);
console.log("Login rewrite:", res2.headers.get("x-middleware-rewrite"));

const req3 = new NextRequest("http://localhost:3000/am/login");
const res3 = i18nMiddleware(req3);
console.log("AM Login rewrite:", res3.headers.get("x-middleware-rewrite"));
