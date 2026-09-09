import { NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.delete(AUTH_CONFIG.cookieName);
  return response;
}
