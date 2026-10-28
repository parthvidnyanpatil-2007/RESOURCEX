import { NextResponse } from "next/server";
import { getBookings, createBooking } from "@/lib/db";

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ success: true, data: bookings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.resourceId || !body.date || !body.startTime || !body.durationHours) {
      return NextResponse.json(
        { success: false, error: "Missing required booking fields" },
        { status: 400 }
      );
    }
    const created = await createBooking(body);
    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
