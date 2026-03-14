import { createHmac, timingSafeEqual } from 'crypto';

export function generateOrderNumber(seq: number) {
  return `BEX-${String(seq).padStart(6, '0')}`;
}

type GuestTokenPayload = {
  orderNumber: string;
  customerPhone: string;
  exp: number;
};

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 2;

function getOrderTokenSecret() {
  return process.env.ORDER_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'beirut-order-fallback-secret';
}

function encode(payload: GuestTokenPayload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decode(value: string) {
  const decoded = Buffer.from(value, 'base64url').toString('utf8');
  return JSON.parse(decoded) as GuestTokenPayload;
}

export function createGuestOrderToken(orderNumber: string, customerPhone: string) {
  const payload: GuestTokenPayload = {
    orderNumber,
    customerPhone,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = encode(payload);
  const signature = createHmac('sha256', getOrderTokenSecret()).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyGuestOrderToken(token: string, orderNumber: string) {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return { valid: false, customerPhone: null as string | null };

  const expectedSignature = createHmac('sha256', getOrderTokenSecret()).update(encodedPayload).digest('base64url');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, customerPhone: null as string | null };
  }

  const payload = decode(encodedPayload);
  if (payload.orderNumber !== orderNumber || payload.exp < Date.now()) {
    return { valid: false, customerPhone: null as string | null };
  }

  return { valid: true, customerPhone: payload.customerPhone };
}
