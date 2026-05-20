# Manual de Operação - X1? Stream Suite

## Visão Geral

Este manual foi criado para o operador da transmissão, sem necessidade de programar. O projeto é controlado pelo frontend e pensa em conexão com o OBS via Browser Sources.

## O que cada página faz

- `/control`: painel de controle principal. Aqui se altera placar, nomes, times, formato, e textos de telas de transição.
- `/overlay`: overlay de transmissão com placar, nomes dos jogadores, patrocínio e painel de transmissão.
- `/game-hud-l`: HUD do jogador da esquerda (Time P1).
- `/game-hud-r`: HUD do jogador da direita (Time P2).
- `/starting-soon`: tela de "Starting Soon" com logo animado e texto personalizável.
- `/brb`: tela de intervalo "Be Right Back" com agenda e redes sociais.

## Como usar o painel de controle

1. Abra `/control` no navegador.
2. No topo, use as abas:
   - `Jogo`: configura a partida e os painéis de overlay.
   - `Demais`: configura os textos de `Starting Soon` e `Be Right Back`.
3. Em `Jogo`:
   - `ROUND`: informe o nome do round (por exemplo, "Grand Finals", "Top 8", "Round 1").
   - `FORMATO`: escolha `BO1`, `BO3` ou `BO5`.
   - `Mostrar painel de transmissão`: ativa/desativa o banner de transmissão no overlay.
   - `Mostrar painel de patrocinadores`: ativa/desativa o banner de patrocinadores no overlay.
4. Em `Demais`:
   - `Starting Soon`: altere pré-título, descrição, evento, formato, casters, stream e texto de status.
   - `Be Right Back`: altere manchete, título principal, descrição, títulos de seções e lista de patrocinadores.
5. Todas as mudanças são salvas automaticamente e propagadas para as telas abertas no mesmo navegador via BroadcastChannel/localStorage.

## Usando com OBS

1. Adicione cada rota como `Browser Source` no OBS.
2. Defina tamanho: `1920×1080`.
3. Se o OBS permitir, ative `Transparent` ou use `background-color: transparent` no CSS da fonte do navegador.
4. Certifique-se de que a URL usada no OBS seja a mesma do frontend em execução.
   - Se você rodar localmente com `npm run dev`, use algo como `http://localhost:5173/overlay`.
   - Se estiver hospedado em servidor, use a URL pública correspondente.
5. Para cada cena do OBS:
   - `Overlay`: use `/overlay`.
   - `HUD Esquerdo`: use `/game-hud-l`.
   - `HUD Direito`: use `/game-hud-r`.
   - `Starting Soon`: use `/starting-soon`.
   - `Be Right Back`: use `/brb`.
6. Para ver as mudanças do controle em tempo real, mantenha o `/control` aberto em uma aba do navegador.
   - Se não aparecer imediatamente no OBS, atualize a fonte do navegador.

## Principais pontos de operação

- O `Painel de Controle` atualiza as telas em tempo real.
- Não é preciso alterar código nem arquivos para operar.
- O botão `BO1` foi adicionado: basta clicar no formato desejado.
- A lista de patrocinadores do BRB aceita itens separados por vírgula.
- Ativar/desativar os painéis de transmissão e patrocinadores afeta apenas a tela `/overlay`.

## OBS: configuração de cenas

- Cada Browser Source deve ser independente.
- O `overlay` é a camada superior da transmissão.
- Os HUDs esquerdo e direito são usados como camadas laterais fixas.
- As telas `Starting Soon` e `BRB` são usadas apenas durante pausas.

## Validação de uso / testes rápidos

- Abra `/control` e altere `ROUND` ou `FORMATO`.
- Verifique se `/overlay` reflete esse valor.
- Ative/desative `Mostrar painel de transmissão` e veja se o box aparece/desaparece.
- Altere `Starting Soon` e confirme se `/starting-soon` mostra o novo texto.
- Altere `Be Right Back` e confirme se `/brb` mostra o novo texto e os patrocinadores.

## OBS: possíveis problemas e soluções

- Se o overlay não atualizar:
  - Verifique se a URL no OBS está correta.
  - Atualize a fonte do navegador no OBS.
  - Confirme que `/control` e a fonte do OBS estão no mesmo domínio/local.
- Se o texto não mudar:
  - Confira se você editou o campo correto no painel `Demais`.
  - Refaça o refresh no OBS se o Browser Source estiver congelado.
