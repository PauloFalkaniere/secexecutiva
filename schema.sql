-- Secretaria Executiva — schema do Supabase
-- Cole este arquivo inteiro no SQL Editor do seu projeto Supabase e clique em "Run".
--
-- O que isto faz:
-- Cria UMA tabela (secex_data) com uma linha por usuário logado. Cada
-- linha guarda todos os dados daquele presbitério/secretário em uma
-- única coluna "data" (formato JSON). O Row Level Security (RLS) abaixo
-- garante, dentro do próprio banco, que um usuário nunca consegue ler
-- ou escrever a linha de outro usuário — mesmo que tentasse manipular
-- o aplicativo pelo navegador.

create table if not exists secex_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table secex_data enable row level security;

-- Cada usuário só pode ler/inserir/atualizar/excluir a própria linha.
create policy "Usuarios acessam somente os proprios dados"
  on secex_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
