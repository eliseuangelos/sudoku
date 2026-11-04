/* sudoku-engine.js — motor independente da interface (sem DOM):
   gera, resolve, valida e classifica Sudokus. */
const SudokuEngine=(()=>{
'use strict';
const ROW=i=>(i/9)|0,COL=i=>i%9,BOX=i=>((i/27)|0)*3+((COL(i)/3)|0);
const pop=m=>{let c=0;for(;m;m&=m-1)c++;return c};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const ALL=[...Array(81).keys()];
// 27 unidades: para cada k, linha k, coluna k e bloco k (índices 3k, 3k+1, 3k+2)
const UNITS=[];for(let k=0;k<9;k++)UNITS.push(ALL.filter(i=>ROW(i)===k),ALL.filter(i=>COL(i)===k),ALL.filter(i=>BOX(i)===k));
const PEERS=ALL.map(i=>ALL.filter(j=>j!==i&&(ROW(j)===ROW(i)||COL(j)===COL(i)||BOX(j)===BOX(i))));
// pares (bloco, linha/coluna) que se cruzam: base dos Locked Candidates
const X=[];for(let a=0;a<27;a++)for(let b=0;b<27;b++)if((a%3===2)!==(b%3===2)&&UNITS[a].some(i=>UNITS[b].includes(i)))X.push([UNITS[a],UNITS[b]]);
const CFG={1:[38,45],2:[32,37],3:[26,31]}; // faixa de pistas por nível (referência)
const P0='530070000600195000098000060800060003400803001700020006060000280000419005000080079';
const S0='534678912672195348198342567859761423426853791713924856961537284287419635345286179';

// bitmask de candidatos (bits 1..9) de uma célula
const cands=(g,i)=>{let m=0x3FE;for(const j of PEERS[i])if(g[j])m&=~(1<<g[j]);return m};
// sem repetições em nenhuma linha, coluna ou bloco
const valid=g=>UNITS.every(u=>{let m=0;for(const i of u)if(g[i]){const b=1<<g[i];if(m&b)return false;m|=b}return true});

// Backtracking com MRV (célula com menos candidatos). Para ao atingir `lim` soluções
// (lim=2 basta para provar unicidade). `random` embaralha a ordem para gerar grades variadas.
function search(g,lim,random){
  const R=Array(9).fill(0),C=Array(9).fill(0),B=Array(9).fill(0);let n=0,first=null;
  ALL.forEach(i=>{if(g[i]){const b=1<<g[i];R[ROW(i)]|=b;C[COL(i)]|=b;B[BOX(i)]|=b}});
  const rec=()=>{
    let best=-1,bm=0,bc=10;
    for(let i=0;i<81;i++)if(!g[i]){
      const m=~(R[ROW(i)]|C[COL(i)]|B[BOX(i)])&0x3FE,c=pop(m);
      if(c<bc){bc=c;best=i;bm=m;if(c<2)break}
    }
    if(best<0){if(!first)first=g.slice();return ++n>=lim}
    if(!bc)return false;
    const ds=[];for(let d=1;d<10;d++)if(bm&(1<<d))ds.push(d);
    if(random)shuffle(ds);
    const r=ROW(best),c=COL(best),b=BOX(best);
    for(const d of ds){
      const bit=1<<d;g[best]=d;R[r]|=bit;C[c]|=bit;B[b]|=bit;
      const stop=rec();
      g[best]=0;R[r]&=~bit;C[c]&=~bit;B[b]&=~bit;
      if(stop)return true;
    }
    return false;
  };
  rec();return{n,first};
}
const count=g=>search(g.slice(),2).n;

// Avaliador lógico: resolve só com técnicas humanas e devolve a mais difícil usada
// (1=Naked/Hidden Singles, 2=+Locked Candidates, 3=+Naked/Hidden Pairs) ou 0 se travar.
function rate(p){
  const g=p.slice(),C=g.map((v,i)=>v?0:cands(g,i));let top=1;
  const put=(i,d)=>{g[i]=d;C[i]=0;for(const j of PEERS[i])C[j]&=~(1<<d)};
  while(g.includes(0)){
    let ch=false;
    for(let i=0;i<81;i++)if(!g[i]&&pop(C[i])===1){put(i,Math.log2(C[i]));ch=true}   // Naked Single
    for(const u of UNITS)for(let d=1;d<10;d++){                                       // Hidden Single
      const b=1<<d;let n=0,at=0;
      for(const i of u){if(g[i]===d){n=9;break}if(!g[i]&&C[i]&b){n++;at=i}}
      if(n===1){put(at,d);ch=true}
    }
    if(ch)continue;
    for(const[A,B]of X)for(let d=1;d<10;d++){                                         // Locked Candidates
      const b=1<<d,ca=A.filter(i=>C[i]&b);
      if(ca.length>1&&ca.every(i=>B.includes(i)))for(const i of B)if(!A.includes(i)&&C[i]&b){C[i]&=~b;ch=true}
    }
    if(ch){top=Math.max(top,2);continue}
    for(const u of UNITS){
      const cs=u.filter(i=>!g[i]);
      for(const i of cs)if(pop(C[i])===2)for(const j of cs)if(j>i&&C[j]===C[i])       // Naked Pair
        for(const k of cs)if(k!==i&&k!==j&&C[k]&C[i]){C[k]&=~C[i];ch=true}
      for(let d=1;d<9;d++)for(let e=d+1;e<10;e++){                                    // Hidden Pair
        const bd=1<<d,be=1<<e,pd=cs.filter(i=>C[i]&bd),pe=cs.filter(i=>C[i]&be);
        if(pd.length===2&&pe.length===2&&pd[0]===pe[0]&&pd[1]===pe[1])
          for(const i of pd)if(C[i]&~(bd|be)){C[i]&=bd|be;ch=true}
      }
    }
    if(ch){top=3;continue}
    return 0;
  }
  return top;
}

// Contingência: puzzle clássico previamente validado, com dígitos permutados.
function fallback(level){
  const perm=shuffle([1,2,3,4,5,6,7,8,9]),M=s=>[...s].map(x=>+x&&perm[x-1]);
  return{puzzle:M(P0),solution:M(S0),level,clues:30,rating:0,exact:false};
}

// 1) grade completa aleatória; 2) remove números mantendo solução única;
// 3) classifica pela lógica; descarta se não bater com o nível. Limite de tempo + contingência.
function generate(level,ms=2500){
  const[lo,hi]=CFG[level],t0=Date.now();let best=null,bd=9;
  while(Date.now()-t0<ms){
    const sol=search(Array(81).fill(0),1,true).first,p=sol.slice(),goal=rnd(lo,hi);let clues=81;
    for(const i of shuffle(ALL.slice())){
      if(clues<=goal)break;
      const v=p[i];p[i]=0;
      if(search(p,2).n===1)clues--;else p[i]=v;
    }
    if(clues>hi)continue;
    const r=rate(p)||4,d=Math.abs(r-level);
    if(d<bd){bd=d;best={puzzle:p.slice(),solution:sol,level,clues,rating:r,exact:d===0}}
    if(!d)break;
  }
  return best||fallback(level);
}
return{generate,fallback,rate,count,valid,cands,pop,PEERS,UNITS};
})();
