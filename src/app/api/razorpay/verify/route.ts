import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    // If demo order or secret is demo/placeholder, auto verify
    if (
      razorpay_order_id.startsWith("order_demo_") ||
      !razorpayKeySecret ||
      razorpayKeySecret === "rzp_secret_demo"
    ) {
      return NextResponse.json({
        verified: true,
        demoMode: true,
        message: "Payment successfully simulated and verified.",
      });
    }

    if (!razorpay_signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verification error";
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

