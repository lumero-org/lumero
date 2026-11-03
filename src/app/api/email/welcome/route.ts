import { NextResponse } from "next/server";
import { sendCustomerWelcomeEmail } from "@/lib/emailService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const result = await sendCustomerWelcomeEmail({
      email: email.trim().toLowerCase(),
      name: name?.trim() || "Valued Client",
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error sending welcome email";
    console.error("[API /api/email/welcome] Exception:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

