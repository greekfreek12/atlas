/**
 * TextGrid SMS API Wrapper
 *
 * Environment variables required:
 * - TEXTGRID_ACCOUNT_SID: Your TextGrid Account SID
 * - TEXTGRID_AUTH_TOKEN: Your TextGrid Auth Token
 */

// TextGrid Breeze API - use api.textgrid.com (not api2)
const TEXTGRID_API_URL = 'https://api.textgrid.com/2010-04-01';

interface TextGridConfig {
  accountSid: string;
  authToken: string;
}

interface SendSMSParams {
  to: string;
  from: string;
  body: string;
}

interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface MessageStatus {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  errorCode?: string;
  errorMessage?: string;
}

interface InboundMessage {
  messageId: string;
  from: string;
  to: string;
  body: string;
  receivedAt: string;
}

function getConfig(): TextGridConfig {
  const accountSid = process.env.TEXTGRID_ACCOUNT_SID;
  const authToken = process.env.TEXTGRID_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Missing TEXTGRID_ACCOUNT_SID or TEXTGRID_AUTH_TOKEN environment variables');
  }

  return { accountSid, authToken };
}

function getAuthHeader(config: TextGridConfig): string {
  // TextGrid Breeze API uses Bearer token format
  const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
  return `Bearer ${credentials}`;
}

/**
 * Send an SMS message via TextGrid
 */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResponse> {
  try {
    const config = getConfig();

    // Normalize phone numbers (ensure E.164 format)
    const toPhone = normalizePhoneNumber(params.to);
    const fromPhone = normalizePhoneNumber(params.from);

    console.log('TextGrid Send SMS:', { to: toPhone, from: fromPhone, bodyLength: params.body.length });

    const response = await fetch(`${TEXTGRID_API_URL}/Accounts/${config.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(config),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toPhone,
        from: fromPhone,
        body: params.body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('TextGrid API error:', JSON.stringify(data, null, 2));
      console.error('TextGrid API status:', response.status);
      console.error('Request URL:', `${TEXTGRID_API_URL}/Accounts/${config.accountSid}/Messages.json`);
      return {
        success: false,
        error: data.message || data.error || data.errorMessage || `API Error ${data.errorCode || response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.sid || data.message_id || data.id,
    };
  } catch (error) {
    console.error('TextGrid send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get message delivery status
 */
export async function getMessageStatus(messageId: string): Promise<MessageStatus | null> {
  try {
    const config = getConfig();

    const response = await fetch(`${TEXTGRID_API_URL}/Accounts/${config.accountSid}/Messages/${messageId}.json`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(config),
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      messageId: data.sid || data.message_id || messageId,
      status: mapTextGridStatus(data.status),
      errorCode: data.error_code,
      errorMessage: data.error_message,
    };
  } catch (error) {
    console.error('TextGrid status check error:', error);
    return null;
  }
}

/**
 * Verify webhook signature from TextGrid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.TEXTGRID_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('No TEXTGRID_WEBHOOK_SECRET configured, skipping signature verification');
    return true; // Allow in dev, but log warning
  }

  try {
    // TextGrid typically uses HMAC-SHA256 for webhook signatures
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature || signature === `sha256=${expectedSignature}`;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Parse inbound webhook payload from TextGrid
 */
export function parseInboundWebhook(body: Record<string, unknown>): InboundMessage | null {
  try {
    // TextGrid webhook format (adjust based on actual API docs)
    return {
      messageId: (body.MessageSid || body.message_id || body.sid) as string,
      from: (body.From || body.from) as string,
      to: (body.To || body.to) as string,
      body: (body.Body || body.body || body.text) as string,
      receivedAt: (body.DateCreated || body.received_at || new Date().toISOString()) as string,
    };
  } catch (error) {
    console.error('Failed to parse inbound webhook:', error);
    return null;
  }
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it's 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If already has country code, ensure + prefix
  if (digits.length > 10) {
    return `+${digits}`;
  }

  // Return as-is with + prefix
  return phone.startsWith('+') ? phone : `+${digits}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

/**
 * Map TextGrid status to our internal status
 */
function mapTextGridStatus(status: string): MessageStatus['status'] {
  const statusMap: Record<string, MessageStatus['status']> = {
    'queued': 'queued',
    'sending': 'queued',
    'sent': 'sent',
    'delivered': 'delivered',
    'undelivered': 'failed',
    'failed': 'failed',
  };

  return statusMap[status?.toLowerCase()] || 'queued';
}

/**
 * Template variable replacement
 * Supports: {business_name}, {first_name}, {city}, {state}, {rating}, {reviews_count}, {site_url}
 */
export function interpolateTemplate(
  template: string,
  data: {
    businessName?: string;
    firstName?: string;
    city?: string;
    state?: string;
    rating?: number | null;
    reviewsCount?: number | null;
    siteUrl?: string;
  }
): string {
  let result = template;

  // Extract first name from business name if not provided
  const firstName = data.firstName || data.businessName?.split(' ')[0] || 'there';

  const replacements: Record<string, string> = {
    '{business_name}': data.businessName || 'your business',
    '{first_name}': firstName,
    '{city}': data.city || 'your area',
    '{state}': data.state || '',
    '{rating}': data.rating?.toString() || 'great',
    '{reviews_count}': data.reviewsCount?.toString() || 'many',
    '{site_url}': data.siteUrl || '',
  };

  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }

  return result;
}
