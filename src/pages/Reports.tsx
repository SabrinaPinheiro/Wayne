import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, BarChart3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("general");
  const [isGenerating, setIsGenerating] = useState(false);

  // Verificar se é admin ou gerente
  const canAccessReports = profile?.role === 'admin' || profile?.role === 'gerente';

  if (!canAccessReports) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Você não tem permissão para acessar os relatórios. Entre em contato com um administrador.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    setIsGenerating(true);
    
    // Simular geração de relatório
    setTimeout(() => {
      toast({
        title: "Sucesso",
        description: `Relatório em ${format.toUpperCase()} será implementado em breve!`,
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold gradient-text tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground text-lg">
          Gere relatórios detalhados sobre recursos, acessos e atividades
        </p>
      </div>

      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <BarChart3 className="h-6 w-6 icon-glow text-primary" />
            Configurações do Relatório
          </CardTitle>
          <CardDescription className="text-base">
            Configure o tipo de relatório desejado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-base font-semibold">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">📊 Relatório Geral</SelectItem>
                  <SelectItem value="resources">🏢 Recursos</SelectItem>
                  <SelectItem value="access">🔐 Acessos</SelectItem>
                  <SelectItem value="users">👥 Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
              className="flex items-center gap-2 glow-effect"
              size="lg"
            >
              <FileText className="h-5 w-5" />
              {isGenerating ? 'Gerando...' : 'Gerar PDF'}
            </Button>
            <Button
              onClick={() => handleGenerateReport('excel')}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2 hover:glow-effect"
              size="lg"
            >
              <Download className="h-5 w-5" />
              {isGenerating ? 'Gerando...' : 'Gerar Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-enhanced border-dashed border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Funcionalidade em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
              <FileText className="h-20 w-20 text-primary/70" />
            </div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Sistema de Relatórios Avançado</h3>
            <p className="text-lg mb-6 text-muted-foreground max-w-2xl mx-auto">
              A funcionalidade completa de geração de relatórios em PDF e Excel com gráficos interativos 
              será implementada em breve.
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
              <div className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 border">
                <h4 className="font-semibold mb-2">📈 Relatórios Incluirão:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dados sobre recursos e utilização</li>
                  <li>• Logs de acesso detalhados</li>
                  <li>• Atividades dos usuários</li>
                  <li>• Gráficos interativos e dashboards</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 border">
                <h4 className="font-semibold mb-2">🚀 Recursos Futuros:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Agendamento automático</li>
                  <li>• Exportação em múltiplos formatos</li>
                  <li>• Filtros avançados por período</li>
                  <li>• Comparativos históricos</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;