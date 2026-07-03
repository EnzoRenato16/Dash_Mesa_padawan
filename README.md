# Mesa Padawan — Ranking de Performance

Dashboard de ranking de performance da mesa de assessores (EWZ Capital),
originalmente criado no Base44 e adaptado para rodar **100% no GitHub Pages**,
com **frontend e backend funcionando**, incluindo login.

## Como funciona o "backend" no GitHub Pages

O GitHub Pages é uma hospedagem **estática** — ele só serve arquivos (HTML, CSS,
JS) e **não roda servidor**. O Base44 original dependia de um backend hospedado
(banco de dados, autenticação e upload de arquivos).

Para funcionar sem servidor, o backend do Base44 foi substituído por um
**backend que roda no próprio navegador**, em `src/api/backend/`, com a mesma
interface usada pelo app (`db.auth`, `db.entities`, `db.integrations`):

- **Autenticação** (`auth.js`): cadastro/login por email e senha. As senhas são
  guardadas com hash (SHA‑256 + salt) no `localStorage`. Há uma conta de
  administrador criada automaticamente no primeiro acesso.
- **Banco de dados** (`entities.js`): as entidades `TeamMember` e `WeeklyEntry`
  são persistidas no `localStorage` (list/filter/get/create/bulkCreate/update/delete).
- **Upload de fotos** (`integrations.js`): a imagem é redimensionada no navegador
  e guardada como *data URL*, sem precisar de storage externo.

### Conta de administrador padrão

No primeiro acesso, uma conta admin é criada:

- **Email:** `admin@mesa.local`
- **Senha:** `admin123`

Faça login com ela ou crie a sua própria conta em **Criar conta**. Recomenda‑se
trocar essas credenciais (veja "Variáveis de ambiente").

> A área do líder (abas Histórico, Análise, Equipe e o formulário do Líder)
> continua protegida pela senha do líder: **`AAAaaa123`** (definida em
> `src/components/PasswordGate.jsx`).

### Importante: onde os dados ficam salvos

Como não há servidor, **os dados ficam salvos no navegador de cada pessoa**
(`localStorage`). Ou seja, o que o líder cadastra no computador dele **não
aparece automaticamente** no navegador de outra pessoa ou em outro dispositivo.

Isso é perfeito para uso individual / em um único computador (por exemplo, o
computador da mesa). Se você precisar que **todos vejam os mesmos dados** entre
dispositivos, é necessário um backend compartilhado real — veja a seção
"Backend compartilhado (opcional)".

## Rodar localmente

```bash
npm install
npm run dev
```

Abra a URL que o Vite imprimir (por padrão `http://localhost:5173`).

Para gerar a versão de produção e testar:

```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages

O deploy é automático via GitHub Actions (`.github/workflows/deploy.yml`):

1. Faça o merge/push deste código para a branch **`main`**.
2. No GitHub: **Settings → Pages → Build and deployment → Source: “GitHub Actions”**.
3. A cada push na `main`, o site é construído e publicado. A URL aparece em
   **Settings → Pages** (algo como `https://<usuário>.github.io/<repositório>/`).

Detalhes que fazem funcionar em qualquer caminho do Pages:

- O roteamento usa **HashRouter** (`/#/login`, `/#/register`…), então links
  diretos e o refresh da página **não dão 404** (não precisa de regras de
  reescrita no servidor).
- O Vite usa `base: './'`, então os arquivos carregam tanto na raiz do domínio
  quanto em um subcaminho `.../<repositório>/`.

## Variáveis de ambiente (opcionais)

Para definir outra conta admin padrão, crie um arquivo `.env` (ou configure as
variáveis no build):

```bash
VITE_ADMIN_EMAIL=voce@empresa.com
VITE_ADMIN_PASSWORD=umaSenhaForte
```

Essas variáveis só têm efeito quando **ainda não existe nenhuma conta** (ou seja,
no primeiro acesso / `localStorage` vazio).

## Backend compartilhado (opcional)

Se precisar que os dados sejam compartilhados entre pessoas/dispositivos, troque
o backend local por um serviço externo (que funciona junto com um site estático),
por exemplo **Supabase** ou **Firebase**. Basta reimplementar a mesma interface
de `src/api/backend/` (`auth`, `entities`, `integrations`) usando o SDK do
serviço escolhido — o restante do app não precisa mudar, pois tudo passa por
`src/api/base44Client.js`.

## Estrutura

- `src/api/backend/` — backend local (auth, entidades, integrações).
- `src/api/base44Client.js` — ponto único que expõe o `db` para o app.
- `src/pages/` — páginas (Home, Login, Register, ForgotPassword, ResetPassword).
- `src/components/padawan/` — abas do dashboard (Ranking, Lançamento, Histórico,
  Análise, Equipe, Regras).
- `src/lib/scoring.js` — regras de pontuação.
- `base44/entities/` — esquemas originais das entidades (referência).
