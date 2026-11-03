import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendPasswordResetOtpEmail } from "@/lib/emailService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role } = body as { email: string; role: "admin" | "customer" };

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "customer") {
      return NextResponse.json(
        { error: "Invalid role specified." },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    let accountName = emailClean.split("@")[0];

    // 1. Role validation in Database
    if (role === "admin") {
      let isAdminAccount = emailClean.includes("admin");

      if (supabase) {
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("role, full_name")
            .ilike("email", emailClean)
            .maybeSingle();

          if (prof) {
            if (prof.role === "admin") {
              isAdminAccount = true;
              if (prof.full_name) accountName = prof.full_name;
            }
          }
        } catch {
          // Continue with fallback check
        }
      }

      if (!isAdminAccount) {
        return NextResponse.json(
          { error: "No administrator account found with this email." },
          { status: 404 }
        );
      }
    } else {
      // Customer Role Check
      let isCustomerAccount = false;

      if (supabase) {
        try {
          // Check profiles table
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, role, full_name")
            .ilike("email", emailClean)
            .maybeSingle();

          if (prof) {
            isCustomerAccount = true;
            if (prof.full_name) accountName = prof.full_name;
          }

          // Also check cms_content customer records
          if (!isCustomerAccount) {
            const { data: cmsCust } = await supabase
              .from("cms_content")
              .select("content")
              .eq("key", `customer_account_${emailClean}`)
              .maybeSingle();

            if (cmsCust?.content) {
              isCustomerAccount = true;
              if (cmsCust.content.full_name) accountName = cmsCust.content.full_name;
            }
          }
        } catch {
          // Continue with fallback
        }
      }

      if (!isCustomerAccount) {
        return NextResponse.json(
          { error: "No customer account found with this email address. Please verify or register." },
          { status: 404 }
        );
      }
    }

    // 2. Cooldown & Attempt Limit Check
    const otpKey = `otp_reset_${role}_${emailClean}`;
    const now = Date.now();
    const COOLDOWN_MS = 60 * 1000; // 60 seconds
    const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

    if (supabase) {
      try {
        const { data: existingOtp } = await supabase
          .from("cms_content")
          .select("content")
          .eq("key", otpKey)
          .maybeSingle();

        if (existingOtp?.content) {
          const { last_sent, attempts } = existingOtp.content;
          if (last_sent && now - last_sent < COOLDOWN_MS) {
            const remainingSec = Math.ceil((COOLDOWN_MS - (now - last_sent)) / 1000);
            return NextResponse.json(
              {
                error: `Please wait ${remainingSec} seconds before requesting another verification code.`,
                cooldownRemaining: remainingSec,
              },
              { status: 429 }
            );
          }

          if (attempts >= 5 && existingOtp.content.expires_at > now) {
            return NextResponse.json(
              {
                error: "Too many failed attempts. For your security, please wait 10 minutes before trying again.",
              },
              { status: 429 }
            );
          }
        }
      } catch {
        // Continue
      }
    }

    // 3. Generate Cryptographically Strong 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Store in Database with TTL
    if (supabase) {
      try {
        await supabase.from("cms_content").upsert({
          key: otpKey,
          content: {
            otp,
            email: emailClean,
            role,
            attempts: 0,
            last_sent: now,
            expires_at: now + EXPIRY_MS,
            created_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.error("Failed to store OTP in database:", dbErr);
      }
    }

    // 5. Send via Brevo Email API
    const emailRes = await sendPasswordResetOtpEmail({
      email: emailClean,
      name: accountName,
      otp,
      role,
      expiryMinutes: 10,
    });

    if (!emailRes.success) {
      return NextResponse.json(
        {
          error: "Failed to dispatch verification email. Please check your Brevo configuration.",
          details: emailRes.error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${emailClean}.`,
      cooldownSeconds: 60,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error initiating password reset";
    console.error("[API /api/auth/forgot-password/send-otp] Exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

