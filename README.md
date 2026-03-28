# Lista de compra

Aplicação web para montar lista de compras, lista do mercado (com valores ou modo simples), comprar novamente e acompanhar o balanço. Os dados ficam guardados no **navegador** (localStorage).

## Requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (recomendado a versão LTS atual)
- npm (incluído no Node)

## Instalação

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPO.git
cd SEU-REPO
npm install
```

## Scripts

| Comando        | Descrição                          |
|----------------|-------------------------------------|
| `npm run dev`  | Servidor de desenvolvimento (Vite)  |
| `npm run build`| Compilação TypeScript + bundle produção |
| `npm run preview` | Pré-visualização da build local |

## Publicar no GitHub

1. Crie um repositório novo em [github.com/new](https://github.com/new) (sem README se já tiver um localmente, ou faça merge depois).
2. Na pasta do projeto:

```bash
git init
git add .
git commit -m "Initial commit: lista de compra"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

3. Substitua `SEU-USUARIO` e `SEU-REPO` pelo seu utilizador e nome do repositório.

Se o repositório remoto já tiver ficheiros (ex.: README criado no site), use `git pull origin main --allow-unrelated-histories` antes do primeiro `push`, ou crie o repo vazio.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Framer Motion, Recharts

## Licença

Uso privado / projeto pessoal — ajuste conforme necessário.
