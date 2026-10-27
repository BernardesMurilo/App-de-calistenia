# Calistenia Tracker

Aplicativo web instalável (PWA) para acompanhar treino A/B/C, registrar séries e repetições, usar cronômetro de descanso e acompanhar histórico com dados locais.

## Como testar
- Abra `index.html` no navegador para testar a interface e o armazenamento local.
- Para instalar como PWA e usar offline, publique a pasta em um endereço HTTPS (por exemplo, GitHub Pages) ou rode um servidor local compatível com service workers.
- No Android/Chrome, abra o site publicado e escolha **Instalar app** ou **Adicionar à tela inicial**.

## Dados
Os dados ficam no `localStorage` do navegador. Use **Histórico → Exportar backup** para salvar um arquivo JSON. Mantenha o arquivo de backup fora do celular também se os registros forem importantes.

## Conteúdo
- `index.html`: estrutura do app
- `styles.css`: layout responsivo
- `app.js`: treinos, registros, histórico, temporizador e backup
- `manifest.json`: configuração de instalação
- `sw.js`: cache para funcionamento offline
- `icon.svg`: ícone
