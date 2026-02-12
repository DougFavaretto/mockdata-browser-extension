# MockData Browser Extension

Extensao para Chrome (MV3) que gera dados fake em campos editaveis via menu de contexto e atalhos configuraveis.

## Stack

- TypeScript
- Vite + CRXJS
- React (popup)
- Tailwind CSS v4
- Biome (lint + format)
- Vitest
- Faker (email, URL e textos)

## Requisitos

- Node.js 20+
- pnpm

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm test
```

## Como carregar no Chrome

1. Rode `pnpm build`.
2. Abra `chrome://extensions`.
3. Ative `Modo do desenvolvedor`.
4. Clique em `Carregar sem compactacao`.
5. Selecione a pasta `dist`.

## Funcionalidades

- Menu de contexto em campos editaveis com item raiz `Gerar dado fake`.
- Subitens do menu refletindo apenas tipos habilitados.
- Fallback inteligente de preenchimento:
  - alvo do clique direito;
  - campo focado, se nao houver alvo valido.
- Popup para configurar:
  - habilitar/desabilitar tipos;
  - atalhos por tipo;
  - formato de data;
  - configuracao do gerador de senha;
  - favoritos.
- Favoritos:
  - tipos favoritos aparecem primeiro na aba principal do popup;
  - tipos favoritos aparecem primeiro no menu de contexto.
- Botao por tipo na aba principal para copiar valor gerado automaticamente.
- Toggle global para habilitar/desabilitar atalhos de teclado.
- Validacao de atalhos:
  - bloqueio de atalhos duplicados;
  - bloqueio de atalhos reservados do navegador.
- Persistencia de configuracao em `chrome.storage.sync` com sanitizacao/migracao automatica.

## Tipos de dados suportados

- CNPJ
- CPF
- Nome completo
- Username
- Senha
- UUID
- Email
- Telefone
- Endereco
- Data
- Numero aleatorio
- Texto aleatorio
- URL
- Placa de carro
- Cartao de credito
- Codigo postal (CEP)
- Lorem ipsum

## Regras de atalhos

- Nenhum tipo vem com atalho padrao.
- Atalhos so funcionam quando `Habilitar atalhos de teclado` estiver ativo.
- Atalhos reservados do navegador sao rejeitados no popup.

## Testes

O projeto possui testes unitarios com Vitest para:

- geradores de dados;
- ordenacao por favoritos;
- validacao e utilitarios de atalho;
- sanitizacao/migracao de storage.
