import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const visitors = await db
      .collection("visitors")
      .find({})
      .sort({ receivedAt: -1 })
      .limit(300)
      .toArray();

    const tracked = await db.collection("tracked_ips").find({}).toArray();

    return NextResponse.json({
      visitors,
      trackedIps: tracked.map((item) => item.ip),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load visitors",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ip = typeof body?.ip === "string" ? body.ip : "";

    if (!ip) {
      return NextResponse.json(
        { success: false, error: "IP is required" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const collection = db.collection("tracked_ips");
    const existing = await collection.findOne({ ip });

    if (existing) {
      await collection.deleteOne({ ip });
      return NextResponse.json({ success: true, marked: false, ip });
    }

    await collection.insertOne({ ip, createdAt: new Date().toISOString() });
    return NextResponse.json({ success: true, marked: true, ip });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update tracked IP",
      },
      { status: 500 },
    );
  }
}
