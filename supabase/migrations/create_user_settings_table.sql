-- Criar tabela user_settings para configurações persistentes dos usuários
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US')),
    notifications_enabled BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    dashboard_layout JSONB DEFAULT '{}',
    report_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem ver apenas suas próprias configurações
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários autenticados poderem inserir suas próprias configurações
CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários autenticados poderem atualizar suas próprias configurações
CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários autenticados poderem deletar suas próprias configurações
CREATE POLICY "Users can delete own settings" ON public.user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Conceder permissões para roles anon e authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Inserir configurações padrão para usuários existentes (opcional)
INSERT INTO public.user_settings (user_id, theme, language, notifications_enabled)
SELECT 
    au.id,
    'system',
    'pt-BR',
    true
FROM auth.users au
LEFT JOIN public.user_settings us ON au.id = us.user_id
WHERE us.user_id IS NULL;

-- Comentários para documentação
COMMENT ON TABLE public.user_settings IS 'Tabela para armazenar configurações personalizadas dos usuários';
COMMENT ON COLUMN public.user_settings.theme IS 'Tema da interface: light, dark ou system';
COMMENT ON COLUMN public.user_settings.language IS 'Idioma preferido do usuário';
COMMENT ON COLUMN public.user_settings.dashboard_layout IS 'Layout personalizado do dashboard em formato JSON';
COMMENT ON COLUMN public.user_settings.report_preferences IS 'Preferências de relatórios em formato JSON';