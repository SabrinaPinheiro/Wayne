import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Settings2, Bell, Download, Shield, Palette } from 'lucide-react';

export const Settings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    alerts: true,
    reports: false
  });
  const [autoExport, setAutoExport] = useState(false);
  const [exportFrequency, setExportFrequency] = useState('weekly');
  const [theme, setTheme] = useState('dark');

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para download.",
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
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
              />
            </div>
            
            {autoExport && (
              <div className="space-y-2">
                <Label htmlFor="export-frequency">Frequência</Label>
                <Select value={exportFrequency} onValueChange={setExportFrequency}>
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
            
            <Button onClick={handleExportData} variant="outline" className="w-full">
              Exportar dados agora
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} className="min-w-32">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};