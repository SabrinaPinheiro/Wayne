-- Ensure foreign keys exist for access_logs table
ALTER TABLE public.access_logs 
ADD CONSTRAINT fk_access_logs_resource 
FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;

ALTER TABLE public.access_logs 
ADD CONSTRAINT fk_access_logs_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;