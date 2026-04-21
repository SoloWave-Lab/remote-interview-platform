'use server';

import { query } from '@/lib/db';
import { getCurrentUser } from './user';

export async function addComment(data: {
  interviewId: string;
  content: string;
  rating: number;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  const result = await query(
    `INSERT INTO comments (interview_id, interviewer_id, content, rating, created_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [data.interviewId, currentUser.id, data.content, data.rating]
  );
  
  return result.rows[0];
}

export async function getComments(interviewId: string) {
  const result = await query(
    'SELECT * FROM comments WHERE interview_id = $1 ORDER BY created_at DESC',
    [interviewId]
  );
  
  return result.rows;
}
