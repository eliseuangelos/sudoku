/* Geração em segundo plano: a interface não congela. Recebe o nível e devolve o desafio. */
importScripts('sudoku-engine.js?v=10');
onmessage=e=>postMessage(SudokuEngine.generate(e.data));
