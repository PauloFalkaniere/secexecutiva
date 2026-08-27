# Secretaria Executiva — publicar no GitHub com banco de dados

Este pacote contém o sistema pronto para deixar de ser só uma pré-visualização e passar a ser um site de verdade, com login por conta e dados salvos com segurança na nuvem (não mais só no navegador).

Arquivos:
- `index.html` — o sistema completo, pronto para hospedar.
- `schema.sql` — o comando que cria a tabela e a segurança no banco de dados.
- `README.md` — este guia.

## O que muda a partir de agora

Antes, os dados ficavam salvos só no navegador de quem estava usando (IndexedDB): se limpasse o cache ou trocasse de computador, perdia tudo, e não tinha como duas pessoas usarem o mesmo sistema em conjunto.

Agora, o `index.html` já vem preparado para funcionar com o [Supabase](https://supabase.com), um banco de dados na nuvem gratuito. Cada pessoa cria sua própria conta (e-mail + senha) e os dados dela ficam salvos ali, protegidos: cada conta só enxerga os próprios dados.

Sem configurar nada, o sistema continua funcionando exatamente como antes — modo local, sem login. É o que você vê hoje na pré-visualização do artefato do Claude, e é também o que acontece se você abrir o `index.html` direto no navegador sem seguir os passos abaixo. Isso é proposital: o sistema nunca fica "quebrado" por falta de configuração.

## Passo 1 — Testar localmente (opcional)

Antes de mexer em qualquer coisa, dê um duplo-clique no `index.html` e confira que ele abre e funciona normalmente no navegador, do jeito que já estava. Isso confirma que o arquivo não corrompeu no download.

## Passo 2 — Criar o projeto gratuito no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita (dá para entrar direto com GitHub).
2. Clique em **New Project**.
3. Dê um nome (ex.: `secretaria-executiva`), crie uma senha forte para o banco (guarde-a em um lugar seguro) e escolha uma região próxima (ex.: South America - São Paulo, se aparecer na lista).
4. Aguarde o projeto terminar de ser criado (leva menos de um minuto).

## Passo 3 — Criar a tabela e a segurança (RLS)

1. No menu à esquerda do projeto, abra o **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `schema.sql` deste pacote, copie todo o conteúdo e cole no editor.
4. Clique em **Run**. Deve aparecer "Success. No rows returned".

Isso cria a tabela `secex_data` (uma linha por conta) e a regra de segurança que impede uma conta de ler ou alterar os dados de outra — mesmo que alguém tentasse manipular o site pelo navegador, o próprio banco de dados bloqueia.

## Passo 4 — Pegar a URL e a chave do projeto

1. No menu à esquerda, vá em **Project Settings** → **Data API** (em versões mais antigas da interface, o menu se chama só **API**).
2. Copie o **Project URL** (algo como `https://xxxxxxxx.supabase.co`).
3. Copie a chave **anon public** — não confunda com a `service_role`, que é secreta e nunca deve entrar no site.

## Passo 5 — Conectar o sistema ao seu projeto

1. Abra o `index.html` em um editor de texto (Bloco de Notas, VS Code, etc. — não precisa de nada especial).
2. Procure estas linhas perto do início do arquivo:

   ```html
   <script>
     window.SECEX_SUPABASE_URL = "";
     window.SECEX_SUPABASE_ANON_KEY = "";
   </script>
   ```

3. Cole a URL e a chave copiadas no Passo 4:

   ```html
   <script>
     window.SECEX_SUPABASE_URL = "https://xxxxxxxx.supabase.co";
     window.SECEX_SUPABASE_ANON_KEY = "eyJhbGciOi....";
   </script>
   ```

4. Salve o arquivo. A partir de agora, ao abrir o `index.html`, vai aparecer uma tela de login/cadastro em vez do sistema direto.

**Sobre segurança:** essa chave "anon" é feita para ficar visível no código do site — ela sozinha não dá acesso a nada, porque a proteção de verdade é a regra criada no Passo 3. Nunca coloque a chave `service_role` no `index.html`.

## Passo 6 — Criar sua conta no sistema

Abra o `index.html` (local ou já publicado) e clique em "Criar uma conta". Informe seu e-mail e uma senha (mínimo 6 caracteres). Por padrão, o Supabase manda um e-mail de confirmação antes de liberar o primeiro login — confirme pelo link recebido e depois entre normalmente.

Se quiser desativar essa confirmação por e-mail (útil enquanto está só testando internamente), isso fica em **Authentication** → **Providers** → **Email** → desmarcar **Confirm email**, no painel do Supabase.

## Passo 7 — Subir para o GitHub

1. Crie um repositório vazio em [github.com/new](https://github.com/new) — dê um nome como `secretaria-executiva` e **não** marque para criar README/`.gitignore` automaticamente (evita conflito com os arquivos deste pacote).
2. No computador, com o Git instalado, abra um terminal na pasta onde estão `index.html`, `schema.sql` e `README.md` e rode:

   ```bash
   git init
   git add index.html schema.sql README.md
   git commit -m "Sistema de secretaria executiva do presbiterio"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/secretaria-executiva.git
   git push -u origin main
   ```

## Passo 8 — Publicar com o GitHub Pages

1. No repositório, vá em **Settings** → **Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
4. Em um ou dois minutos, o GitHub mostra o endereço público, parecido com `https://SEU-USUARIO.github.io/secretaria-executiva/`.

Esse é o link que você compartilha com os colegas para testar.

**Repositório público ou privado?** O `index.html` não guarda nenhum dado de pessoas (nomes, reuniões, etc.) — isso fica só no Supabase, protegido por login. Por isso é seguro manter o repositório público. Se preferir mesmo assim deixá-lo privado, vale saber que publicar GitHub Pages a partir de um repositório privado exige um plano pago do GitHub (Pro, Team ou Enterprise); no plano gratuito, o Pages funciona a partir de repositórios públicos.

## Por que Supabase, e não outro banco gratuito

Pesquisei as opções mais usadas para este tipo de sistema (um site estático como o seu, sem servidor próprio) e a recomendação é o **Supabase**, pelos motivos abaixo. O código deste pacote já foi implementado especificamente para ele.

**Supabase** (recomendado): banco de dados Postgres de verdade, com login (e-mail/senha) e as regras de segurança (RLS) já embutidos em um único serviço. Plano gratuito atual: 500 MB de banco de dados, 1 GB de arquivos, 50 mil usuários ativos por mês, número ilimitado de chamadas à API (dentro de limites de banda: 5 GB de tráfego por mês), até 2 projetos gratuitos por conta. O único cuidado: um projeto gratuito é pausado automaticamente depois de 1 semana sem nenhum acesso — basta entrar no painel e clicar em "Restore" para reativá-lo, sem perder dado nenhum.

**Firebase (Google)** — alternativa válida, mas exigiria reescrever a parte de login e salvamento do zero para usar as bibliotecas do Firebase em vez do Supabase. Plano gratuito (Spark): 1 GiB de banco (Firestore), 50 mil leituras e 20 mil gravações por dia, 50 mil usuários de autenticação por mês. Os limites diários de leitura/gravação dificilmente seriam um problema para uma secretaria, mas o modelo de dados (NoSQL) e a forma de configurar segurança são diferentes do Postgres/SQL do Supabase.

Não recomendo bancos "só banco" sem autenticação embutida (como Neon ou Turso) para este caso: eles resolvem só a parte de armazenamento, e você teria que montar um serviço de login separado por conta própria — mais trabalho para o mesmo resultado que o Supabase já entrega pronto.

## Limitações do plano gratuito para ficar de olho

- O projeto do Supabase pausa sozinho após 1 semana sem acesso nenhum — se isso acontecer, é só entrar no painel e reativar (nenhum dado é perdido).
- Os anexos de documentos (PDFs) continuam guardados dentro dos dados de cada conta, como hoje. Isso funciona bem em volume moderado; se um dia os anexos somarem centenas de MB, vale migrar para o Supabase Storage (armazenamento de arquivos separado) — isso pode ser feito depois, sem afetar o que já estiver funcionando.
- O plano gratuito permite até 2 projetos Supabase por conta — mais que suficiente para este sistema.

## Testando com os colegas

Cada colega que for testar cria a própria conta (Passo 6) pelo link do GitHub Pages, e cada conta enxerga só os próprios dados — é o modelo "cada um com os seus dados, sem perigo de perder nada" que você pediu.

Se, depois dos testes, vocês decidirem que várias pessoas precisam editar os **mesmos** dados de um único presbitério (em vez de cada uma ter sua cópia separada), me avise: dá para evoluir o sistema para "uma conta por presbitério, com vários usuários convidados", mas é uma mudança de estrutura maior — faz mais sentido decidir isso depois que o primeiro modelo estiver rodando com os colegas.
