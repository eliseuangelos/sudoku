/* Geração em segundo plano: a interface não congela. Recebe o nível e devolve o desafio. */
importScripts('sudoku-engine.js');
onmessage=e=>postMessage(SudokuEngine.generate(e.data));
