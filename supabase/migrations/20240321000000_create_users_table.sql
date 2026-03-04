-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the users table
create table if not exists public.users (
  id uuid not null primary key references auth.users(id) on delete cascade,
  instagram_handle text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  embedding vector(512)
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies

-- Policy: Allow authenticated users to insert their own data
create policy "Users can insert their own data"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

-- Policy: Allow authenticated users to update their own data
create policy "Users can update their own data"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Policy: Allow authenticated users to select their own data
create policy "Users can select their own data"
on public.users
for select
to authenticated
using (auth.uid() = id);

-- Note: No policy is created for selecting other users' data, 
-- effectively denying read access to other rows for standard authenticated users.
-- Server-side functions can bypass RLS using the service_role key.
