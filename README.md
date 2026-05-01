# 🦺 DashEpis

> Sistema digital de controle de Equipamentos de Proteção Individual (EPIs), desenvolvido para modernizar e substituir processos manuais por um fluxo seguro, rastreável e eficiente.

---

## 📌 Sobre o Projeto

O **EPI System** foi criado para resolver a ausência de um sistema formal de controle de EPIs no SENAI SC Joinville. Sem esse controle, a instituição enfrentava desorganização, riscos à integridade física dos usuários, exposição jurídica e prejuízos financeiros.

### Problemas Resolvidos

| Problema | Impacto | Solução |
|---|---|---|
| Falta de rastreabilidade | Equipamentos perdidos ou extraviados | Registro digital com histórico completo |
| Estoque descontrolado | Reposição ineficiente e custos elevados | Gestão de estoque automatizada |
| Sem controle de uso | Riscos de segurança e acidentes | Solicitação e aprovação digitalizada |
| Ausência de registros | Multas e problemas jurídicos | Conformidade com normas de segurança |
| Processos manuais | Retrabalho e erros humanos | Fluxo digital e automatizado |

---

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js / React
- **Backend/BaaS:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Autenticação:** Supabase Auth com Triggers automáticos
- **Banco de Dados:** PostgreSQL com Row Level Security (RLS) habilitado

---

## 👥 Tipos de Usuário

O sistema possui dois perfis com permissões e interfaces distintas:

### 🔐 Administrador / Funcionário
Cadastrado manualmente pela rota `/cadastrar` (acesso restrito). Tem acesso ao painel de gestão completo.

### 🎓 Aluno
Cadastrado via `/cadastro` (público). Tem acesso ao catálogo de EPIs e acompanhamento das próprias solicitações.

> A diferenciação de perfis é feita automaticamente via **Trigger no banco de dados** com base nos metadados enviados no momento do cadastro (`raw_user_meta_data->>'tipo'`).

---

## 🗺️ Rotas da Aplicação

### Públicas (todos os usuários)

| Rota | Descrição |
|---|---|
| `/` | Página de apresentação geral do sistema |
| `/login` | Login para contas já existentes (aluno ou funcionário) |
| `/cadastro` | Cadastro de novos usuários — todos registrados aqui são **alunos** |

### Administradores / Funcionários

| Rota | Descrição |
|---|---|
| `/dashboard` | Visão geral do estoque, entregas e validações pendentes |
| `/epis` | CRUD completo de EPIs |
| `/gerenciar-solicitacoes` | Análise, aprovação ou rejeição de solicitações de empréstimo |
| `/cadastrar` | Cadastro de novos colaboradores com permissão de administrador |
| `/perfil-adm` | Exibe e permite atualizar o perfil do funcionário |

### Alunos

| Rota | Descrição |
|---|---|
| `/dashboard-aluno` | Visão geral rápida dos EPIs ativos e solicitações recentes |
| `/catalogo-epis` | Exibe todos os EPIs disponíveis e permite realizar solicitações |
| `/minhas-solicitacoes` | Histórico completo de todas as solicitações do aluno |
| `/perfil` | Exibe e permite atualizar o perfil do aluno |

---

## 🗄️ Banco de Dados

### Diagrama de Entidades

```
auth.users
    │
    ├──► funcionario (auth_id)
    │         └──► funcionario_has_epis
    │
    └──► aluno (auth_id)
              ├──► aluno_has_epis
              ├──► aluno_has_turma ◄──── turma
              └──► solicitacoes ◄──────── epis
```

### Tabelas

#### `funcionario`
Armazena os dados dos funcionários/administradores do sistema.

| Coluna | Tipo | Descrição |
|---|---|---|
| `idfuncionario` | SERIAL PK | Identificador único |
| `auth_id` | UUID FK | Referência ao usuário no Supabase Auth |
| `nome` | VARCHAR(70) | Nome do funcionário |
| `sobrenome` | VARCHAR(70) | Sobrenome |
| `cpf` | VARCHAR(14) UNIQUE | CPF |
| `email` | VARCHAR(70) UNIQUE | E-mail |
| `funcao` | VARCHAR(70) | Função/cargo |
| `status` | VARCHAR(10) | `'Ativo'` ou `'Inativo'` (default: `'Ativo'`) |
| `data_nascimento` | DATE | Data de nascimento |
| `telefone` | VARCHAR(15) | Telefone de contato |

#### `aluno`
Armazena os dados dos alunos.

| Coluna | Tipo | Descrição |
|---|---|---|
| `idaluno` | SERIAL PK | Identificador único |
| `auth_id` | UUID FK | Referência ao usuário no Supabase Auth |
| `nome` | VARCHAR(45) | Nome do aluno |
| `sobrenome` | VARCHAR(100) | Sobrenome |
| `cpf` | VARCHAR(14) UNIQUE | CPF |
| `email` | VARCHAR(100) UNIQUE | E-mail |
| `data_nascimento` | DATE | Data de nascimento |
| `telefone` | VARCHAR(15) | Telefone de contato |
| `foto` | VARCHAR(255) | URL da foto de perfil |

#### `epis`
Cadastro de todos os Equipamentos de Proteção Individual disponíveis.

| Coluna | Tipo | Descrição |
|---|---|---|
| `idepis` | SERIAL PK | Identificador único |
| `nome` | VARCHAR(45) | Nome do EPI |
| `tipo` | VARCHAR(45) | Tipo/categoria |
| `quantidade` | INT | Quantidade em estoque (default: `0`) |
| `disponivel` | BOOLEAN | Disponível para empréstimo (default: `true`) |
| `data_validade` | DATE | Data de validade do equipamento |
| `codigo_patrimonio` | VARCHAR(20) UNIQUE | Código de patrimônio |
| `descricao` | TEXT | Descrição detalhada |
| `ativo` | BOOLEAN | Se o EPI está ativo no sistema (default: `true`) |
| `foto` | VARCHAR(255) | URL da foto do EPI |

#### `turma`
Gerencia as turmas de alunos.

| Coluna | Tipo | Descrição |
|---|---|---|
| `idturma` | SERIAL PK | Identificador único |
| `nome` | VARCHAR(70) | Nome da turma |
| `nomenclatura` | VARCHAR(70) | Nomenclatura/código da turma |
| `data_inicio` | DATE | Data de início |
| `data_termino` | DATE | Data de término |
| `horario_inicio` | TIME | Horário de início das aulas |
| `horario_termino` | TIME | Horário de término das aulas |
| `capacidade_maxima` | INT | Número máximo de alunos |

#### `solicitacoes`
Registra todas as solicitações de EPIs feitas pelos alunos.

| Coluna | Tipo | Descrição |
|---|---|---|
| `idsolicitacoes` | SERIAL PK | Identificador único |
| `aluno_id` | INT FK | Referência ao aluno |
| `epis_id` | INT FK | Referência ao EPI solicitado |
| `status` | VARCHAR(20) | `'pendente'`, `'aprovado'`, `'rejeitado'`, `'entregue'`, `'devolvido'` |
| `data_solicitacao` | DATE | Data da solicitação (default: hoje) |
| `data_aprovacao` | DATE | Data em que foi aprovado |
| `data_entrega` | DATE | Data de entrega ao aluno |
| `data_devolucao` | DATE | Data de devolução |
| `motivo_rejeicao` | VARCHAR(255) | Motivo em caso de rejeição |

#### `funcionario_has_epis`
Registro de EPIs entregues diretamente a funcionários.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_entrega_func` | SERIAL PK | Identificador único |
| `funcionario_id` | INT FK | Referência ao funcionário |
| `epis_id` | INT FK | Referência ao EPI |
| `data_entrega` | DATE | Data de entrega (default: hoje) |
| `data_devolucao` | DATE | Data de devolução (nullable) |

#### `aluno_has_epis`
Registro de EPIs entregues diretamente a alunos (fora do fluxo de solicitações).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_entrega_aluno` | SERIAL PK | Identificador único |
| `aluno_id` | INT FK | Referência ao aluno |
| `epis_id` | INT FK | Referência ao EPI |
| `data_entrega` | DATE | Data de entrega (default: hoje) |

#### `aluno_has_turma`
Relaciona alunos às suas turmas (N:N).

| Coluna | Tipo | Descrição |
|---|---|---|
| `aluno_id` | INT FK | Referência ao aluno (PK composta) |
| `turma_id` | INT FK | Referência à turma (PK composta) |
| `data_matricula` | DATE | Data da matrícula |
| `status` | VARCHAR(15) | `'Matriculado'`, `'Trancado'`, `'Concluído'` |

---

## ⚙️ Trigger de Autenticação

Ao criar um novo usuário no Supabase Auth, um **Trigger automático** (`on__createdauth_user`) é disparado. Ele lê o campo `raw_user_meta_data` e insere o registro na tabela correta:

- Se `tipo = 'funcionario'` → insere em `public.funcionario`
- Se `tipo = 'aluno'` → insere em `public.aluno`

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'tipo' = 'funcionario' THEN
    INSERT INTO public.funcionario (auth_id, nome, sobrenome, cpf, email, funcao)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'sobrenome',
      NEW.raw_user_meta_data->>'cpf',
      NEW.email,
      NEW.raw_user_meta_data->>'funcao'
    );
  ELSIF NEW.raw_user_meta_data->>'tipo' = 'aluno' THEN
    INSERT INTO public.aluno (auth_id, nome, sobrenome, cpf, email)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'sobrenome',
      NEW.raw_user_meta_data->>'cpf',
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on__createdauth_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 🔒 Segurança (Row Level Security)

Row Level Security (RLS) está habilitado em **todas as tabelas** do schema público:

```sql
ALTER TABLE public.funcionario         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epis                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionario_has_epis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno_has_epis      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno_has_turma     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes        ENABLE ROW LEVEL SECURITY;
```

> As policies de RLS devem ser configuradas no Supabase para definir quais roles podem ler/escrever em cada tabela. Funcionários têm acesso amplo; alunos acessam apenas seus próprios dados.

---

## 🔄 Fluxo de Solicitação de EPI

```
Aluno acessa /catalogo-epis
        │
        ▼
Solicita um EPI disponível
        │
        ▼
Registro criado em `solicitacoes` com status = 'pendente'
        │
        ▼
Funcionário acessa /gerenciar-solicitacoes
        │
        ├── Aprova ──► status = 'aprovado' → data_aprovacao preenchida
        │                    │
        │                    ▼
        │             Entrega física realizada
        │                    │
        │                    ▼
        │             status = 'entregue' → data_entrega preenchida
        │                    │
        │                    ▼
        │             Devolução realizada
        │                    │
        │                    ▼
        │             status = 'devolvido' → data_devolucao preenchida
        │
        └── Rejeita ──► status = 'rejeitado' → motivo_rejeicao preenchido
```

---

## 📂 Estrutura de Pastas Sugerida

```
/
├── app/                        # Rotas Next.js (App Router)
│   ├── page.tsx                # /
│   ├── login/
│   ├── cadastro/
│   ├── dashboard/              # Admin
│   ├── epis/                   # Admin
│   ├── gerenciar-solicitacoes/ # Admin
│   ├── cadastrar/              # Admin
│   ├── perfil-adm/             # Admin
│   ├── dashboard-aluno/        # Aluno
│   ├── catalogo-epis/          # Aluno
│   ├── minhas-solicitacoes/    # Aluno
│   └── perfil/                 # Aluno
├── components/
├── lib/
│   └── supabase.ts             # Client do Supabase
├── types/
│   └── database.ts             # Tipos gerados do Supabase
└── ...
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/epi-system.git
cd epi-system

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

### Configuração do Banco

1. Acesse o **SQL Editor** do seu projeto Supabase
2. Execute os scripts de criação de tabelas na ordem correta
3. Execute o script do Trigger `handle_new_user`
4. Configure as **RLS Policies** para cada tabela conforme os perfis

### Rodar em Desenvolvimento

```bash
npm run dev
```

Acesse em `http://localhost:3000`.

---

## 📋 Convenções para IA / Contribuição

Para quem for trabalhar neste projeto com auxílio de IA ou como contribuidor, seguem pontos importantes:

- **Autenticação** é feita inteiramente via Supabase Auth. Nunca armazene senhas diretamente nas tabelas.
- O campo `auth_id` nas tabelas `funcionario` e `aluno` é a ponte entre o Supabase Auth e os dados da aplicação.
- Ao criar um novo usuário no frontend, sempre passe `raw_user_meta_data` com os campos: `tipo`, `nome`, `sobrenome`, `cpf` e (se funcionário) `funcao`.
- O **tipo do usuário** (aluno vs funcionário) é determinado **no momento do cadastro** via metadata — não há campo de role separado.
- Todas as tabelas têm RLS habilitado. Qualquer query direta sem policy configurada vai retornar vazio ou erro.
- O status de uma solicitação só avança — nunca retrocede. Respeite a ordem: `pendente → aprovado → entregue → devolvido` (ou `pendente → rejeitado`).
- Campos de foto (`aluno.foto`, `epis.foto`) armazenam a URL pública do arquivo no Supabase Storage.
