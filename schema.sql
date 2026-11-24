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

-- Visitantes sem login (papel "anon") não têm NENHUM acesso à tabela —
-- nem mesmo se uma política for criada por engano no futuro.
revoke all on table secex_data from anon;
grant select, insert, update, delete on table secex_data to authenticated;

-- Cada usuário só pode ler/inserir/atualizar/excluir a própria linha.
-- (Se você já rodou a versão anterior deste arquivo, a linha abaixo
-- substitui a política antiga sem erro.)
drop policy if exists "Usuarios acessam somente os proprios dados" on secex_data;
create policy "Usuarios acessam somente os proprios dados"
  on secex_data
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
