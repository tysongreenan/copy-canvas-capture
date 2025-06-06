-- Create table to store RAG query logs
CREATE TABLE IF NOT EXISTS rag_queries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES scraped_projects(id),
  query_text text NOT NULL,
  source_ids uuid[] NOT NULL,
  confidence numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Function to compute average confidence and frequent queries for a project
CREATE OR REPLACE FUNCTION get_rag_query_stats(p_project_id uuid)
RETURNS TABLE (
  avg_confidence numeric,
  frequent_queries jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT AVG(confidence) FROM rag_queries WHERE project_id = p_project_id),
    (
      SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT query_text, COUNT(*) AS query_count
        FROM rag_queries
        WHERE project_id = p_project_id
        GROUP BY query_text
        ORDER BY query_count DESC
        LIMIT 5
      ) t
    );
END;
$$;
