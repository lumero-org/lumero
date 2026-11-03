import { NextResponse } from "next/server";
import { sendOrderConfirmationEmails } from "@/lib/emailService";
import { Order } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = body.order as Order;

    if (!order || !order.id || !order.customer_email) {
      return NextResponse.json(
        { error: "Complete order object with valid customer email is required" },
        { status: 400 }
      );
    }

    const result = await sendOrderConfirmationEmails(order);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error sending order confirmation";
    console.error("[API /api/email/order-confirmation] Exception:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

