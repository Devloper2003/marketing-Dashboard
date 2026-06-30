import { NextResponse } from 'next/server';

interface LoginRequest {
  email: string;
  password: string;
}

interface DemoUser {
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'viewer';
  name: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'admin@laxree.com',
    password: 'laxree2024',
    role: 'admin',
    name: 'Laxree Team',
  },
  {
    email: 'manager@laxree.com',
    password: 'laxree2024',
    role: 'manager',
    name: 'Marketing Manager',
  },
  {
    email: 'viewer@laxree.com',
    password: 'laxree2024',
    role: 'viewer',
    name: 'Analytics Viewer',
  },
];

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

    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = `demo-token-${user.role}-${Date.now()}`;

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}