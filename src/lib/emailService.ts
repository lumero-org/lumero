import { sendBrevoEmail } from "@/lib/brevo";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types";
import {
  generatePasswordResetOtpHtml,
  generateWelcomeEmailHtml,
  generateOrderConfirmationCustomerHtml,
  generateOrderConfirmationAdminHtml,
  generateOrderShippedHtml,
} from "@/lib/emailTemplates";

/**
 * 1. Send Password Reset OTP Email
 */
export async function sendPasswordResetOtpEmail(params: {
  email: string;
  name: string;
  otp: string;
  role: "admin" | "customer";
  expiryMinutes?: number;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const expiryMinutes = params.expiryMinutes || 10;
    const htmlContent = generatePasswordResetOtpHtml({
      name: params.name,
      otp: params.otp,
      role: params.role,
      expiryMinutes,
    });

    const res = await sendBrevoEmail({
      to: [{ email: params.email, name: params.name }],
      subject: `Your ${params.role === "admin" ? "Admin " : ""}Verification Code: ${params.otp} - LUMERO`,
      htmlContent,
      textContent: `Your verification code is ${params.otp}. It is valid for ${expiryMinutes} minutes.`,
      tags: ["password-reset", params.role],
    });

    return { success: true, messageId: res.messageId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send OTP email";
    console.error("[Brevo Email Service] Error sending Password Reset OTP:", msg);
    return { success: false, error: msg };
  }
}

/**
 * 2. Send Customer Welcome Email
 */
export async function sendCustomerWelcomeEmail(params: {
  email: string;
  name: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const htmlContent = generateWelcomeEmailHtml({
      name: params.name,
      email: params.email,
    });

    const res = await sendBrevoEmail({
      to: [{ email: params.email, name: params.name }],
      subject: `Welcome to LUMERO, ${params.name}`,
      htmlContent,
      textContent: `Welcome to LUMERO, ${params.name}! Your private client account has been created.`,
      tags: ["welcome", "customer"],
    });

    return { success: true, messageId: res.messageId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send welcome email";
    console.error("[Brevo Email Service] Error sending Welcome Email:", msg);
    return { success: false, error: msg };
  }
}

/**
 * 3. Send Order Confirmation Emails (to Customer and Admin)
 * With Idempotency Protection to prevent duplicate emails
 */
export async function sendOrderConfirmationEmails(order: Order): Promise<{
  customerEmailSent: boolean;
  adminEmailSent: boolean;
  errors?: string[];
}> {
  const errors: string[] = [];
  let customerEmailSent = false;
  let adminEmailSent = false;

  // Idempotency check via Supabase cms_content
  const idempotencyKey = `order_confirmed_email_${order.id}`;
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", idempotencyKey)
        .maybeSingle();

      if (existing?.content?.sent) {
        console.log(`[Brevo Email Service] Order confirmation already transmitted for order ${order.id}. Skipping duplicate.`);
        return { customerEmailSent: true, adminEmailSent: true };
      }
    } catch {
      // Continue if cms query fails
    }
  }

  // A. Customer Confirmation Email
  try {
    const customerHtml = generateOrderConfirmationCustomerHtml({ order });
    await sendBrevoEmail({
      to: [{ email: order.customer_email, name: order.customer_name }],
      subject: `Order Confirmation #${order.order_number} - LUMERO`,
      htmlContent: customerHtml,
      textContent: `Your LUMERO order #${order.order_number} for ₹${order.total_amount.toLocaleString("en-IN")} is confirmed.`,
      tags: ["order-confirmation", "customer"],
    });
    customerEmailSent = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send customer order confirmation";
    console.error("[Brevo Email Service] Error sending customer order confirmation:", msg);
    errors.push(msg);
  }

  // B. Admin Order Alert Email
  try {
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.BREVO_SENDER_EMAIL ||
      "admin@lumero.com";

    if (adminEmail && adminEmail.includes("@")) {
      const adminHtml = generateOrderConfirmationAdminHtml({ order });
      await sendBrevoEmail({
        to: [{ email: adminEmail.trim(), name: "LUMERO Store Admin" }],
        subject: `[ALERT] New Order #${order.order_number} received from ${order.customer_name}`,
        htmlContent: adminHtml,
        textContent: `New order #${order.order_number} received: ₹${order.total_amount.toLocaleString("en-IN")} from ${order.customer_name}.`,
        tags: ["order-alert", "admin"],
      });
      adminEmailSent = true;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send admin order alert";
    console.error("[Brevo Email Service] Error sending admin order alert:", msg);
    errors.push(msg);
  }

  // Record idempotency mark
  if (supabase && (customerEmailSent || adminEmailSent)) {
    try {
      await supabase.from("cms_content").upsert({
        key: idempotencyKey,
        content: {
          sent: true,
          order_id: order.id,
          sent_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Ignore cms upsert error
    }
  }

  return { customerEmailSent, adminEmailSent, errors };
}

/**
 * 4. Send Order Shipped / Logistics Tracking Email
 * With Idempotency Protection to prevent duplicate emails
 */
export async function sendOrderShippedEmail(params: {
  order: Order;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { order, courierName, trackingNumber, trackingUrl } = params;

  // Idempotency check via Supabase cms_content
  const idempotencyKey = `order_shipped_email_${order.id}`;
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from("cms_content")
        .select("content")
        .eq("key", idempotencyKey)
        .maybeSingle();

      if (existing?.content?.sent) {
        console.log(`[Brevo Email Service] Shipping notification already transmitted for order ${order.id}. Skipping duplicate.`);
        return { success: true, messageId: existing.content.messageId };
      }
    } catch {
      // Continue if check fails
    }
  }

  try {
    const htmlContent = generateOrderShippedHtml({
      order,
      courierName,
      trackingNumber,
      trackingUrl,
    });

    const res = await sendBrevoEmail({
      to: [{ email: order.customer_email, name: order.customer_name }],
      subject: `Your LUMERO Order #${order.order_number} has been Shipped!`,
      htmlContent,
      textContent: `Your LUMERO Order #${order.order_number} has been dispatched.${trackingNumber ? ` Tracking Number: ${trackingNumber}` : ""}`,
      tags: ["order-shipped", "customer"],
    });

    // Record idempotency mark
    if (supabase) {
      try {
        await supabase.from("cms_content").upsert({
          key: idempotencyKey,
          content: {
            sent: true,
            order_id: order.id,
            tracking_number: trackingNumber || null,
            courier_name: courierName || null,
            messageId: res.messageId,
            sent_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        });
      } catch {
        // Ignore cms upsert error
      }
    }

    return { success: true, messageId: res.messageId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send shipping notification";
    console.error("[Brevo Email Service] Error sending shipping notification:", msg);
    return { success: false, error: msg };
  }
}

