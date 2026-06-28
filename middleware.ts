import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/api/metrics"],
};

export function middleware(request: NextRequest) {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor || realIp || "unknown";

  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "unknown";
  const city =
    request.headers.get("x-vercel-ip-city") ||
    request.headers.get("cf-ipcity") ||
    "unknown";
  const region =
    request.headers.get("x-vercel-ip-country-region") ||
    request.headers.get("cf-region") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-visitor-ip", ip);
  requestHeaders.set("x-visitor-country", country);
  requestHeaders.set("x-visitor-city", city);
  requestHeaders.set("x-visitor-region", region);
  requestHeaders.set("x-visitor-user-agent", userAgent);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
