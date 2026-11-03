/**
 * Server-Side Brevo Email Service
 *
 * Interacts directly with the official Brevo (formerly Sendinblue) REST API v3
 * without SMTP, external SDK bloat, or client-side exposure.
 */

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoAttachment {
  name: string;
  /** Base64-encoded file content */
  content: string;
}

export interface SendBrevoEmailOptions {
  /** Recipient email address or array of recipient objects */
  to: string | string[] | BrevoRecipient[];
  /** Subject line of the email */
  subject: string;
  /** HTML body of the email */
  htmlContent: string;
  /** Plain text fallback content (optional) */
  textContent?: string;
  /** Custom sender override (defaults to BREVO_SENDER_EMAIL / BREVO_SENDER_NAME) */
  sender?: BrevoRecipient;
  /** Reply-to address (optional) */
  replyTo?: BrevoRecipient;
  /** Email tags for Brevo analytics (optional) */
  tags?: string[];
  /** Dynamic template variables (optional) */
  params?: Record<string, unknown>;
  /** Attachments (optional) */
  attachments?: BrevoAttachment[];
}

export interface SendBrevoEmailResponse {
  messageId: string;
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Validates Brevo environment configuration
 */
export function verifyBrevoConfig(): { isValid: boolean; error?: string } {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || apiKey.trim() === "") {
    return {
      isValid: false,
      error: "Missing environment variable: BREVO_API_KEY is not defined.",
    };
  }

  if (!senderEmail || senderEmail.trim() === "") {
    return {
      isValid: false,
      error: "Missing environment variable: BREVO_SENDER_EMAIL is not defined.",
    };
  }

  return { isValid: true };
}

/**
 * Formats flexible recipient input into Brevo's expected array of { email, name? } objects
 */
function normalizeRecipients(
  recipients: string | string[] | BrevoRecipient[]
): BrevoRecipient[] {
  if (typeof recipients === "string") {
    return [{ email: recipients.trim() }];
  }

  if (Array.isArray(recipients)) {
    return recipients.map((r) => {
      if (typeof r === "string") {
        return { email: r.trim() };
      }
      return {
        email: r.email.trim(),
        ...(r.name ? { name: r.name.trim() } : {}),
      };
    });
  }

  throw new Error("Invalid recipient format provided to Brevo email service.");
}

/**
 * Sends a transactional email using the official Brevo REST API v3
 *
 * @throws {Error} If required environment variables are missing or Brevo API returns an error
 */
export async function sendBrevoEmail(
  options: SendBrevoEmailOptions
): Promise<SendBrevoEmailResponse> {
  const apiKey = process.env.BREVO_API_KEY;
  const defaultSenderEmail = process.env.BREVO_SENDER_EMAIL;
  const defaultSenderName = process.env.BREVO_SENDER_NAME || "LUMERO";

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Brevo Email Service Error: BREVO_API_KEY environment variable is not defined."
    );
  }

  const senderEmail = options.sender?.email || defaultSenderEmail;
  const senderName = options.sender?.name || defaultSenderName;

  if (!senderEmail || senderEmail.trim() === "") {
    throw new Error(
      "Brevo Email Service Error: Verified sender email is not configured. Set BREVO_SENDER_EMAIL or supply options.sender."
    );
  }

  const recipients = normalizeRecipients(options.to);
  if (recipients.length === 0) {
    throw new Error("Brevo Email Service Error: At least one recipient is required.");
  }

  // Construct official Brevo API v3 request payload
  const payload: Record<string, unknown> = {
    sender: {
      email: senderEmail.trim(),
      ...(senderName ? { name: senderName.trim() } : {}),
    },
    to: recipients,
    subject: options.subject,
    htmlContent: options.htmlContent,
  };

  if (options.textContent) {
    payload.textContent = options.textContent;
  }

  if (options.replyTo) {
    payload.replyTo = {
      email: options.replyTo.email.trim(),
      ...(options.replyTo.name ? { name: options.replyTo.name.trim() } : {}),
    };
  }

  if (options.tags && options.tags.length > 0) {
    payload.tags = options.tags;
  }

  if (options.params && Object.keys(options.params).length > 0) {
    payload.params = options.params;
  }

  if (options.attachments && options.attachments.length > 0) {
    payload.attachment = options.attachments.map((att) => ({
      name: att.name,
      content: att.content,
    }));
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey.trim(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Brevo API Error (${response.status}): ${errorMessage}`);
  }

  if (!responseData?.messageId) {
    throw new Error(
      "Brevo API Error: Missing messageId in successful API response."
    );
  }

  return {
    messageId: responseData.messageId as string,
  };
}

