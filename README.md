# SUDOKU

Sudoku em HTML5, CSS3 e JavaScript puro. Sem dependências, sem backend, funciona offline e em hospedagem estática (GitHub Pages).

## Executar
Abra `index.html` no navegador, ou sirva a pasta: `python3 -m http.server` e acesse http://localhost:8000.

## Arquivos
- `index.html`: estrutura semântica.
- `style.css`: visual, responsividade, animações e impressão (`@media print`, `@page` A4).
- `sudoku-engine.js`: geração (backtracking randomizado), unicidade (para em 2 soluções), avaliador lógico (singles, locked candidates, pares) e contingência.
- `app.js`: interface, teclado, anotações, dicas, revelação, cronômetro e impressão.
