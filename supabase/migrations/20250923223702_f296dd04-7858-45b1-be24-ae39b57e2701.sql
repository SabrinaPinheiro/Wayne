-- Create alerts table for notifications system
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for alerts
CREATE POLICY "Users can view their own alerts" 
ON public.alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create alerts for users" 
ON public.alerts 
FOR INSERT 
WITH CHECK (true);

-- Admins and managers can view all alerts
CREATE POLICY "Admins and managers can view all alerts" 
ON public.alerts 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text]));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create demo alerts
INSERT INTO public.alerts (user_id, message, type, status, created_at) 
SELECT 
  (SELECT user_id FROM public.profiles LIMIT 1),
  'Sistema atualizado com sucesso',
  'success',
  'unread',
  now() - interval '2 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles);

INSERT INTO public.alerts (user_id, message, type, status, created_at, read_at) 
SELECT 
  (SELECT user_id FROM public.profiles LIMIT 1),
  'Recurso "Batmóvel" está em manutenção há 3 dias',
  'warning',
  'read',
  now() - interval '1 day',
  now() - interval '12 hours'
WHERE EXISTS (SELECT 1 FROM public.profiles);

INSERT INTO public.alerts (user_id, message, type, status, created_at) 
SELECT 
  (SELECT user_id FROM public.profiles LIMIT 1),
  'Novo usuário registrado no sistema',
  'info',
  'unread',
  now() - interval '30 minutes'
WHERE EXISTS (SELECT 1 FROM public.profiles);

-- Create more diverse demo data for access_logs
INSERT INTO public.access_logs (user_id, resource_id, action, notes, timestamp)
SELECT 
  p.user_id,
  r.id,
  CASE 
    WHEN random() < 0.3 THEN 'checkout'
    WHEN random() < 0.6 THEN 'checkin'
    ELSE 'maintenance'
  END,
  CASE 
    WHEN random() < 0.5 THEN 'Operação de rotina'
    ELSE 'Manutenção preventiva'
  END,
  now() - (random() * interval '30 days')
FROM public.profiles p
CROSS JOIN public.resources r
WHERE random() < 0.3  -- Only create logs for 30% of combinations
LIMIT 50;