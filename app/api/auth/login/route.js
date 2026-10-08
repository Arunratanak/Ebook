import { NextResponse } from 'next/server';
import { postZlibForm } from '@/app/lib/zlib';
import { extractAccount, setSessionCookies } from '@/app/lib/session';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { ok, data } = await postZlibForm('/eapi/user/login', {
      email: email.trim(),
      password,
    });

    const account = ok && data?.success !== false ? extractAccount(data) : null;
    if (!account) {
      return NextResponse.json(
        { error: 'Sign in failed. Check your email and password.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: { id: account.id, name: account.name, email: account.email },
    });
    return setSessionCookies(response, account);
  } catch (error) {
    console.error('Login failure:', error);
    return NextResponse.json({ error: 'Unable to reach the sign-in service' }, { status: 502 });
  }
}
