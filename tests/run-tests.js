/* Testes automatizados do motor e da lógica da partida. Executar na raiz: node tests/run-tests.js */
const fs=require('fs'),assert=require('assert'),rd=f=>fs.readFileSync(f,'utf8');
const{E,G}=new Function(rd('sudoku-engine.js')+';\n'+rd('sudoku-game.js')+';return{E:SudokuEngine,G:SudokuGame}')();
let ok=0,bad=0;
const t=(n,f)=>{try{f();ok++;console.log('✔',n)}catch(e){bad++;console.log('✘',n,'→',e.message)}};
// verificação independente (não usa o motor): linhas, colunas e blocos com 1..9 sem repetir
const grid=g=>{if(g.includes(0))return false;for(let k=0;k<9;k++){const r=new Set(),c=new Set(),b=new Set();for(let j=0;j<9;j++){r.add(g[k*9+j]);c.add(g[j*9+k]);b.add(g[((k/3|0)*3+(j/3|0))*9+(k%3)*3+j%3])}if(r.size+c.size+b.size!==27)return false}return true};
// nível confirmado: resolvível com as técnicas do nível e NÃO resolvível só com as do nível anterior
const cls=(p,l,s)=>{const r=E.rate(p);return r.solved&&r.level===l&&(!s||r.grid.every((x,i)=>x===s[i]))&&(l===1||!E.rate(p,l-1).solved)};
const N=6,game=l=>Object.assign({},G.fresh(E.generate(l)));
for(const l of[1,2,3])t(`nível ${l}: ${N} desafios (válidos, solução única, pistas e classificação confirmada)`,()=>{
  let fb=0;
  for(let k=0;k<N;k++){
    const g=E.generate(l),[lo,hi]=E.CFG[l],cl=g.puzzle.filter(Boolean).length;
    if(g.fallback)fb++;
    assert(grid(g.solution),'solução inválida');
    assert(g.puzzle.every((v,i)=>!v||v===g.solution[i]),'pista alterada');
    assert.strictEqual(E.count(g.puzzle),1,'solução não única');
    assert(cl>=lo&&cl<=hi,'pistas fora da faixa: '+cl);
    assert(cls(g.puzzle,l,g.solution),'classificação não confirmada');
  }
  assert.strictEqual(fb,0,'usou contingência '+fb+'x');
});
t('contingências: 3 desafios distintos e validados (+ variantes permutadas)',()=>{
  const seen=new Set();
  for(const l of[1,2,3]){
    const[P,S]=E.FB[l],p=[...P].map(Number),s=[...S].map(Number),[lo,hi]=E.CFG[l],cl=p.filter(Boolean).length;
    assert(grid(s)&&p.every((v,i)=>!v||v===s[i]),'solução incoerente');
    assert.strictEqual(E.count(p),1,'solução não única');assert(cl>=lo&&cl<=hi,'pistas fora da faixa');
    assert(cls(p,l,s),'nível '+l+' não confirmado');seen.add(P);
    const f=E.fallback(l);assert(grid(f.solution)&&E.count(f.puzzle)===1&&cls(f.puzzle,l,f.solution),'variante inválida');
  }
  assert.strictEqual(seen.size,3);
});
t('rate inconclusivo é aproximado (solved:false) e nunca aceito como difícil',()=>{
  const g=E.generate(3),r=E.rate(g.puzzle,1);
  assert(!r.solved&&r.approx,'esperava inconclusivo só com singles');
  assert(E.rate(g.puzzle).solved&&E.rate(g.puzzle).level===3);
});
t('dica: uma célula, com a solução; selecionada vazia tem prioridade',()=>{
  const S=game(2),i=G.hintCell(S,-1);
  assert(i>=0&&!S.f[i]&&!S.v[i]);
  G.act(S,()=>{S.v[i]=S.g.solution[i];S.r[i]=true});
  assert.strictEqual(S.v.filter(Boolean).length,S.g.puzzle.filter(Boolean).length+1);
  const j=S.f.findIndex((f,k)=>!f&&!S.v[k]);assert.strictEqual(G.hintCell(S,j),j);
  assert(G.hintCell(S,S.f.indexOf(true))>=0);
});
t('desfazer/refazer com anotações e anotações vizinhas; pistas intactas',()=>{
  const S=game(1),e=S.f.map((f,k)=>f?-1:k).filter(k=>k>=0),a=e[0],b=e[1];
  G.act(S,()=>{S.n[a]=6;S.n[b]=2});
  G.act(S,()=>{S.v[a]=S.g.solution[a];S.n[a]=0;S.n[b]=0});
  assert.strictEqual(S.hp,2);
  assert(G.undo(S));assert.strictEqual(S.v[a],0);assert.strictEqual(S.n[a],6);assert.strictEqual(S.n[b],2);
  assert(G.undo(S));assert.strictEqual(S.n[a],0);assert(!G.undo(S));
  assert(G.redo(S)&&G.redo(S));assert.strictEqual(S.v[a],S.g.solution[a]);assert.strictEqual(S.n[b],0);assert(!G.redo(S));
  G.undo(S);G.act(S,()=>{S.v[b]=S.g.solution[b]});assert(!G.redo(S),'nova jogada deve limpar o refazer');
  assert(S.f.every((f,i)=>!f||S.v[i]===S.g.puzzle[i]));
});
t('salvamento e recuperação; dados adulterados são rejeitados',()=>{
  const st={d:{},setItem(k,v){this.d[k]=v},getItem(k){return k in this.d?this.d[k]:null},removeItem(k){delete this.d[k]}};
  const S=game(2),i=S.f.indexOf(false);
  G.act(S,()=>{S.v[i]=S.g.solution[i]});const j=S.f.indexOf(false,i+1);G.act(S,()=>{S.n[j]=5});G.undo(S);S.el=4321;
  G.save(S,st);const L=G.load(st);
  assert(L,'não restaurou');
  for(const k of['v','n','r','h'])assert.deepStrictEqual(L[k],S[k],k);
  assert.deepStrictEqual(L.g.solution,S.g.solution);assert.strictEqual(L.lv,2);assert.strictEqual(L.hp,S.hp);assert.strictEqual(L.el,4321);
  const o=JSON.parse(st.d['sudoku.save.v1']),gi=S.f.indexOf(true);
  const tamper=[x=>x.s=x.s.replace(/./,c=>c==='9'?'1':'9'),x=>x.v=x.v.slice(1),x=>x.lv=7,x=>x.n[0]=5000,x=>x.h=[[[0,0,0,0,1,0]]],x=>x.hp=99,
    x=>x.p=x.p.replace(/[1-9]/,c=>c==='1'?'2':'1'),x=>{x.h=[[[gi,0,0,0,1,0,0]]];x.hp=1}];
  tamper.forEach((m,k)=>{const c=JSON.parse(JSON.stringify(o));m(c);st.setItem('sudoku.save.v1',JSON.stringify(c));assert.strictEqual(G.load(st),null,'adulteração '+k+' aceita')});
  st.setItem('sudoku.save.v1','{lixo');assert.strictEqual(G.load(st),null);
});
t('contador de números restantes',()=>{
  const S=game(1);let c=G.counts(S);
  for(let d=1;d<=9;d++)assert.strictEqual(c[d],9-S.v.filter(x=>x===d).length);
  assert(c.slice(1).reduce((a,b)=>a+b)===S.v.filter(x=>!x).length);
  S.v=S.g.solution.slice();assert(G.counts(S).slice(1).every(x=>x===0),'completo deveria zerar');
  S.v[S.f.indexOf(false)]=0;assert.strictEqual(G.counts(S).slice(1).reduce((a,b)=>a+b),1);
});
t('progresso e reinício (mesmo desafio, histórico/erros/anotações/cronômetro zerados)',()=>{
  const S=game(1),tot=S.f.filter(x=>!x).length;
  assert.deepStrictEqual(G.progress(S),[0,tot]);
  const i=S.f.indexOf(false);G.act(S,()=>{S.v[i]=S.g.solution[i]});S.el=999;S.bad.add(i);S.n[i+1]=3;
  assert.deepStrictEqual(G.progress(S),[1,tot]);
  const sol=S.g.solution,lv=S.lv;G.reset(S);
  assert.deepStrictEqual(S.v,S.g.puzzle);assert(S.n.every(x=>!x)&&!S.r.some(Boolean));
  assert.strictEqual(S.h.length+S.hp+S.el+S.bad.size,0);assert.strictEqual(S.g.solution,sol);assert.strictEqual(S.lv,lv);
});
t('cronômetro para na conclusão e não reinicia',()=>{
  const g=E.generate(1),real=Date.now;let T=1000;Date.now=()=>T;
  try{const S=Object.assign({},G.fresh(g));G.start(S);T=6000;assert.strictEqual(G.elapsed(S),5000);
    S.v=S.g.solution.slice();assert(G.solved(S));S.over=true;G.stop(S);T=60000;assert.strictEqual(G.elapsed(S),5000);
    G.start(S);T=90000;assert.strictEqual(G.elapsed(S),5000)}finally{Date.now=real}
});
t('worker responde com desafio válido',()=>{
  let out;global.postMessage=x=>out=x;new Function('importScripts','SudokuEngine',rd('sudoku-worker.js'))(()=>{},E);
  global.onmessage({data:1});assert(out&&out.puzzle.length===81&&E.count(out.puzzle)===1);
});
console.log(`\n${ok} aprovados, ${bad} falharam`);process.exit(bad?1:0);
