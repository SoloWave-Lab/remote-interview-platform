'use server';

import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  const result = await query(
    'SELECT id, email, name FROM users WHERE id = $1',
    [decoded.userId]
  );

  return result.rows[0] || null;
}

export async function getUsers() {
  const result = await query('SELECT id, email, name FROM users');
  return result.rows;
}

export async function getUserById(userId: string) {
  const result = await query(
    'SELECT id, email, name FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

export async function getUserRole(userId: string) {
  const result = await query(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );
  
  const user = result.rows[0];
  return {
    isInterviewer: user?.role === 'interviewer',
    isCandidate: user?.role === 'candidate',
  };
}
