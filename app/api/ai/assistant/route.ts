import { NextResponse } from "next/server";
import { askGeminiResourceAssistant } from "@/lib/gemini";
import { getResources } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }
    const resources = await getResources();
    const result = await askGeminiResourceAssistant(
      prompt,
      resources.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        description: r.description,
        location: r.location,
      }))
    );
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
