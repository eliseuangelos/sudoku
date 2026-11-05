# SUDOKU

Sudoku em HTML5, CSS3 e JavaScript puro. Sem dependências, sem backend, funciona offline e em hospedagem estática (GitHub Pages).

## Executar
Abra `index.html` no navegador, ou sirva a pasta: `python3 -m http.server` e acesse http://localhost:8000.

## Arquivos
- `index.html`: estrutura semântica.
- `style.css`: visual, responsividade, animações e impressão (`@media print`, `@page` A4).
- `sudoku-engine.js`: geração (backtracking randomizado), unicidade (para em 2 soluções), avaliador lógico (singles, locked candidates, pares) e contingência.
- `app.js`: interface, teclado, anotações, dicas, revelação, cronômetro e impressão.
- `sudoku-game.js`: estado da partida sem DOM (desfazer/refazer, contador, progresso, cronômetro, dica, salvamento validado em localStorage).
- `sudoku-worker.js`: gera o desafio em segundo plano (Web Worker); sem Worker, a geração roda na thread principal.
- `favicon.svg`: ícone da aba (número 9 neon sobre fundo preto).
- `tests/run-tests.js`: testes automatizados do motor e da lógica da partida (`node tests/run-tests.js`).
- `tests/browser-tests.py`: testes no Chromium (Playwright): interface, salvamento, impressão A4 e responsividade (`python3 tests/browser-tests.py`).
