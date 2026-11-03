import { Order } from "@/types";

const BRAND_NAME = "LUMERO";
const BRAND_TAGLINE = "Modern Spaces • Better Living";
const BRAND_COLOR_PRIMARY = "#1C1917"; // Stone-900
const BRAND_COLOR_ACCENT = "#D97706"; // Amber-600
const BRAND_COLOR_BG = "#FAF8F5"; // Ivory / Cream
const BRAND_COLOR_TEXT = "#292524"; // Stone-800
const BRAND_COLOR_MUTED = "#78716C"; // Stone-500

/**
 * Common base wrapper for all luxury emails
 */
function wrapHtmlEmail(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND_COLOR_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND_COLOR_TEXT}; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 12px !important; }
      .content-card { padding: 24px 20px !important; border-radius: 20px !important; }
      .item-row { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_COLOR_BG};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLOR_BG}; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: 300; letter-spacing: 0.28em; color: ${BRAND_COLOR_PRIMARY}; display: block; text-transform: uppercase;">
                ${BRAND_NAME}
              </span>
              <span style="font-size: 9px; letter-spacing: 0.35em; color: ${BRAND_COLOR_MUTED}; text-transform: uppercase; display: block; margin-top: 4px;">
                ${BRAND_TAGLINE}
              </span>
            </td>
          </tr>

          <!-- CARD BODY -->
          <tr>
            <td>
              <table role="presentation" class="content-card" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; border: 1px solid #E7E5E4; box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 36px 32px;">
                <tr>
                  <td>
                    ${bodyContent}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top: 28px; padding-bottom: 12px; font-size: 11px; color: ${BRAND_COLOR_MUTED}; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; letter-spacing: 0.1em; text-transform: uppercase;">
                ${BRAND_NAME} • Handcrafted Architectural Home Décor
              </p>
              <p style="margin: 0; font-size: 10px; color: #A8A29E;">
                This is an automated operational transmission. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. PASSWORD RESET OTP EMAIL
 */
export function generatePasswordResetOtpHtml(params: {
  name: string;
  otp: string;
  role: "admin" | "customer";
  expiryMinutes: number;
}): string {
  const roleLabel = params.role === "admin" ? "Administrator" : "Customer";
  const body = `
    <div style="text-align: center; padding-bottom: 8px;">
      <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND_COLOR_ACCENT}; background-color: #FEF3C7; padding: 4px 12px; border-radius: 9999px;">
        ${roleLabel} Security
      </span>
      <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 500; color: ${BRAND_COLOR_PRIMARY}; margin: 16px 0 8px 0;">
        Reset Your Password
      </h1>
      <p style="font-size: 13px; color: ${BRAND_COLOR_MUTED}; margin: 0 0 24px 0; line-height: 1.5;">
        Dear ${params.name || "User"}, we received a request to reset your ${roleLabel.toLowerCase()} password. Use the verification code below to proceed:
      </p>

      <!-- OTP BOX -->
      <div style="background-color: ${BRAND_COLOR_PRIMARY}; border-radius: 16px; padding: 20px; display: inline-block; min-width: 220px; margin: 0 auto 24px auto;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 0.25em; color: #FFFFFF; display: block;">
          ${params.otp}
        </span>
      </div>

      <p style="font-size: 12px; color: ${BRAND_COLOR_MUTED}; margin: 0 0 16px 0;">
        This code is valid for <strong>${params.expiryMinutes} minutes</strong> and can only be used once.
      </p>

      <div style="background-color: #F5F5F4; border-radius: 12px; padding: 14px; text-align: left; font-size: 11px; color: ${BRAND_COLOR_MUTED}; line-height: 1.5;">
        <strong>Security Notice:</strong> If you did not initiate this request, your account remains secure. Please ignore this message or review your account credentials immediately.
      </div>
    </div>
  `;
  return wrapHtmlEmail("Password Reset OTP", body);
}

/**
 * 2. CUSTOMER WELCOME EMAIL
 */
export function generateWelcomeEmailHtml(params: { name: string; email: string }): string {
  const body = `
    <div style="text-align: center; padding-bottom: 8px;">
      <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND_COLOR_ACCENT}; background-color: #FEF3C7; padding: 4px 12px; border-radius: 9999px;">
        Sanctuary Privileges
      </span>
      <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: ${BRAND_COLOR_PRIMARY}; margin: 16px 0 12px 0;">
        Welcome to ${BRAND_NAME}, ${params.name}
      </h1>
      <p style="font-size: 14px; color: ${BRAND_COLOR_MUTED}; margin: 0 0 24px 0; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;">
        Your private client account has been created. Discover hand-carved travertine trays, architectural ambient lighting, and bespoke interior statements sculpted for modern living.
      </p>

      <!-- FEATURES GRID -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; text-align: left; border-top: 1px solid #F5F5F4; border-bottom: 1px solid #F5F5F4; padding: 20px 0;">
        <tr>
          <td style="padding: 10px 0;">
            <strong style="font-size: 13px; color: ${BRAND_COLOR_PRIMARY}; display: block; margin-bottom: 2px;">• Express Pan-India Delivery</strong>
            <span style="font-size: 12px; color: ${BRAND_COLOR_MUTED};">Fragile-safe double reinforced courier logistics on all orders.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0;">
            <strong style="font-size: 13px; color: ${BRAND_COLOR_PRIMARY}; display: block; margin-bottom: 2px;">• Saved Address & Order Archive</strong>
            <span style="font-size: 12px; color: ${BRAND_COLOR_MUTED};">Enjoy 1-click checkout and access real-time fulfillment history in your Account Sanctuary.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0;">
            <strong style="font-size: 13px; color: ${BRAND_COLOR_PRIMARY}; display: block; margin-bottom: 2px;">• Handcrafted Authenticity</strong>
            <span style="font-size: 12px; color: ${BRAND_COLOR_MUTED};">Every piece is verified for material purity, stone density, and artisanal craftsmanship.</span>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="padding-top: 12px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shop" style="display: inline-block; background-color: ${BRAND_COLOR_PRIMARY}; color: #FFFFFF; font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 9999px;">
          Explore Curated Catalog →
        </a>
      </div>
    </div>
  `;
  return wrapHtmlEmail("Welcome to LUMERO", body);
}

/**
 * 3. ORDER CONFIRMATION EMAIL (Customer version)
 */
export function generateOrderConfirmationCustomerHtml(params: { order: Order }): string {
  const { order } = params;
  const itemsHtml = order.items
    .map(
      (it) => `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #F5F5F4;">
        <strong style="font-size: 13px; color: ${BRAND_COLOR_PRIMARY}; display: block;">${it.product_name}</strong>
        <span style="font-size: 11px; color: ${BRAND_COLOR_MUTED};">Qty: ${it.quantity} × ₹${it.price.toLocaleString("en-IN")}</span>
      </td>
      <td align="right" style="padding: 14px 0; border-bottom: 1px solid #F5F5F4; font-family: Georgia, serif; font-size: 14px; font-weight: 500; color: ${BRAND_COLOR_PRIMARY};">
        ₹${(it.price * it.quantity).toLocaleString("en-IN")}
      </td>
    </tr>
  `
    )
    .join("");

  const body = `
    <div>
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #047857; background-color: #D1FAE5; padding: 4px 12px; border-radius: 9999px;">
          Order Confirmed
        </span>
        <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 400; color: ${BRAND_COLOR_PRIMARY}; margin: 16px 0 6px 0;">
          Thank You, ${order.customer_name}
        </h1>
        <p style="font-size: 13px; color: ${BRAND_COLOR_MUTED}; margin: 0;">
          Order <strong>#${order.order_number}</strong> has been received and sent to our packing sanctuary.
        </p>
      </div>

      <!-- ITEMS TABLE -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
        <thead>
          <tr>
            <th align="left" style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${BRAND_COLOR_MUTED}; padding-bottom: 8px; border-bottom: 2px solid ${BRAND_COLOR_PRIMARY};">Item Description</th>
            <th align="right" style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${BRAND_COLOR_MUTED}; padding-bottom: 8px; border-bottom: 2px solid ${BRAND_COLOR_PRIMARY};">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- TOTALS -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; font-size: 12px;">
        <tr>
          <td style="padding: 4px 0; color: ${BRAND_COLOR_MUTED};">Subtotal</td>
          <td align="right" style="padding: 4px 0; color: ${BRAND_COLOR_PRIMARY};">₹${order.subtotal.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: ${BRAND_COLOR_MUTED};">Express Shipping</td>
          <td align="right" style="padding: 4px 0; color: ${BRAND_COLOR_PRIMARY};">${order.shipping_fee === 0 ? "Complimentary (₹0)" : `₹${order.shipping_fee.toLocaleString("en-IN")}`}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: ${BRAND_COLOR_PRIMARY}; border-top: 1px solid #E7E5E4;">Total Amount</td>
          <td align="right" style="padding: 8px 0; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: ${BRAND_COLOR_PRIMARY}; border-top: 1px solid #E7E5E4;">₹${order.total_amount.toLocaleString("en-IN")}</td>
        </tr>
      </table>

      <!-- DETAILS GRID -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; border-radius: 16px; padding: 18px; margin-bottom: 24px; font-size: 12px;">
        <tr>
          <td width="50%" valign="top" style="padding-right: 12px;">
            <strong style="color: ${BRAND_COLOR_PRIMARY}; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Delivery Address</strong>
            <p style="margin: 0; color: ${BRAND_COLOR_MUTED}; line-height: 1.5;">
              ${order.shipping_address.address}<br>
              ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.postal_code}<br>
              Contact: ${order.customer_phone}
            </p>
          </td>
          <td width="50%" valign="top" style="padding-left: 12px;">
            <strong style="color: ${BRAND_COLOR_PRIMARY}; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Payment Method</strong>
            <p style="margin: 0; color: ${BRAND_COLOR_MUTED}; line-height: 1.5;">
              ${order.payment_method === "cod" ? "Cash on Delivery (COD)" : "Online Verified Payment"}<br>
              Status: <span style="text-transform: uppercase; font-weight: 600;">${order.payment_status}</span>
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
  return wrapHtmlEmail(`Order Confirmed #${order.order_number}`, body);
}

/**
 * 4. ORDER CONFIRMATION EMAIL (Admin alert version)
 */
export function generateOrderConfirmationAdminHtml(params: { order: Order }): string {
  const { order } = params;
  const body = `
    <div>
      <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND_COLOR_ACCENT}; background-color: #FEF3C7; padding: 4px 12px; border-radius: 9999px;">
        Admin Fulfillment Alert
      </span>
      <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 500; color: ${BRAND_COLOR_PRIMARY}; margin: 14px 0 6px 0;">
        New Order Placed: #${order.order_number}
      </h1>
      <p style="font-size: 13px; color: ${BRAND_COLOR_MUTED}; margin: 0 0 20px 0;">
        A new customer order of <strong>₹${order.total_amount.toLocaleString("en-IN")}</strong> has been placed by <strong>${order.customer_name}</strong> (${order.customer_email}).
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; border-radius: 14px; padding: 14px; margin-bottom: 20px; font-size: 12px;">
        <tr>
          <td><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</td>
        </tr>
        <tr>
          <td><strong>Phone:</strong> ${order.customer_phone}</td>
        </tr>
        <tr>
          <td><strong>Destination:</strong> ${order.shipping_address.address}, ${order.shipping_address.city} ${order.shipping_address.postal_code}</td>
        </tr>
        <tr>
          <td><strong>Payment:</strong> ${order.payment_method.toUpperCase()} (${order.payment_status})</td>
        </tr>
        <tr>
          <td><strong>Total Items:</strong> ${order.items.reduce((s, it) => s + it.quantity, 0)} units</td>
        </tr>
      </table>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders" style="display: inline-block; background-color: ${BRAND_COLOR_PRIMARY}; color: #FFFFFF; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 12px 28px; border-radius: 9999px;">
          View in Admin Dashboard →
        </a>
      </div>
    </div>
  `;
  return wrapHtmlEmail(`[ADMIN ALERT] New Order #${order.order_number}`, body);
}

/**
 * 5. ORDER SHIPPED / TRACKING EMAIL
 */
export function generateOrderShippedHtml(params: {
  order: Order;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}): string {
  const { order, courierName, trackingNumber, trackingUrl } = params;

  const trackingBlock = trackingNumber
    ? `
      <div style="background-color: #FAF8F5; border-radius: 16px; border: 1px dashed #D6D3D1; padding: 18px; margin: 20px 0; text-align: center;">
        <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; color: ${BRAND_COLOR_MUTED}; display: block; margin-bottom: 4px;">
          Logistics Tracking
        </span>
        <strong style="font-family: 'Courier New', Courier, monospace; font-size: 18px; color: ${BRAND_COLOR_PRIMARY}; display: block; margin-bottom: 4px;">
          ${trackingNumber}
        </strong>
        ${courierName ? `<span style="font-size: 12px; color: ${BRAND_COLOR_MUTED}; display: block; margin-bottom: 12px;">Carrier: ${courierName}</span>` : ""}
        ${
          trackingUrl
            ? `<a href="${trackingUrl}" target="_blank" style="display: inline-block; background-color: ${BRAND_COLOR_PRIMARY}; color: #FFFFFF; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 10px 24px; border-radius: 9999px;">Track Consignment →</a>`
            : ""
        }
      </div>
    `
    : `
      <div style="background-color: #FAF8F5; border-radius: 16px; padding: 16px; margin: 20px 0; text-align: center; font-size: 12px; color: ${BRAND_COLOR_MUTED};">
        Carrier dispatch initiated via Express Courier Logistics. Live tracking details will be transmitted by SMS to <strong>${order.customer_phone}</strong>.
      </div>
    `;

  const body = `
    <div>
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #0369A1; background-color: #E0F2FE; padding: 4px 12px; border-radius: 9999px;">
          Dispatched & En Route
        </span>
        <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 400; color: ${BRAND_COLOR_PRIMARY}; margin: 16px 0 6px 0;">
          Your Order is on the Way
        </h1>
        <p style="font-size: 13px; color: ${BRAND_COLOR_MUTED}; margin: 0;">
          Order <strong>#${order.order_number}</strong> has departed our central fulfillment facility and is heading to your doorstep.
        </p>
      </div>

      ${trackingBlock}

      <div style="font-size: 12px; color: ${BRAND_COLOR_MUTED}; line-height: 1.6; border-top: 1px solid #F5F5F4; padding-top: 16px;">
        <strong style="color: ${BRAND_COLOR_PRIMARY}; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">Delivery Address:</strong>
        ${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}
      </div>
    </div>
  `;
  return wrapHtmlEmail(`Order Shipped #${order.order_number}`, body);
}

