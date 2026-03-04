-- Create a function to find similar users
create or replace function public.find_doppelganger(
  query_embedding vector(512),
  similarity_threshold float,
  match_count int
)
returns table (
  id uuid,
  instagram_handle text,
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
  select
    users.id,
    users.instagram_handle,
    1 - (users.embedding <=> query_embedding) as similarity
  from users
  where 1 - (users.embedding <=> query_embedding) > similarity_threshold
  and users.id != auth.uid() -- Exclude the current user
  order by users.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create an HNSW index for faster similarity search
create index if not exists users_embedding_idx 
on public.users 
using hnsw (embedding vector_cosine_ops);
