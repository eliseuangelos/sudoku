"""Testes no navegador (Chromium via Playwright): interface, salvamento, impressão e responsividade.
Executar na raiz do projeto: python3 tests/browser-tests.py"""
import os, re, subprocess, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
URL = 'http://localhost:8765/index.html'
res = []
def t(name, cond, info=''):
    res.append(bool(cond)); print('✔' if cond else '✘', name, info)
def load(b, w=430, h=900, **kw):
    ctx = b.new_context(viewport={'width': w, 'height': h}, **kw); p = ctx.new_page()
    st = {'errs': [], 'workers': 0}
    p.on('console', lambda m: st['errs'].append(m.text) if m.type == 'error' else None)
    p.on('pageerror', lambda e: st['errs'].append(str(e)))
    p.on('worker', lambda _: st.__setitem__('workers', st['workers'] + 1))
    p.goto(URL); ready(p); return p, st
def ready(p): p.wait_for_function("document.querySelectorAll('.c.giv').length>20&&!document.querySelector('.board.busy')&&!document.querySelector('dialog[open]')", timeout=20000)
def info(p): return p.evaluate("""()=>({prog:progTxt.textContent,timer:timer.textContent,toast:toast.textContent,
 giv:[...document.querySelectorAll('.c')].map(c=>c.classList.contains('giv')?+c.textContent:0),
 val:[...document.querySelectorAll('.c')].map(c=>c.classList.contains('nts')?0:+c.textContent),
 cnt:[...document.querySelectorAll('.pad small')].map(s=>s.textContent),won:board.classList.contains('won')})""")
def menu(p, sel): p.click('#menuBtn'); p.click('#drawer ' + sel)
def put(p, i, d): p.click(f'.c >> nth={i}'); p.keyboard.press(str(d))
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
  with sync_playwright() as pw:
    b = pw.chromium.launch()
    p, st = load(b); i0 = info(p); sol = p.evaluate("g=>SudokuEngine.rate(g).grid", i0['giv'])
    emp = [i for i, g in enumerate(i0['giv']) if not g]; N = len(emp)
    t('carrega sem erros no console e gera em Web Worker', not st['errs'] and st['workers'] >= 1, f"erros={st['errs']} workers={st['workers']}")
    t('progresso inicial e contadores', i0['prog'] == f'PROGRESSO: 0 / {N}' and len(i0['cnt']) == 9, i0['prog'])
    put(p, emp[0], sol[emp[0]]); i1 = info(p); d = sol[emp[0]]
    t('jogada atualiza progresso e contador do dígito', i1['prog'] == f'PROGRESSO: 1 / {N}' and i1['cnt'][d-1] != i0['cnt'][d-1])
    p.keyboard.press('Control+z'); t('Ctrl+Z desfaz', info(p)['prog'] == f'PROGRESSO: 0 / {N}')
    p.keyboard.press('Control+y'); t('Ctrl+Y refaz', info(p)['prog'] == f'PROGRESSO: 1 / {N}')
    p.keyboard.press('n'); p.click(f'.c >> nth={emp[1]}'); p.keyboard.press('5')
    t('anotação registrada', p.evaluate(f"document.querySelectorAll('.c')[{emp[1]}].classList.contains('nts')&&document.querySelectorAll('.c')[{emp[1]}].textContent==='5'"))
    p.keyboard.press('Control+z'); t('Ctrl+Z desfaz anotação', p.evaluate(f"document.querySelectorAll('.c')[{emp[1]}].textContent===''")); p.keyboard.press('n')
    p.reload(); p.wait_for_selector('dialog[open]')
    t('recarregar pergunta se continua a partida', 'PARTIDA SALVA' in p.inner_text('dialog'))
    p.click('dialog button:text-is("Continuar")'); i2 = info(p)
    t('continuar restaura tabuleiro e progresso', i2['prog'] == f'PROGRESSO: 1 / {N}' and i2['giv'] == i0['giv'])
    time.sleep(2.2); t('cronômetro volta a andar após continuar', info(p)['timer'] != i2['timer'])
    menu(p, '[data-a=restart]'); p.click('dialog button:text-is("Reiniciar")'); i3 = info(p)
    t('reiniciar: mesmo desafio, progresso e cronômetro zerados', i3['giv'] == i0['giv'] and i3['prog'] == f'PROGRESSO: 0 / {N}' and i3['timer'] <= '00:00:01', i3['timer'])
    for i in emp: put(p, i, sol[i])
    i4 = info(p); time.sleep(2.3); i5 = info(p)
    t('conclusão: mensagem, animação e contadores completos', 'PARABÉNS' in i4['toast'] and i4['won'] and all(c == '✓' for c in i4['cnt']))
    t('cronômetro para após a conclusão', i4['timer'] == i5['timer'], i5['timer'])
    t('partida concluída remove o salvamento', p.evaluate("localStorage.getItem('sudoku.save.v1')") is None)
    p.evaluate("window.__s=0;new MutationObserver(()=>{if(/GERANDO NOVO SUDOKU/.test(toast.textContent))__s=1}).observe(toast,{childList:true,characterData:true,subtree:true});window.__g=0;let l=performance.now();(function f(n){__g=Math.max(__g,n-l);l=n;requestAnimationFrame(f)})(l)")
    p.evaluate("document.querySelector('[data-lv=\"3\"]').click();document.querySelector('[data-lv=\"1\"]').click()"); ready(p); g = info(p)['giv']
    t('geração antiga não substitui pedido mais novo (fácil)', 38 <= sum(1 for x in g if x) <= 45 and p.inner_text('#levelLabel') == 'FÁCIL', str(sum(1 for x in g if x)) + ' pistas')
    p.evaluate("document.querySelector('[data-lv=\"3\"]').click()"); ready(p)
    t('indicador GERANDO NOVO SUDOKU e interface sem congelar', p.evaluate('__s') == 1 and p.evaluate('__g') < 300, f"maior intervalo de quadro={p.evaluate('Math.round(__g)')}ms")
    gi = info(p); sol = p.evaluate("g=>SudokuEngine.rate(g).grid", gi['giv'])
    for mode, pages in (('Sudoku + Gabarito', 2), ('Somente Sudoku', 1)):
        p.evaluate("window.print=()=>{window.__p=(window.__p||0)+1}"); menu(p, '[data-a=print]'); p.click(f'dialog button:text-is("{mode}")')
        p.wait_for_function('window.__p>=1'); p.evaluate('window.__p=0'); p.emulate_media(media='print')
        pdf = p.pdf(prefer_css_page_size=True); n = int(re.search(rb'/Count\s+(\d+)', pdf).group(1)); mb = re.search(rb'/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)', pdf)
        sh = p.evaluate("[...document.querySelectorAll('.sheet')].map(s=>[...s.querySelectorAll('i')].map(i=>+i.textContent||0))")
        hid = p.evaluate("['#board','#drawer','.top','.pad','#menuBtn','.prog'].every(s=>document.querySelector(s).getClientRects().length===0)")  # nada da interface é renderizado
        c1 = sh[0] == gi['giv']; c2 = pages == 1 or sh[1] == list(sol)
        a4 = bool(mb) and abs(float(mb.group(1)) - 595) < 2 and abs(float(mb.group(2)) - 842) < 2
        t(f'impressão "{mode}": {pages} página(s) A4, gabarito correto, interface oculta', n == pages and len(sh) == pages and c1 and c2 and hid and a4, f'páginas={n} desafio={c1} gabarito={c2} oculto={hid} A4={mb.groups() if mb else None}')
        p.emulate_media(media='screen')
    p.close()
    for w, h in [(320, 640), (375, 812), (430, 932), (768, 1024), (1024, 768), (1440, 900)]:
        q, s2 = load(b, w, h); r = q.evaluate("""()=>{const cs=[...document.querySelectorAll('.c')],R=cs.map(c=>c.getBoundingClientRect()),bb=board.getBoundingClientRect(),W=R.map(r=>r.width),H=R.map(r=>r.height);
         return{sw:document.documentElement.scrollWidth,iw:innerWidth,sq:Math.abs(bb.width-bb.height),dw:Math.max(...W)-Math.min(...W),dh:Math.max(...H)-Math.min(...H),
         clip:cs.filter(c=>c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1).length,off:R.filter(r=>r.left<-0.5||r.right>innerWidth+0.5).length,cell:Math.round(W[0])}}""")
        t(f'responsivo {w}px: sem rolagem horizontal, células iguais e quadradas, números sem corte', r['sw'] <= r['iw'] and r['sq'] < 1 and r['dw'] < 1 and r['dh'] < 1 and r['clip'] == 0 and r['off'] == 0 and not s2['errs'], f"célula={r['cell']}px")
        q.close()
    q, _ = load(b, 430, 900, reduced_motion='reduce'); i = info(q); e = [k for k, g in enumerate(i['giv']) if not g][0]
    q.click(f'.c >> nth={e}'); q.keyboard.press('1')
    t('prefers-reduced-motion desativa animações', q.evaluate(f"getComputedStyle(document.querySelectorAll('.c')[{e}]).animationName")=='none' and q.evaluate("getComputedStyle(board).animationName")=='none')
    b.close()
finally:
    srv.terminate()
print(f'\n{sum(res)} aprovados, {len(res) - sum(res)} falharam'); sys.exit(0 if all(res) else 1)
