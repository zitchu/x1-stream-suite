# Épico 01: Overlays do Campeonato de Pokémon X1?

## 🎯 Visão Geral
Este épico engloba o desenvolvimento, refatoração e otimização dos componentes e telas de overlays para transmissões de campeonatos de Pokémon. A suíte é projetada para ser consumida como Browser Sources do OBS, permitindo sobrepor elementos gráficos ao gameplay com fundo transparente.

## 📋 Lista de User Stories
- **US 01.1 - Split Game HUDs (Left / Right)**: Separação do HUD do jogo em duas telas distintas (`/game-hud-l` e `/game-hud-r`) para permitir posicionamento independente em transmissões competitivas.
- **US 01.2 - Pokemon Dynamic Data**: Integração dinâmica com a PokéAPI para exibir dados e sprites reais dos Pokémon no HUD.
- **US 01.3 - Logo Customization and Sizing**: Customização da exibição e dimensionamento da marca X1? diferenciando os HUDs das telas principais de intermissão.
- **US 01.4 - HUD Control Panel**: Painel de controle em tempo real para edição dinâmica de placar, jogadores e dados de Pokémon via BroadcastChannel.
