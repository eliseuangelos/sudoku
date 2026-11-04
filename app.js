/* app.js — interface: seleção, preenchimento, menu, cronômetro, dicas, revelação e impressão */
(()=>{
'use strict';
const E=SudokuEngine,$=s=>document.querySelector(s),LV=['','FÁCIL','MÉDIO','DIFÍCIL'];
const S={lv:1,g:null,v:[],n:[],f:[],r:[],sel:-1,notes:false,over:false,bad:new Set(),t0:0,tid:0};
const boardEl=$('#board'),dlg=$('#dlg'),dr=$('#drawer'),sc=$('#scrim'),cells=[];
let isOpen=false,tt;

// ---------- tabuleiro e teclado numérico ----------
for(let i=0;i<81;i++){
  const c=document.createElement('div');
  c._b='c'+(i%9%3===2&&i%9<8?' br':'')+((i/9|0)%3===2&&i<72?' bb':'');
  c.setAttribute('role','button');c.onclick=()=>select(i);
  boardEl.append(c);cells.push(c);
}
const pad=$('#pad');
pad.innerHTML=[1,2,3,4,5,6,7,8,9].map(d=>`<button data-d="${d}" aria-label="Número ${d}">${d}</button>`).join('')+'<button data-d="0" aria-label="Apagar">⌫</button>';
pad.onclick=e=>{const b=e.target.closest('button');if(b)put(+b.dataset.d)};

// células com número repetido na linha, coluna ou bloco
function conflicts(){
  const s=new Set();
  for(let i=0;i<81;i++)if(S.v[i])for(const j of E.PEERS[i])if(S.v[j]===S.v[i]){s.add(i);break}
  return s;
}
function render(){
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
function select(i){S.sel=i;render();cells[i].focus({preventScroll:true})}

// ---------- preenchimento ----------
function put(d){
  const i=S.sel;if(S.over||i<0||S.f[i])return;
  if(!d){S.v[i]=0;S.n[i]=0;S.r[i]=false}
  else if(S.notes){if(S.v[i])return;S.n[i]^=1<<d}
  else{
    S.v[i]=S.v[i]===d?0:d;S.n[i]=0;S.r[i]=false;
    if(S.v[i])for(const j of E.PEERS[i])S.n[j]&=~(1<<d); // limpa anotações vizinhas
  }
  S.bad.delete(i);render();win();
}
function win(){if(!S.over&&S.v.every((v,i)=>v===S.g.solution[i]))finish('PARABÉNS! SUDOKU CONCLUÍDO.',true)}
function finish(m,ok){S.over=true;clearInterval(S.tid);toast(m,0);if(ok)boardEl.classList.add('won')}
function toggleNotes(){
  S.notes=!S.notes;const b=$('#notesBtn');
  b.setAttribute('aria-pressed',S.notes);b.textContent='Modo anotações: '+(S.notes?'ligado':'desligado');
  boardEl.classList.toggle('pencil',S.notes);toast('Anotações '+(S.notes?'ligadas':'desligadas'));
}

// ---------- revelação e verificação (sempre a partir da matriz da solução) ----------
function hint(){
  if(S.over)return;let i=S.sel;
  if(i<0||S.f[i]||S.v[i]===S.g.solution[i]){      // sem seleção útil: célula vazia mais restrita
    let m=10;i=-1;
    for(let k=0;k<81;k++)if(!S.v[k]){const c=E.pop(E.cands(S.v,k));if(c<m){m=c;i=k}}
    if(i<0)i=S.v.findIndex((v,k)=>v!==S.g.solution[k]);
  }
  if(i<0)return;
  S.v[i]=S.g.solution[i];S.n[i]=0;S.r[i]=true;S.sel=i;S.bad.delete(i);
  render();cells[i].classList.add('flash');win();
}
function solve(){
  if(S.over)return;
  dialog('<p>Deseja realmente revelar a solução completa deste Sudoku?</p>',[['Cancelar'],['Revelar solução',()=>{
    S.v.forEach((v,i)=>{if(v!==S.g.solution[i]){S.v[i]=S.g.solution[i];S.r[i]=true}S.n[i]=0});
    S.bad=new Set();render();finish('Solução revelada.',false);
  }]]);
}
function check(){
  S.bad=new Set(S.v.flatMap((v,i)=>v&&v!==S.g.solution[i]?[i]:[]));render();
  toast(S.bad.size?`${S.bad.size} número(s) incorreto(s).`:'Nenhum erro encontrado.',3000);
}
function clearUser(){
  if(S.over)return;
  S.v=S.v.map((v,i)=>S.f[i]?v:0);S.n.fill(0);S.r.fill(false);S.bad=new Set();render();
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
  dialog('<h2>IMPRIMIR SUDOKU</h2><p>Escolha o que imprimir (A4, vertical):</p>',
    [['Somente Sudoku',()=>doPrint(false)],['Sudoku + Gabarito',()=>doPrint(true)],['Cancelar']]);
}

// ---------- partida, cronômetro, menu e diálogos ----------
function tick(){
  const t=Math.floor((Date.now()-S.t0)/1000);
  $('#timer').textContent=[t/3600|0,(t/60|0)%60,t%60].map(x=>String(x).padStart(2,'0')).join(':');
}
function newGame(lv=S.lv){
  S.lv=lv;clearInterval(S.tid);toast('Gerando desafio…',0);boardEl.classList.remove('won');
  setTimeout(()=>{
    const g=E.generate(lv);
    Object.assign(S,{g,v:g.puzzle.slice(),f:g.puzzle.map(Boolean),n:Array(81).fill(0),r:Array(81).fill(false),sel:g.puzzle.indexOf(0),bad:new Set(),over:false,t0:Date.now()});
    S.tid=setInterval(tick,1000);tick();$('#levelLabel').textContent=LV[lv];
    document.querySelectorAll('[data-lv]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.lv===lv));
    boardEl.classList.remove('gen');void boardEl.offsetWidth;boardEl.classList.add('gen');
    render();toast(g.exact?'':'Nível aproximado (limite de tempo atingido).',2500);
  },40);
}
function toast(m,ms=2200){const t=$('#toast');t.textContent=m;clearTimeout(tt);if(m&&ms)tt=setTimeout(()=>t.textContent='',ms)}
function dialog(h,acts=[['Fechar']]){
  dlg.innerHTML=h+'<div class="acts"></div>';
  acts.forEach(([t,fn])=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{dlg.close();fn&&fn()};dlg.lastChild.append(b)});
  dlg.showModal();
}
function menu(o){
  isOpen=o;dr.classList.toggle('open',o);sc.classList.toggle('on',o);dr.inert=!o;
  $('#menuBtn').setAttribute('aria-expanded',o);(o?dr.querySelector('button'):$('#menuBtn')).focus();
}
$('#menuBtn').onclick=()=>menu(true);
sc.onclick=()=>menu(false);
dr.onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  const{a,lv}=b.dataset;
  if(a==='notes')return toggleNotes();
  menu(false);
  if(lv)return newGame(+lv);
  ({new:()=>newGame(),hint,solve,print:printDlg,check,clear:clearUser,
    how:()=>dialog('<h2>COMO JOGAR</h2><p>Preencha a grade para que cada linha, coluna e bloco 3×3 tenha os números de 1 a 9, sem repetir.</p><p>Toque numa célula e digite o número (ou use o teclado numérico). Setas navegam, Backspace apaga e N liga as anotações.</p>'),
    credits:()=>dialog('<h2>CRÉDITOS</h2><p>SUDOKU: desafios gerados localmente, sem dependências externas.</p><p>Desenvolvido por <a href="https://eliseuangelos.github.io/eliseuangelos/" target="_blank" rel="noopener">Eliseu Fernandes Laurindo</a>.</p>')}[a])();
};
addEventListener('keydown',e=>{
  if(dlg.open||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key;
  if(k==='Escape'){if(isOpen)menu(false);return}
  if(isOpen)return;
  const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k],cl=x=>Math.min(8,Math.max(0,x));
  if(/^[1-9]$/.test(k))put(+k);
  else if(k==='Backspace'||k==='Delete'||k==='0')put(0);
  else if(k==='n'||k==='N')toggleNotes();
  else if(d){e.preventDefault();const s=S.sel<0?0:S.sel;select(cl((s/9|0)+d[0])*9+cl(s%9+d[1]))}
});
newGame(1);
})();
