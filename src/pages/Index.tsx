import { ArrowRight, Shield, BarChart3, Users, FileText, Bell, Settings, CheckCircle, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import wayneLogo from '@/assets/wayne-logo.png';

const Index = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Analítico',
      description: 'Visão completa com métricas em tempo real, gráficos interativos e indicadores de performance.',
      color: 'text-primary'
    },
    {
      icon: Shield,
      title: 'Gestão de Recursos',
      description: 'Controle total de equipamentos, veículos e dispositivos com status em tempo real.',
      color: 'text-success'
    },
    {
      icon: Users,
      title: 'Sistema Hierárquico',
      description: 'Três níveis de acesso com permissões específicas e controle granular de usuários.',
      color: 'text-warning'
    },
    {
      icon: FileText,
      title: 'Logs de Acesso',
      description: 'Rastreamento completo de movimentações com auditoria e histórico detalhado.',
      color: 'text-primary'
    },
    {
      icon: Bell,
      title: 'Sistema de Alertas',
      description: 'Notificações inteligentes personalizadas por usuário e tipo de evento.',
      color: 'text-destructive'
    },
    {
      icon: BarChart3,
      title: 'Relatórios PDF/Excel',
      description: 'Geração automática de relatórios com gráficos e exportação em múltiplos formatos.',
      color: 'text-success'
    }
  ];

  const userTypes = [
    {
      title: 'FUNCIONÁRIO',
      level: 'Nível Básico',
      description: 'Acesso aos recursos básicos e portal pessoal',
      permissions: [
        'Dashboard básico',
        'Visualizar recursos',
        'Solicitar recursos',
        'Logs pessoais',
        'Configurações próprias'
      ],
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30'
    },
    {
      title: 'GERENTE',
      level: 'Nível Intermediário',
      description: 'Controle expandido com gestão de usuários',
      permissions: [
        'Dashboard completo',
        'Criar/editar recursos',
        'Gerenciar usuários',
        'Todos os logs',
        'Aprovar solicitações'
      ],
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30'
    },
    {
      title: 'ADMIN',
      level: 'Nível Máximo',
      description: 'Controle total do sistema corporativo',
      permissions: [
        'Acesso irrestrito',
        'Excluir recursos',
        'Gerenciar permissões',
        'Editar logs',
        'Configurações avançadas'
      ],
      gradient: 'from-red-500/20 to-orange-500/20',
      border: 'border-red-500/30'
    }
  ];

  const technologies = [
    'React', 'TypeScript', 'Supabase', 'Tailwind CSS', 
    'RLS Security', 'Real-time', 'PDF Export', 'Analytics'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-8">
              <img 
                src={wayneLogo} 
                alt="Wayne Industries Logo" 
                className="h-32 w-auto icon-glow animate-pulse"
              />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="gradient-text">Wayne Industries</span>
              <br />
              <span className="text-foreground">Resource Management</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sistema Futurista de Gestão Corporativa desenvolvido como projeto final do curso de 
              <span className="text-primary font-semibold"> Programação Full Stack</span> da 
              <span className="text-primary font-semibold"> Infinity School</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link to="/login">
                <Button size="lg" className="text-lg px-8 py-6 glow-effect group">
                  Acessar Sistema
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Badge variant="outline" className="text-sm py-2 px-4">
                🎓 Projeto Acadêmico • Demonstração
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Sobre o Sistema</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              O Wayne Industries Resource Management é uma aplicação web completa que permite controlar 
              e monitorar equipamentos, veículos, dispositivos e acesso de funcionários aos recursos da empresa 
              através de uma interface moderna e intuitiva com segurança de nível corporativo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-border/50 bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Hierarchy Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Hierarquia de Usuários</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sistema robusto com três níveis hierárquicos de acesso, garantindo segurança 
              e controle granular de permissões
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {userTypes.map((user, index) => (
              <Card key={index} className={`card-hover border-2 ${user.border} bg-gradient-to-br ${user.gradient}`}>
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className="text-xs">
                      {user.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold">{user.title}</CardTitle>
                  <CardDescription className="text-base">
                    {user.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Permissões:
                    </h4>
                    <ul className="space-y-2">
                      {user.permissions.map((permission, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Tecnologias & Arquitetura</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Desenvolvido com as tecnologias mais modernas do mercado, garantindo performance, 
              segurança e escalabilidade
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {technologies.map((tech, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-base py-2 px-4 glow-effect hover:bg-primary/10 transition-all cursor-default"
              >
                <Zap className="w-4 h-4 mr-2 text-primary" />
                {tech}
              </Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="card-hover">
              <CardHeader>
                <Shield className="h-12 w-12 text-success mx-auto mb-4" />
                <CardTitle>Segurança Avançada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Row Level Security (RLS), autenticação robusta e auditoria completa de todas as operações
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Zap className="h-12 w-12 text-warning mx-auto mb-4" />
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface responsiva, carregamento otimizado e atualizações em tempo real
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dashboard com métricas avançadas, relatórios exportáveis e insights em tempo real
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Explore o Sistema</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Descubra como a Wayne Industries revoluciona a gestão corporativa com tecnologia de ponta. 
            Este é um projeto acadêmico desenvolvido para demonstrar habilidades Full Stack.
          </p>
          
          <div className="space-y-6">
            <Link to="/login">
              <Button size="lg" className="text-xl px-12 py-8 glow-effect group">
                Entrar no Sistema
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              💡 <strong>Projeto Final</strong> - Curso de Programação Full Stack da Infinity School
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <img src={wayneLogo} alt="Wayne Industries" className="h-8 w-auto opacity-70" />
              <span className="text-muted-foreground">© 2024 Wayne Industries Resource Management</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-primary/10">
                <Star className="w-3 h-3 mr-1" />
                Projeto Acadêmico
              </Badge>
              <Badge variant="outline" className="bg-success/10">
                <CheckCircle className="w-3 h-3 mr-1" />
                Infinity School
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;