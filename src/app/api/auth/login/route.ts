import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface LoginRequest {
  email: string;
  password: string;
}

// Admin credentials — change these for production
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@laxree.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || crypto.createHash('sha256').update('laxree2024').digest('hex');

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const inputHash = crypto.createHash('sha256').update(password).digest('hex');

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || inputHash !== ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'admin',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}