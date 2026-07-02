import crypto from 'crypto';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function jsonResponse(data: Record<string, unknown>, status = 200) {
  return Response.json(data, { status });
}