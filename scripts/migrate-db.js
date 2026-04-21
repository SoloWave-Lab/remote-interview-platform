const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to Neon database');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'candidate',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created users table');

    // Create interviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time BIGINT NOT NULL,
        end_time BIGINT,
        status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
        stream_call_id VARCHAR(255) UNIQUE NOT NULL,
        candidate_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Created interviews table');

    // Create interview_interviewers junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_interviewers (
        id SERIAL PRIMARY KEY,
        interview_id INT NOT NULL,
        interviewer_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
        FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(interview_id, interviewer_id)
      );
    `);
    console.log('Created interview_interviewers table');

    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        rating INT NOT NULL,
        interviewer_id INT NOT NULL,
        interview_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
      );
    `);
    console.log('Created comments table');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_interviews_stream_call_id ON interviews(stream_call_id);
      CREATE INDEX IF NOT EXISTS idx_interview_interviewers_interview_id ON interview_interviewers(interview_id);
      CREATE INDEX IF NOT EXISTS idx_interview_interviewers_interviewer_id ON interview_interviewers(interviewer_id);
      CREATE INDEX IF NOT EXISTS idx_comments_interview_id ON comments(interview_id);
      CREATE INDEX IF NOT EXISTS idx_comments_interviewer_id ON comments(interviewer_id);
    `);
    console.log('Created indexes');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
