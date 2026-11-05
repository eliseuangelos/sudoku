/* app.js — interface: seleção, preenchimento, menu, dicas, histórico, salvamento,
   geração em segundo plano (Web Worker) e impressão. A lógica fica em sudoku-engine.js e sudoku-game.js. */
(()=>{
'use strict';
const E=SudokuEngine,G=SudokuGame,$=s=>document.querySelector(s),LV=['','FÁCIL','MÉDIO','DIFÍCIL'];
const S={sel:-1,notes:false,req:0,busy:false,paused:false,tid:0};
const boardEl=$('#board'),dlg=$('#dlg'),dr=$('#drawer'),sc=$('#scrim'),pad=$('#pad'),cells=[];
let isOpen=false,tt,W;
const can=()=>S.g&&!S.over&&!S.busy;
const save=()=>{if(can())G.save(S)};

// ---------- tabuleiro e teclado numérico (com contador de números restantes) ----------
for(let i=0;i<81;i++){
  const c=document.createElement('div');
  c._b='c'+(i%9%3===2&&i%9<8?' br':'')+((i/9|0)%3===2&&i<72?' bb':'');
  c.className=c._b;c.style.setProperty('--d',(i/9|0)+i%9);c.setAttribute('role','button');c.onclick=()=>select(i);
  boardEl.append(c);cells.push(c);
}
pad.innerHTML=[1,2,3,4,5,6,7,8,9].map(d=>`<button data-d="${d}"><span>${d}</span><small></small></button>`).join('')
  +'<button data-d="0" aria-label="Apagar">⌫</button><button id="pu" data-d="u" aria-label="Desfazer">↶</button><button id="pr" data-d="r" aria-label="Refazer">↷</button>';
pad.onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset.d;d==='u'?undo():d==='r'?redo():put(+d)};

// células com número repetido na linha, coluna ou bloco
function conflicts(){
  const s=new Set();
  for(let i=0;i<81;i++)if(S.v[i])for(const j of E.PEERS[i])if(S.v[j]===S.v[i]){s.add(i);break}
  return s;
}
function paint(){
  const cf=conflicts(),s=S.sel,sv=s>=0?S.v[s]:0;
  cells.forEach((c,i)=>{
    const v=S.v[i],cl=[c._b];
    if(S.f[i])cl.push('giv');else if(v)cl.push(S.r[i]?'rev':'usr');
    if(s>=0){if(i===s)cl.push('sel');else if(E.PEERS[s].includes(i))cl.push('hl');if(sv&&v===sv&&i!==s)cl.push('same')}
    if(cf.has(i)||S.bad.has(i))cl.push('err');
    if(!v)cl.push('nts');
    c.className=cl.join(' ');
    c.innerHTML=v||Array.from({length:9},(_,k)=>`<b>${S.n[i]&(1<<(k+1))?k+1:''}</b>`).join('');
    c.tabIndex=(s<0?i===0:i===s)?0:-1;
    c.setAttribute('aria-pressed',i===s);
    c.setAttribute('aria-label',`Linha ${(i/9|0)+1}, coluna ${i%9+1}, ${v?(S.f[i]?'fixo ':'')+v:'vazia'}`);
  });
}
// contadores, progresso e estados desabilitados (desfazer/refazer)
function ui(){
  const c=G.counts(S),[f,t]=G.progress(S),sv=S.sel>=0?S.v[S.sel]:0;
  pad.querySelectorAll('button').forEach(b=>{
    const d=+b.dataset.d;if(!(d>0))return;
    b.classList.toggle('done',!c[d]);b.classList.toggle('cur',d===sv);
    b.querySelector('small').textContent=c[d]||'✓';
    b.setAttribute('aria-label',`Número ${d}, ${c[d]?c[d]+' restantes':'completo'}`);
  });
  $('#progTxt').textContent=`PROGRESSO: ${f} / ${t}`;$('#progBar').style.width=(t?f/t*100:0)+'%';
  $('#undoBtn').disabled=$('#pu').disabled=S.over||!S.hp;
  $('#redoBtn').disabled=$('#pr').disabled=S.over||S.hp>=S.h.length;
}
const render=()=>{paint();ui()};
function select(i){if(!S.g||S.busy)return;S.sel=i;render();cells[i].focus({preventScroll:true})}

// ---------- preenchimento, histórico e conclusão ----------
function put(d){
  const i=S.sel;if(!can()||i<0||S.f[i])return;
  G.act(S,()=>{
    if(!d){S.v[i]=0;S.n[i]=0;S.r[i]=false}
    else if(S.notes){if(S.v[i])return;S.n[i]^=1<<d}
    else{
      S.v[i]=S.v[i]===d?0:d;S.n[i]=0;S.r[i]=false;
      if(S.v[i])for(const j of E.PEERS[i])S.n[j]&=~(1<<d); // limpa anotações vizinhas
    }
  });
  S.bad.delete(i);render();save();win();
}
function undo(){if(can()&&G.undo(S)){S.bad=new Set();render();save()}}
function redo(){if(can()&&G.redo(S)){S.bad=new Set();render();save()}}
function win(){if(can()&&G.solved(S))finish('PARABÉNS! SUDOKU CONCLUÍDO.',true)}
function finish(m,ok){
  S.over=true;G.stop(S);clearInterval(S.tid);tick();toast(m,0);G.drop();render();
  if(ok)boardEl.classList.add('won');
}
function toggleNotes(){
  S.notes=!S.notes;const b=$('#notesBtn');
  b.setAttribute('aria-pressed',S.notes);b.textContent='Modo anotações: '+(S.notes?'ligado':'desligado');
  boardEl.classList.toggle('pencil',S.notes);toast('Anotações '+(S.notes?'ligadas':'desligadas'));
}

// ---------- revelação e verificação (sempre a partir da matriz da solução) ----------
function hint(){
  if(!can())return;const i=G.hintCell(S,S.sel);if(i<0)return;
  G.act(S,()=>{S.v[i]=S.g.solution[i];S.n[i]=0;S.r[i]=true});
  S.sel=i;S.bad.delete(i);render();cells[i].classList.add('flash');save();toast(`Dica: linha ${(i/9|0)+1}, coluna ${i%9+1}`,2500);win();
}
function solve(){
  if(!can())return;
  dialog('<p>Deseja realmente revelar a solução completa deste Sudoku?</p>',[['Cancelar'],['Revelar solução',()=>{
    S.v.forEach((v,i)=>{if(v!==S.g.solution[i]){S.v[i]=S.g.solution[i];S.r[i]=true}S.n[i]=0});
    S.bad=new Set();finish('Solução revelada.',false);
  },'danger']]);
}
function check(){
  if(!can())return;
  S.bad=new Set(S.v.flatMap((v,i)=>v&&v!==S.g.solution[i]?[i]:[]));render();
  toast(S.bad.size?`${S.bad.size} número(s) incorreto(s).`:'Nenhum erro encontrado.',3000);
}
function clearUser(){
  if(!can())return;
  G.act(S,()=>{S.v=S.v.map((v,i)=>S.f[i]?v:0);S.n.fill(0);S.r.fill(false)});
  S.bad=new Set();render();save();
}
function restart(){
  if(!S.g||S.busy)return;
  dialog('<h2>REINICIAR SUDOKU</h2><p>Apagar números, anotações e histórico deste desafio e zerar o cronômetro? O mesmo Sudoku será mantido.</p>',
    [['Cancelar'],['Reiniciar',()=>{
      G.reset(S);S.sel=S.g.puzzle.indexOf(0);boardEl.classList.remove('won');
      G.start(S);run();render();save();toast('Sudoku reiniciado.');
    },'danger']]);
}

// ---------- impressão: HTML/CSS próprio (#printArea) + window.print() ----------
function sheet(g,ans){
  const cs=g.map((v,i)=>`<i class="${S.f[i]?'':'f'}${i%9%3===2&&i%9<8?' br':''}${(i/9|0)%3===2&&i<72?' bb':''}">${(ans||S.f[i])&&v?v:''}</i>`).join('');
  return `<section class="sheet"><h1>SUDOKU · ${LV[S.lv]}${ans?' · GABARITO':''}</h1><div class="pgrid">${cs}</div></section>`;
}
function doPrint(ans){
  $('#printArea').innerHTML=sheet(S.g.puzzle,false)+(ans?sheet(S.g.solution,true):'');
  setTimeout(()=>window.print(),60);
}
function printDlg(){
  if(!S.g)return;
  dialog('<h2>IMPRIMIR SUDOKU</h2><p>Escolha o que imprimir (A4, vertical):</p>',
    [['Somente Sudoku',()=>doPrint(false)],['Sudoku + Gabarito',()=>doPrint(true)],['Cancelar']]);
}

// ---------- partida, geração em segundo plano, cronômetro, menu e diálogos ----------
const tick=()=>{
  const t=Math.floor(G.elapsed(S)/1000);
  $('#timer').textContent=[t/3600|0,(t/60|0)%60,t%60].map(x=>String(x).padStart(2,'0')).join(':');
};
function run(){clearInterval(S.tid);tick();S.tid=setInterval(tick,1000)}
function lab(){
  $('#levelLabel').textContent=LV[S.lv];
  document.querySelectorAll('[data-lv]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.lv===S.lv));
}
function setBusy(on){S.busy=on;$('#toast').classList.toggle('pulse',on);boardEl.classList.toggle('busy',on);toast(on?'GERANDO NOVO SUDOKU…':'',0)}
// Gera num Web Worker; sem Worker (ex.: file://) usa a thread principal. Travou: contingência.
function make(lv){
  if(W)W.terminate();
  return new Promise(res=>{
    const ok=g=>{clearTimeout(to);res(g)},sync=()=>setTimeout(()=>ok(E.generate(lv)),30),
      to=setTimeout(()=>{if(W)W.terminate();ok(E.fallback(lv))},9000);
    try{W=new Worker('sudoku-worker.js');W.onmessage=e=>ok(e.data);W.onerror=()=>{clearTimeout(to);sync()};W.postMessage(lv)}
    catch(e){clearTimeout(to);sync()}
  });
}
async function newGame(lv=S.lv||1){
  const id=++S.req;S.paused=false;S.lv=lv;
  if(S.g){G.stop(S);clearInterval(S.tid)}
  setBusy(true);lab();
  const g=await make(lv);
  if(id!==S.req)return;                       // um pedido mais novo assumiu: descarta esta geração
  Object.assign(S,G.fresh(g));S.sel=g.puzzle.indexOf(0);setBusy(false);lab();
  G.start(S);run();
  boardEl.classList.remove('won','gen');void boardEl.offsetWidth;boardEl.classList.add('gen');
  render();save();toast(g.fallback?'Desafio pré-validado carregado.':'',2500);
}
function toast(m,ms=2200){const t=$('#toast');t.textContent=m;clearTimeout(tt);if(m&&ms)tt=setTimeout(()=>t.textContent='',ms)}
function dialog(h,acts=[['Fechar']]){
  dlg.innerHTML=h+'<div class="acts"></div>';
  acts.forEach(([t,fn,k])=>{const b=document.createElement('button');b.textContent=t;if(k)b.className=k;b.onclick=()=>{dlg.close();fn&&fn()};dlg.lastChild.append(b)});
  dlg.showModal();
}
function menu(o){
  isOpen=o;dr.classList.toggle('open',o);sc.classList.toggle('on',o);dr.inert=!o;
  $('#menuBtn').setAttribute('aria-expanded',o);(o?dr.querySelector('button'):$('#menuBtn')).focus();
}
$('#menuBtn').onclick=()=>menu(true);
sc.onclick=()=>menu(false);
dr.onclick=e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  const{a,lv}=b.dataset;
  if(a==='notes')return toggleNotes();
  if(a==='undo')return undo();
  if(a==='redo')return redo();
  menu(false);
  if(lv)return newGame(+lv);
  ({new:()=>newGame(),restart,hint,solve,print:printDlg,check,clear:clearUser,
    how:()=>dialog('<h2>COMO JOGAR</h2><p>Preencha a grade para que cada linha, coluna e bloco 3×3 tenha os números de 1 a 9, sem repetir.</p><p>Toque numa célula e digite o número (ou use o teclado numérico). Setas navegam, Backspace apaga, N liga as anotações, Ctrl+Z desfaz e Ctrl+Y refaz.</p>'),
    credits:()=>dialog('<h2>CRÉDITOS</h2><p>SUDOKU: desafios gerados localmente, sem dependências externas.</p><p>Desenvolvido por <a href="https://eliseuangelos.github.io/eliseuangelos/" target="_blank" rel="noopener">Eliseu Fernandes Laurindo</a>.</p>')}[a])();
};
addEventListener('keydown',e=>{
  if(dlg.open||e.altKey)return;
  const k=e.key;
  if(e.ctrlKey||e.metaKey){                    // Ctrl+Z desfaz; Ctrl+Y (ou Ctrl+Shift+Z) refaz
    if(isOpen||!/^[zy]$/i.test(k))return;
    e.preventDefault();(/y/i.test(k)||e.shiftKey)?redo():undo();return;
  }
  if(k==='Escape'){if(isOpen)menu(false);return}
  if(isOpen)return;
  const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k],cl=x=>Math.min(8,Math.max(0,x));
  if(/^[1-9]$/.test(k))put(+k);
  else if(k==='Backspace'||k==='Delete'||k==='0')put(0);
  else if(k==='n'||k==='N')toggleNotes();
  else if(d){e.preventDefault();const s=S.sel<0?0:S.sel;select(cl((s/9|0)+d[0])*9+cl(s%9+d[1]))}
});

// ---------- salvamento automático: grava a cada jogada e ao sair; valida ao recuperar ----------
addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
dlg.addEventListener('close',()=>{if(S.paused){S.paused=false;G.start(S);run()}}); // retoma após "Continuar"
(function init(){
  const d=G.load();
  if(!d)return newGame(1);
  Object.assign(S,d);S.sel=S.v.indexOf(0);S.paused=true;lab();tick();render();
  dialog('<h2>PARTIDA SALVA</h2><p>Deseja continuar a partida anterior ou iniciar outra?</p>',[['Continuar',null,'pri'],['Novo Sudoku',()=>newGame(S.lv)]]);
})();
})();
