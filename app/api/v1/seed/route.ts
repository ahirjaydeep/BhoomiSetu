import { NextResponse } from "next/server";
import { runFirestoreSeed } from "@/lib/firebase/seedEngine";

export async function POST() {
  try {
    const result = await runFirestoreSeed();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST(); // Allows triggering seeding directly from browser navigation
}
