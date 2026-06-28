import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

function getNetworkData(request: NextRequest) {
  return {
    ip: request.headers.get("x-visitor-ip") || "unknown",
    country: request.headers.get("x-visitor-country") || "unknown",
    city: request.headers.get("x-visitor-city") || "unknown",
    region: request.headers.get("x-visitor-region") || "unknown",
    userAgent: request.headers.get("x-visitor-user-agent") || "unknown",
  };
}

async function readClientData(request: NextRequest) {
  try {
    const text = await request.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "metrics endpoint ready",
  });
}

export async function POST(request: NextRequest) {
  try {
    const networkData = getNetworkData(request);
    const clientData = await readClientData(request);

    const payload = {
      ...networkData,
      ...clientData,
      receivedAt: new Date().toISOString(),
    };

    const db = await getDb();
    const result = await db.collection("visitors").insertOne(payload);

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
      payload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
