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
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere relatórios detalhados sobre recursos, acessos e atividades
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Configurações do Relatório
          </CardTitle>
          <CardDescription>
            Configure o tipo de relatório desejado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Relatório Geral</SelectItem>
                  <SelectItem value="resources">Recursos</SelectItem>
                  <SelectItem value="access">Acessos</SelectItem>
                  <SelectItem value="users">Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Gerar PDF'}
            </Button>
            <Button
              onClick={() => handleGenerateReport('excel')}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Gerar Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidade em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Sistema de Relatórios</h3>
            <p className="mb-4">
              A funcionalidade completa de geração de relatórios em PDF e Excel com gráficos será implementada em breve.
            </p>
            <p className="text-sm">
              Os relatórios incluirão dados sobre recursos, acessos, atividades dos usuários e gráficos interativos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;