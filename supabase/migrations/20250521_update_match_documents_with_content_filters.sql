
-- Updated function to search for similar documents based on embedding with content type filtering
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding extensions.vector(1536),
  match_threshold float,
  match_count int,
  p_project_id uuid,
  content_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF content_type IS NULL THEN
    -- Original behavior when no content type filter is specified
    RETURN QUERY
    SELECT
      document_chunks.id,
      document_chunks.content,
      document_chunks.metadata,
      1 - (document_chunks.embedding <=> query_embedding) as similarity
    FROM document_chunks
    WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
      AND project_id = p_project_id
    ORDER BY similarity DESC
    LIMIT match_count;
  ELSE
    -- Filter by content type in metadata
    RETURN QUERY
    SELECT
      document_chunks.id,
      document_chunks.content,
      document_chunks.metadata,
      1 - (document_chunks.embedding <=> query_embedding) as similarity
    FROM document_chunks
    WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
      AND project_id = p_project_id
      AND metadata->>'type' = content_type
    ORDER BY similarity DESC
    LIMIT match_count;
  END IF;
END;
$$;
