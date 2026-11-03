import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, otp, newPassword } = body as {
      email: string;
      role: "admin" | "customer";
      otp: string;
      newPassword: string;
    };

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const otpKey = `otp_reset_${role}_${emailClean}`;
    const now = Date.now();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    // 1. Fetch OTP record
    const { data: recordRow, error: fetchErr } = await supabase
      .from("cms_content")
      .select("content")
      .eq("key", otpKey)
      .maybeSingle();

    if (fetchErr || !recordRow?.content) {
      return NextResponse.json(
        { error: "No active verification request found. Please request a new code." },
        { status: 400 }
      );
    }

    const { otp: storedOtp, expires_at, attempts = 0 } = recordRow.content;

    // 2. Check Expiry
    if (now > expires_at) {
      // Clean up expired record
      await supabase.from("cms_content").delete().eq("key", otpKey);
      return NextResponse.json(
        { error: "The verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Check Attempt Limits
    if (attempts >= 5) {
      await supabase.from("cms_content").delete().eq("key", otpKey);
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a fresh code." },
        { status: 429 }
      );
    }

    // 4. Verify OTP Code
    if (storedOtp.trim() !== otp.trim()) {
      // Increment failed attempts
      await supabase.from("cms_content").upsert({
        key: otpKey,
        content: {
          ...recordRow.content,
          attempts: attempts + 1,
        },
        updated_at: new Date().toISOString(),
      });

      const remainingAttempts = 4 - attempts;
      return NextResponse.json(
        {
          error: `Incorrect verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : "Code locked."}`,
        },
        { status: 400 }
      );
    }

    // 5. Update Password Securely
    const newAuthToken = btoa(encodeURIComponent(`${emailClean}:${newPassword}`));

    if (role === "customer") {
      // Fetch or update customer record in cms_content
      const { data: existingCust } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", `customer_account_${emailClean}`)
        .maybeSingle();

      const custPayload = existingCust?.content || {
        id: `cust_${Date.now()}`,
        email: emailClean,
        full_name: emailClean.split("@")[0],
        role: "customer",
        created_at: new Date().toISOString(),
      };

      await supabase.from("cms_content").upsert({
        key: `customer_account_${emailClean}`,
        content: {
          ...custPayload,
          auth_token: newAuthToken,
          updated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      });

      // Update profiles table
      try {
        await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .ilike("email", emailClean);
      } catch {
        // Continue
      }
    } else {
      // Admin Password Update
      await supabase.from("cms_content").upsert({
        key: `admin_account_credentials`,
        content: {
          email: emailClean,
          auth_token: newAuthToken,
          updated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      });
    }

    // 6. Delete OTP session on success to prevent replay attacks
    await supabase.from("cms_content").delete().eq("key", otpKey);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error resetting password";
    console.error("[API /api/auth/forgot-password/reset-password] Exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

