# Wayne Industries - Sistema de Gestão de Recursos

<div align="center">
  <img src="public/logo-wayne.png" alt="Wayne Industries Logo" width="200"/>
  
  **Sistema de Gerenciamento de Segurança e Recursos**
  
  <img src="public/logo-batman.png" alt="Batman Logo" width="150"/>
  
  *Projeto Final - Desenvolvimento Full Stack*
  
  **Infinity School**
  
  Desenvolvido por: **Sabrina Pinheiro** | [www.spdev.com.br](https://www.spdev.com.br)
</div>

---

## 📋 Sobre o Projeto

O **Wayne Industries - Sistema de Gestão de Recursos** é uma aplicação web full-stack desenvolvida como projeto final do curso de Desenvolvimento Full Stack da Infinity School. A aplicação foi criada para atender às necessidades específicas das Indústrias Wayne, oferecendo uma solução tecnológica completa para otimizar processos internos e melhorar a segurança corporativa.

### 🎯 Objetivos do Projeto

- Desenvolver um sistema de controle de acesso para áreas restritas
- Implementar autenticação e autorização para diferentes tipos de usuários
- Criar uma interface para gerenciamento de recursos internos
- Desenvolver um dashboard de visualização com dados relevantes
- Demonstrar integração eficaz entre frontend e backend

---

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Gerenciamento de Segurança
- **Autenticação Completa**: Login, registro, recuperação de senha e confirmação de conta
- **Autorização por Níveis**: Sistema de roles (Funcionário, Gerente, Administrador)
- **Controle de Acesso**: Proteção de rotas baseada em permissões
- **Logs de Atividade**: Rastreamento completo de ações dos usuários
- **Segurança Avançada**: Implementação de RLS (Row Level Security) no banco de dados

### 📦 Gestão de Recursos
- **CRUD Completo**: Criar, visualizar, editar e excluir recursos
- **Categorização**: Equipamentos, veículos, dispositivos de segurança e instalações
- **Status Dinâmico**: Disponível, em uso, manutenção, aposentado
- **Atribuição**: Associação de recursos a usuários específicos
- **Busca Avançada**: Filtros por tipo, status, localização e responsável

### 📊 Dashboard de Visualização
- **Métricas em Tempo Real**: Estatísticas atualizadas automaticamente
- **Gráficos Interativos**: 
  - Gráfico de acessos por período
  - Status de recursos em tempo real
  - Movimentação de veículos
- **Timeline de Atividades**: Histórico cronológico de ações
- **Cards Informativos**: Resumo visual das principais métricas

### 👥 Gerenciamento de Usuários
- **Perfis Completos**: Informações detalhadas dos usuários
- **Controle de Permissões**: Atribuição e modificação de roles
- **Histórico de Atividades**: Rastreamento por usuário

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal para construção da interface
- **TypeScript** - Tipagem estática para maior segurança no código
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes de interface modernos
- **Radix UI** - Componentes acessíveis e customizáveis
- **React Router DOM** - Roteamento do lado do cliente
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **Recharts** - Biblioteca para gráficos interativos
- **Lucide React** - Ícones modernos

### Backend & Infraestrutura
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança a nível de linha
- **Supabase Auth** - Sistema de autenticação
- **Supabase Storage** - Armazenamento de arquivos

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **Date-fns** - Manipulação de datas
- **Sonner** - Sistema de notificações

---

## 📁 Estrutura do Projeto

```
wayne-industries/
├── src/
│   ├── assets/                 # Imagens e recursos estáticos
│   ├── components/            # Componentes reutilizáveis
│   │   ├── dashboard/         # Componentes específicos do dashboard
│   │   ├── layout/           # Componentes de layout (Header, Sidebar)
│   │   └── ui/               # Componentes de interface base
│   ├── context/              # Contextos React (AuthContext)
│   ├── hooks/                # Hooks customizados
│   ├── integrations/         # Configurações de integração (Supabase)
│   ├── lib/                  # Utilitários e configurações
│   ├── pages/                # Páginas da aplicação
│   │   ├── Dashboard.tsx     # Painel principal
│   │   ├── Resources.tsx     # Gestão de recursos
│   │   ├── AccessLogs.tsx    # Logs de acesso
│   │   ├── Users.tsx         # Gerenciamento de usuários
│   │   ├── Login.tsx         # Página de login
│   │   └── ...               # Outras páginas de autenticação
│   ├── types/                # Definições de tipos TypeScript
│   └── utils/                # Funções utilitárias
├── supabase/
│   ├── migrations/           # Migrações do banco de dados
│   └── config.toml          # Configuração do Supabase
└── public/                   # Arquivos públicos
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <https://github.com/SabrinaPinheiro/wayne-industries/>
cd wayne-industries
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Configure o banco de dados**
```bash
# Execute as migrações do Supabase
npx supabase db push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

---

## 👤 Usuários Demo

Para facilitar os testes, a aplicação possui usuários demo pré-configurados:

### Administrador
- **Email**: admin@wayne.app.br
- **Senha**: admin123
- **Permissões**: Acesso total ao sistema

### Gerente
- **Email**: gerente@wayne.app.br
- **Senha**: gerente123
- **Permissões**: Gestão de recursos e visualização de relatórios

### Funcionário
- **Email**: funcionario@wayne.app.br
- **Senha**: funcionario123
- **Permissões**: Visualização básica e uso de recursos

---

## 📱 Funcionalidades por Página

### 🏠 Landing Page (/)
- Apresentação da empresa Wayne Industries
- Informações sobre o sistema
- Acesso ao login
- Design responsivo com tema Batman

### 🔐 Autenticação
- **Login** (`/login`): Acesso ao sistema
- **Registro** (`/register`): Criação de nova conta
- **Recuperação** (`/forgot-password`): Reset de senha
- **Confirmação** (`/confirm`): Verificação de email

### 📊 Dashboard (`/dashboard`)
- Visão geral do sistema
- Métricas em tempo real
- Gráficos interativos
- Ações rápidas

### 📦 Recursos (`/resources`)
- Listagem de todos os recursos
- Filtros avançados
- CRUD completo
- Atribuição de recursos

### 📋 Logs de Acesso (`/access-logs`)
- Histórico de atividades
- Filtros por data e ação
- Exportação de relatórios
- Visualização detalhada

### 👥 Usuários (`/users`) - Apenas Admins
- Gerenciamento de usuários
- Atribuição de roles
- Visualização de perfis

---

## 🎨 Design e UX

### Tema Visual
- **Paleta de Cores**: Inspirada no universo Batman
- **Tipografia**: Moderna e legível
- **Ícones**: Lucide React para consistência
- **Animações**: Transições suaves e feedback visual

### Responsividade
- Design mobile-first
- Adaptação para tablets e desktops
- Navegação otimizada para touch

### Acessibilidade
- Componentes Radix UI acessíveis
- Contraste adequado
- Navegação por teclado
- Labels descritivos

---

## 🔒 Segurança

### Autenticação
- JWT tokens seguros
- Refresh tokens automáticos
- Logout automático por inatividade

### Autorização
- Row Level Security (RLS) no Supabase
- Políticas de acesso granulares
- Validação no frontend e backend

### Proteção de Dados
- Validação de entrada com Zod
- Sanitização de dados
- Logs de auditoria

---

## 📈 Performance

### Otimizações Implementadas
- Code splitting com React.lazy
- Memoização de componentes
- Lazy loading de imagens
- Compressão de assets

### Métricas
- Tempo de carregamento otimizado
- Bundle size reduzido
- Renderização eficiente

---

## 🧪 Testes e Qualidade

### Ferramentas de Qualidade
- ESLint para padronização de código
- TypeScript para tipagem estática
- Prettier para formatação consistente

### Boas Práticas
- Componentes reutilizáveis
- Hooks customizados
- Separação de responsabilidades
- Código limpo e documentado

---

## 🚀 Deploy e Produção

### Build de Produção
```bash
npm run build
```

### Variáveis de Ambiente de Produção
- Configure as URLs corretas do Supabase
- Defina as chaves de API de produção
- Configure domínios permitidos

---

## 📚 Aprendizados e Desafios

### Principais Aprendizados
- Integração completa frontend-backend
- Implementação de autenticação robusta
- Desenvolvimento de dashboards interativos
- Gerenciamento de estado complexo
- Segurança em aplicações web

### Desafios Superados
- Configuração de RLS no Supabase
- Implementação de filtros avançados
- Otimização de performance
- Design responsivo complexo

---

## 🔮 Próximas Funcionalidades

- [ ] Notificações em tempo real
- [ ] Relatórios avançados em PDF
- [ ] Integração com APIs externas
- [ ] Sistema de backup automático
- [ ] App mobile com React Native

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte do curso de Desenvolvimento Full Stack da Infinity School.

---

## 👩‍💻 Sobre a Desenvolvedora

**Sabrina Pinheiro**
- 🌐 Website: [www.spdev.com.br](https://www.spdev.com.br)
- 🎓 Estudante de Desenvolvimento Full Stack - Infinity School
- 💼 Especializada em React, TypeScript e desenvolvimento web moderno

---

## 🙏 Agradecimentos

- **Infinity School** pela excelente formação em desenvolvimento full stack
- **Comunidade Open Source** pelas ferramentas e bibliotecas utilizadas
- **DC Comics** pela inspiração do universo Batman/Wayne Industries

---

<div align="center">
  <p><strong>Wayne Industries - Protegendo Gotham através da tecnologia</strong></p>
  <p><em>Desenvolvido com ❤️ por Sabrina Pinheiro</em></p>
</div>
