import { NextResponse } from "next/server";
import { sendOrderShippedEmail } from "@/lib/emailService";
import { Order } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order, courierName, trackingNumber, trackingUrl } = body;

    if (!order || !order.id || !order.customer_email) {
      return NextResponse.json(
        { error: "Valid order with customer email is required" },
        { status: 400 }
      );
    }

    const result = await sendOrderShippedEmail({
      order: order as Order,
      courierName,
      trackingNumber,
      trackingUrl,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error sending shipping email";
    console.error("[API /api/email/order-shipped] Exception:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

