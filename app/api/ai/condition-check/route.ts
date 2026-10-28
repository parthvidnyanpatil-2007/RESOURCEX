import { NextResponse } from "next/server";
import { inspectConditionReport } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { initialNotes, returnNotes } = await req.json();
    const result = await inspectConditionReport(initialNotes, returnNotes);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
