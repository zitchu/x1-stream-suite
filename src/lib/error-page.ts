export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Página com erro</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #05070d; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.06); border-radius: 1.5rem; box-shadow: 0 28px 90px -60px rgba(221,13,168,0.8); }
      h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }
      p { color: #cbd5e1; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.65rem 1.1rem; border-radius: 0.75rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #dd0da8; color: #fff; border-color: rgba(255,255,255,0.1); }
      .secondary { background: transparent; color: #fff; border-color: rgba(255,255,255,0.18); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Não foi possível carregar a página</h1>
      <p>Ocorreu um erro no servidor. Atualize ou volte para a tela inicial.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Recarregar</button>
        <a class="secondary" href="/">Voltar ao início</a>
      </div>
    </div>
  </body>
</html>`;
}
