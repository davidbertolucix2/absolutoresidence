# Absoluto Residence

Landing page + área do corretor do **Absoluto Residence** (YES Construtora · Porto Belo/SC).

- Site: `/` — hero full screen com parallax, conceito, lazer em rolagem horizontal, **escolha do andar e da unidade** (fachada interativa → planta do pavimento → planta da unidade, valor e simulação), tipologias, tabela de vendas, localização.
- Área do corretor: `/entrar` → `/membros` (cadastro aberto) e `/admin` (gestão).
- Botão **Fazer proposta** (hero, menu e cada unidade) leva para `/membros/propostas?unidade=XXX`; quem não tem conta cria na hora e volta direto para a proposta.

## Dados

- Unidades, áreas, boxes e valores: `src/data/units.ts` (tabela de vendas 11/2026, atualizada em 04/11/2026). Unidade fora da tabela = vendida.
- Fluxos de pagamento: `src/data/payment.ts` (à vista, entrada + 72x, entrada + mensais + reforços, personalizado; correção CUB/SC).
- Contrato: `src/comercial/contracts.ts` — muda conforme a unidade (andar, tipologia, área, box, loft/mezanino) e o fluxo escolhido (cláusula de preço e pagamento).
- Comissão: 8% do valor de venda (`COMMISSION_RATE` em `src/data/units.ts`).
- Imagens e plantas: `public/img` e `public/plantas` (pasta “Absoluto Residence SC” do Drive).

Para atualizar a tabela, edite a lista `AVAILABLE` em `src/data/units.ts`.

## Área do corretor

Base: área de membros da Lume, adaptada para imóveis.

- Cadastro aberto (nome, e-mail, senha, WhatsApp, CRECI). Conta já entra aprovada; a gestão pode bloquear.
- Clientes (CRM): dados do comprador para o contrato, etapas (lead → visita → proposta → fechado), follow-up de 7 dias.
- Propostas: cliente + unidade + fluxo → contrato pronto, assinatura na tela, impressão/PDF e resumo no WhatsApp.
- Gestão (`admin`): corretores, comissões (lote semanal), dados da construtora para o contrato, backup JSON.

Os dados ficam no `localStorage` do navegador (como na Lume). Para centralizar entre aparelhos é preciso um banco (ex.: Supabase ou Vercel KV).

Login da gestão: o mesmo da Lume (`src/comercial/auth.ts`). Troque a senha antes de divulgar.

## Rodar

```bash
npm install
npm run dev
```

## Deploy

Vercel → importar o repositório → Framework Vite → Build `npm run build` → Output `dist`.
Variável opcional: `VITE_SITE_URL=https://absolutoresidence.vercel.app`.
