-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'funcionario' CHECK (role IN ('funcionario', 'gerente', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('equipamento', 'veiculo', 'dispositivo')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'manutencao', 'indisponivel')),
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create access_logs table
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('acesso', 'checkout', 'checkin', 'manutencao')),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access_logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    'funcionario'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'gerente'));

-- RLS Policies for resources
CREATE POLICY "All authenticated users can view resources"
ON public.resources
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers and admins can create resources"
ON public.resources
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_role() IN ('admin', 'gerente'));

CREATE POLICY "Managers and admins can update resources"
ON public.resources
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'gerente'));

CREATE POLICY "Admins can delete resources"
ON public.resources
FOR DELETE
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- RLS Policies for access_logs
CREATE POLICY "Users can view their own access logs"
ON public.access_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Managers and admins can view all access logs"
ON public.access_logs
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'gerente'));

CREATE POLICY "All authenticated users can create access logs"
ON public.access_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update access logs"
ON public.access_logs
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete access logs"
ON public.access_logs
FOR DELETE
TO authenticated
USING (public.get_current_user_role() = 'admin');