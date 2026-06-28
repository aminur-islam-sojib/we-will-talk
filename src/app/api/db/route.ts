import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  const appInfo = { status: "ok", env: process.env.NODE_ENV || "development" };

  try {
    const client = await clientPromise;
    const admin = client.db().admin();
    // ping the server to confirm connectivity
    const ping = await (admin as any).ping();

    return NextResponse.json({ app: appInfo, db: { connected: true, ping } });
  } catch (err) {
    return NextResponse.json(
      { app: appInfo, db: { connected: false, error: String(err) } },
      { status: 500 },
    );
  }
}
