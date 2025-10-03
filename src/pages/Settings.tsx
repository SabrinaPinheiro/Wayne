import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Settings2, Bell, Download, Shield, Palette } from 'lucide-react';

export const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    alerts: true,
    reports: false
  });
  const [autoExport, setAutoExport] = useState(false);
  const [exportFrequency, setExportFrequency] = useState('weekly');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading user settings:', error);
        return;
      }

      if (data) {
        setNotifications({
          email: data.email_notifications ?? true,
          push: data.push_notifications ?? false,
          alerts: data.notifications_enabled ?? true,
          reports: data.report_preferences?.weekly_reports ?? false
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const settingsData = {
        user_id: user.id,
        email_notifications: notifications.email,
        push_notifications: notifications.push,
        notifications_enabled: notifications.alerts,
        report_preferences: {
          weekly_reports: notifications.reports,
          export_frequency: exportFrequency,
          auto_export: autoExport
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as configurações. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para download.",
    });
  };

  return (
    <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Configure suas preferências e notificações
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como você deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Notificações por email</Label>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Notificações push</Label>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, push: checked }))
                }
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="alert-notifications">Alertas do sistema</Label>
              <Switch
                id="alert-notifications"
                checked={notifications.alerts}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, alerts: checked }))
                }
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="report-notifications">Relatórios semanais</Label>
              <Switch
                id="report-notifications"
                checked={notifications.reports}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, reports: checked }))
                }
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Exportação de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportação de Dados
            </CardTitle>
            <CardDescription>
              Configure a exportação automática de relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-export">Exportação automática</Label>
              <Switch
                id="auto-export"
                checked={autoExport}
                onCheckedChange={setAutoExport}
                disabled={loading}
              />
            </div>
            
            {autoExport && (
              <div className="space-y-2">
                <Label htmlFor="export-frequency">Frequência</Label>
                <Select value={exportFrequency} onValueChange={setExportFrequency} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Separator />
            
            <Button onClick={handleExportData} variant="outline" className="w-full" disabled={loading}>
              Exportar dados agora
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} className="min-w-32" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};