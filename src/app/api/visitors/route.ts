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

    return NextResponse.json({ visitors });
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
