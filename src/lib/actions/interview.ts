'use server';

import { query } from '@/lib/db';
import { getCurrentUser } from './user';

export async function getAllInterviews() {
  const result = await query(
    'SELECT * FROM interviews ORDER BY start_time DESC'
  );
  return result.rows;
}

export async function getInterviewByStreamCallId(streamCallId: string) {
  const result = await query(
    'SELECT * FROM interviews WHERE stream_call_id = $1 LIMIT 1',
    [streamCallId]
  );
  return result.rows[0] || null;
}

export async function updateInterviewStatus(interviewId: string, status: string) {
  const result = await query(
    'UPDATE interviews SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, interviewId]
  );
  return result.rows[0] || null;
}

export async function createInterview(data: {
  title: string;
  candidateId: string;
  startTime: string;
  streamCallId: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Unauthorized');
  }

  const result = await query(
    `INSERT INTO interviews (title, candidate_id, start_time, stream_call_id, created_by, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'scheduled', NOW(), NOW()) RETURNING *`,
    [data.title, data.candidateId, data.startTime, data.streamCallId, currentUser.id]
  );
  
  return result.rows[0];
}

export async function addInterviewInterviewer(interviewId: string, interviewerId: string) {
  const result = await query(
    `INSERT INTO interview_interviewers (interview_id, interviewer_id, added_at)
     VALUES ($1, $2, NOW()) RETURNING *`,
    [interviewId, interviewerId]
  );
  
  return result.rows[0];
}

export async function getMyInterviews() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return [];
  }

  const result = await query(
    `SELECT i.* FROM interviews i
     LEFT JOIN interview_interviewers ii ON i.id = ii.interview_id
     WHERE i.candidate_id = $1 OR ii.interviewer_id = $1
     ORDER BY i.start_time DESC`,
    [currentUser.id]
  );

  return result.rows;
}
