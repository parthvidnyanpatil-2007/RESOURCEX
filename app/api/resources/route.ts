import { NextResponse } from "next/server";
import { getResources, createResource } from "@/lib/db";

export async function GET() {
  try {
    const resources = await getResources();
    return NextResponse.json({ success: true, data: resources });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.category || !body.location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, category, location" },
        { status: 400 }
      );
    }
    const created = await createResource(body);
    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
