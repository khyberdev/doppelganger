-- Enable the pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Create a scheduled job to delete old user data daily at midnight (00:00)
-- The cron schedule '0 0 * * *' means "At minute 0 past hour 0 every day"
select cron.schedule(
  'delete-old-users', -- job name
  '0 0 * * *',        -- cron schedule
  $$
    delete from public.users 
    where created_at < now() - interval '90 days';
  $$
);
