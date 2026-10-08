import { NextResponse } from 'next/server';
import { postZlibForm } from '@/app/lib/zlib';
import { extractAccount, setSessionCookies } from '@/app/lib/session';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || password.length < 6 ||
      typeof name !== 'string' || !name.trim()
    ) {
      return NextResponse.json(
        { error: 'Name, email, and a password of at least 6 characters are required' },
        { status: 400 }
      );
    }

    const { ok, data } = await postZlibForm('/eapi/user/registration', {
      email: email.trim(),
      password,
      name: name.trim(),
    });

    const account = ok && data?.success !== false ? extractAccount(data) : null;
    if (!account) {
      return NextResponse.json(
        { error: 'Could not create the account. The email may already be in use.' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      user: { id: account.id, name: account.name, email: account.email },
    });
    return setSessionCookies(response, account);
  } catch (error) {
    console.error('Registration failure:', error);
    return NextResponse.json({ error: 'Unable to reach the sign-up service' }, { status: 502 });
  }
}
