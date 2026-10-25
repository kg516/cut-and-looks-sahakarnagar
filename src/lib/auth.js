import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { queryOne } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cut-and-looks-salon-jwt-super-secret-key-2026-bengaluru';
const COOKIE_NAME = 'cnl_admin_token';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  const user = await queryOne(
    'SELECT id, full_name, email, role FROM profiles WHERE id = ?',
    [decoded.userId]
  );
  return user || null;
}

export async function requireAdminSession() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

export { COOKIE_NAME };
