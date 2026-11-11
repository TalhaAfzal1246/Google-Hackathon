import { NextResponse } from "next/server";
import { resetDemoState } from "@/lib/store";

export async function POST() {
  resetDemoState();
  return NextResponse.json({ success: true, message: "Demo state successfully reset to default." });
}
