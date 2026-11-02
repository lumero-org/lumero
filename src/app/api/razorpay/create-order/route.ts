import { NextRequest, NextResponse } from "next/server";

const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

const isRazorpayConfigured = Boolean(
  razorpayKeyId &&
  razorpayKeySecret &&
  !razorpayKeyId.includes("yourKeyIdHere") &&
  !razorpayKeyId.includes("lumeroDemoKey")
);

export async function POST(req: NextRequest) {
  try {
    const { amount, receipt = `rcpt_${Date.now()}`, notes = {} } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Amount in paise (e.g. ₹100 = 10000 paise)
    const amountInPaise = Math.round(amount * 100);

    if (isRazorpayConfigured) {
      const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Razorpay order creation failed:", errorData);
        return NextResponse.json(
          { error: errorData.error?.description || "Razorpay API error" },
          { status: 500 }
        );
      }

      const orderData = await response.json();
      return NextResponse.json({
        id: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        key_id: razorpayKeyId,
      });
    }

    // Interactive Demo / Test Fallback Mode
    const simulatedOrderId = `order_demo_${Date.now()}`;
    return NextResponse.json({
      id: simulatedOrderId,
      amount: amountInPaise,
      currency: "INR",
      key_id: razorpayKeyId || "rzp_test_lumeroDemo",
      demoMode: true,
      message: "Order generated in test mode. Set RAZORPAY_KEY_SECRET in .env for production.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Razorpay error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

