-- Create table for workspace RAG settings
CREATE TABLE IF NOT EXISTS workspace_rag_settings (
  workspace_id UUID PRIMARY KEY REFERENCES scraped_projects(id) ON DELETE CASCADE,
  similarity_threshold FLOAT NOT NULL DEFAULT 0.25,
  min_quality_score FLOAT NOT NULL DEFAULT 0.6,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
