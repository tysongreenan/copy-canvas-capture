-- Create table to store embedding jobs for background processing
CREATE TABLE IF NOT EXISTS embedding_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending',
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);
