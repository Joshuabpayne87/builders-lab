-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a unified knowledge base table
CREATE TABLE IF NOT EXISTS bl_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- The actual text content
  content TEXT NOT NULL,
  
  -- Metadata about the source
  source_app TEXT NOT NULL, -- 'banana-blitz', 'unravel', 'serendipity', etc.
  source_id TEXT, -- ID of the original record (e.g. bl_images.id)
  source_type TEXT, -- 'image_prompt', 'article_summary', 'deal_note', etc.
  
  -- Extra JSON metadata for flexibility
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- The vector embedding (Gemini text-embedding-004 is 768 dimensions)
  embedding vector(768),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bl_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own knowledge" ON bl_knowledge_base
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge" ON bl_knowledge_base
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge" ON bl_knowledge_base
  FOR DELETE USING (auth.uid() = user_id);

-- Create a similarity search function
CREATE OR REPLACE FUNCTION match_knowledge (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  source_app text,
  source_type text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bl_knowledge_base.id,
    bl_knowledge_base.content,
    bl_knowledge_base.source_app,
    bl_knowledge_base.source_type,
    bl_knowledge_base.metadata,
    1 - (bl_knowledge_base.embedding <=> query_embedding) as similarity
  FROM bl_knowledge_base
  WHERE bl_knowledge_base.user_id = filter_user_id
  AND 1 - (bl_knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY bl_knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create an index for faster queries (IVFFlat)
-- Note: This usually requires some data to be effective, but good to have ready
CREATE INDEX ON bl_knowledge_base USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
