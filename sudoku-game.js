/* sudoku-game.js — estado da partida (sem DOM): jogadas, histórico, contadores,
   progresso, cronômetro, dica e salvamento validado. */
const SudokuGame=(()=>{
'use strict';
const E=SudokuEngine,MAXH=200,KEY='sudoku.save.v1';
const fresh=g=>({g,lv:g.level,v:g.puzzle.slice(),n:Array(81).fill(0),r:Array(81).fill(false),f:g.puzzle.map(Boolean),h:[],hp:0,el:0,t0:0,over:false,bad:new Set()});
const reset=S=>Object.assign(S,fresh(S.g));   // mesmo desafio, mesma solução, mesmo nível

// Jogada: executa fn e grava no histórico apenas o que mudou:
// [célula, valor, anotações, revelada] antes e depois (inclui anotações de vizinhas limpas).
function act(S,fn){
  const a=[S.v.slice(),S.n.slice(),S.r.slice()];fn();const ch=[];
  for(let i=0;i<81;i++)if(a[0][i]!==S.v[i]||a[1][i]!==S.n[i]||a[2][i]!==S.r[i])ch.push([i,a[0][i],a[1][i],+a[2][i],S.v[i],S.n[i],+S.r[i]]);
  if(!ch.length)return false;
  S.h.length=S.hp;S.h.push(ch);if(S.h.length>MAXH)S.h.shift();S.hp=S.h.length;return true;
}
const apply=(S,m,k)=>{for(const x of m){S.v[x[0]]=x[1+3*k];S.n[x[0]]=x[2+3*k];S.r[x[0]]=!!x[3+3*k]}};
const undo=S=>{if(S.over||!S.hp)return false;apply(S,S.h[--S.hp],0);return true};
const redo=S=>{if(S.over||S.hp>=S.h.length)return false;apply(S,S.h[S.hp++],1);return true};

// quantas vezes cada dígito (1..9) ainda precisa aparecer (não é a contagem de células vazias)
const counts=S=>{const c=Array(10).fill(9);S.v.forEach(v=>{if(v)c[v]--});return c.map(x=>Math.max(0,x))};
const progress=S=>[S.v.filter((v,i)=>v&&!S.f[i]).length,S.f.filter(x=>!x).length];
const solved=S=>S.v.every((v,i)=>v===S.g.solution[i]);

// cronômetro: `el` acumula o tempo parado; `t0` marca o início do trecho em andamento
const elapsed=S=>S.el+(S.t0?Date.now()-S.t0:0);
const start=S=>{if(!S.t0&&!S.over)S.t0=Date.now()};
const stop=S=>{S.el=elapsed(S);S.t0=0};

// célula da dica: a selecionada (se vazia/errada); senão a vazia mais restrita (menos candidatos)
function hintCell(S,sel){
  if(sel>=0&&!S.f[sel]&&S.v[sel]!==S.g.solution[sel])return sel;
  let m=10,i=-1;
  for(let k=0;k<81;k++)if(!S.v[k]){const c=E.pop(E.cands(S.v,k));if(c<m){m=c;i=k}}
  return i>=0?i:S.v.findIndex((v,k)=>v!==S.g.solution[k]);
}

// ---------- salvamento: grava o mínimo e valida tudo ao recuperar ----------
const pack=S=>({ver:1,lv:S.lv,p:S.g.puzzle.join(''),s:S.g.solution.join(''),v:S.v.join(''),n:S.n,r:S.r.map(Number).join(''),el:elapsed(S),h:S.h,hp:S.hp});
function unpack(o){
  try{
    const d=s=>typeof s==='string'&&/^[0-9]{81}$/.test(s)?[...s].map(Number):null;
    const p=d(o.p),s=d(o.s),v=d(o.v),r=d(o.r);
    if(o.ver!==1||!p||!s||!v||!r||![1,2,3].includes(o.lv))return null;
    if(!E.valid(s)||s.includes(0)||p.some((x,i)=>x&&x!==s[i])||v.some((x,i)=>p[i]&&x!==p[i])||E.count(p)!==1)return null;
    if(!Array.isArray(o.n)||o.n.length!==81||o.n.some(x=>!Number.isInteger(x)||x<0||x>1022)||r.some(x=>x>1))return null;
    if(!(o.el>=0&&o.el<1e9)||!Array.isArray(o.h)||o.h.length>MAXH||!Number.isInteger(o.hp)||o.hp<0||o.hp>o.h.length)return null;
    const mv=x=>Array.isArray(x)&&x.length===7&&x.every(Number.isInteger)&&x[0]>=0&&x[0]<81&&!p[x[0]]&&[1,4].every(k=>x[k]>=0&&x[k]<=9)&&[2,5].every(k=>x[k]>=0&&x[k]<=1022)&&[3,6].every(k=>x[k]===0||x[k]===1);
    if(!o.h.every(m=>Array.isArray(m)&&m.every(mv)))return null;
    return{g:{puzzle:p,solution:s,level:o.lv,exact:true},lv:o.lv,v,n:o.n.slice(),r:r.map(Boolean),f:p.map(Boolean),h:o.h,hp:o.hp,el:o.el,t0:0,over:false,bad:new Set()};
  }catch(e){return null}
}
const save=(S,st=localStorage)=>{try{st.setItem(KEY,JSON.stringify(pack(S)))}catch(e){}};
const load=(st=localStorage)=>{try{const o=JSON.parse(st.getItem(KEY));return o?unpack(o):null}catch(e){return null}};
const drop=(st=localStorage)=>{try{st.removeItem(KEY)}catch(e){}};
return{fresh,reset,act,undo,redo,counts,progress,solved,elapsed,start,stop,hintCell,pack,unpack,save,load,drop};
})();
