# Sudoku — Desafio de Lógica

<p align="center">
  <a href="https://eliseuangelos.github.io/quebra-cabeca/" target="_blank">
    <img src="https://img.shields.io/badge/ACESSAR_O_JOGO-00D9FF?style=for-the-badge&logo=puzzle&logoColor=050505" alt="Acessar o Sudoku">
  </a>
  <a href="https://eliseuangelos.github.io/" target="_blank">
    <img src="https://img.shields.io/badge/SITE_PESSOAL-111827?style=for-the-badge&logo=googlechrome&logoColor=00D9FF" alt="Site Pessoal">
  </a>
  <a href="https://github.com/eliseuangelos" target="_blank">
    <img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://linkedin.com/in/eliseu-fernandes-laurindo" target="_blank">
    <img src="https://img.shields.io/badge/LINKEDIN-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
</p>

<p align="center"><strong>Um desafio de raciocínio lógico, concentração e estratégia.</strong></p>

---

## Sobre o projeto

O **Sudoku — Desafio de Lógica** é uma aplicação web interativa inspirada no tradicional jogo de Sudoku. O tabuleiro 9 × 9 permite iniciar partidas em três níveis de dificuldade, acompanhar o tempo e o progresso e utilizar recursos de apoio durante a resolução.

A aplicação foi organizada para funcionar diretamente no navegador, com interface adaptável a diferentes tamanhos de tela. O jogador pode verificar possíveis erros, registrar anotações, revelar uma resposta ou consultar a solução completa. Também há opções para imprimir o desafio.

**Acesse:** [eliseuangelos.github.io/sudoku](https://eliseuangelos.github.io/sudoku/)

## Objetivos do site

- Oferecer uma versão digital e acessível do Sudoku tradicional.
- Estimular raciocínio lógico, concentração, análise e resolução de problemas.
- Disponibilizar diferentes níveis para atender jogadores com experiências distintas.
- Permitir que o usuário acompanhe sua partida e utilize recursos de apoio quando necessário.
- Explorar, como projeto de aprendizagem, a implementação de regras, geração de desafios e interação em JavaScript.

## Funcionalidades

### Tabuleiro e partida

- Tabuleiro clássico com 9 linhas, 9 colunas e regiões de 3 × 3.
- Seleção de células e preenchimento com números de 1 a 9.
- Diferenciação entre valores originais do desafio e números inseridos pelo jogador.
- Cronômetro e indicador de progresso.
- Início de um novo Sudoku e reinício da partida atual.

### Níveis de dificuldade

- **Fácil:** desafio de entrada para quem está começando.
- **Médio:** exige maior atenção e análise.
- **Difícil:** apresenta uma resolução mais exigente.

### Recursos de apoio

- Revelar uma resposta correta em uma célula.
- Consultar a solução completa do desafio.
- Verificar erros ou possíveis conflitos no preenchimento.
- Apagar os números inseridos pelo jogador.
- Ativar o modo de anotações para registrar possibilidades nas células.
- Consultar instruções de como jogar e informações de créditos.

### Impressão

A aplicação disponibiliza um comando para imprimir o Sudoku e permitir a resolução fora da tela. O resultado da impressão pode variar conforme as configurações de impressão do navegador.

## Regras básicas do Sudoku

O objetivo é preencher as células vazias com números de 1 a 9, sem repetir valores:

1. Em cada linha.
2. Em cada coluna.
3. Em cada bloco de 3 × 3.

## Tecnologias utilizadas

| Tecnologia ou recurso | Aplicação |
|---|---|
| HTML5 | Estrutura do tabuleiro, controles e diálogos. |
| CSS3 | Apresentação visual, layout responsivo, estados e impressão. |
| JavaScript | Interação, regras da partida, cronômetro e recursos de apoio. |
| Motor de Sudoku | Geração de desafios e avaliação das soluções. |
| GitHub Pages | Hospedagem estática da aplicação. |

O repositório separa a estrutura da interface, os estilos e a lógica do jogo em arquivos próprios. Entre os arquivos principais estão `index.html`, `style.css`, `app.js` e `sudoku-engine.js`.

## Como jogar

1. Abra o [Sudoku](https://eliseuangelos.github.io/sudoku/).
2. Escolha Fácil, Médio ou Difícil no menu.
3. Inicie uma nova partida.
4. Selecione uma célula vazia e informe o número desejado.
5. Utilize o modo de anotações para registrar possibilidades, quando necessário.
6. Verifique o preenchimento e conclua o tabuleiro respeitando as regras do Sudoku.

Os recursos de revelação e solução completa são ferramentas de auxílio e podem reduzir o desafio pessoal da partida.

## Execução local

```bash
git clone https://github.com/eliseuangelos/sudoku.git
cd sudoku
python3 -m http.server 8000
```

Acesse `http://localhost:8000/` no navegador. Também é possível abrir `index.html` diretamente, desde que os arquivos locais do projeto permaneçam na estrutura esperada.

## Sobre o autor

Sou **Eliseu Fernandes Laurindo**, profissional com experiência em atividades administrativas e operacionais e estudante autodidata de tecnologia. Comecei a estudar HTML e CSS por volta de 2010 e, desde então, mantenho contato com fundamentos de JavaScript. Na adolescência, experimentei estruturas de jogos digitais; mais tarde, atuei como tutor de uma comunidade internacional e multiplataforma de MMORPG, mantive uma fanpage e desenvolvi scripts e calculadoras para auxiliar jogadores.

Hoje direciono essa curiosidade para projetos próprios de estudo e utilidade prática, explorando também as possibilidades da inteligência artificial. **Não sou desenvolvedor profissional nem possuo formação acadêmica específica em desenvolvimento de software.** Sou estudante e entusiasta de tecnologia e IA; este Sudoku é uma experiência de aprendizagem e experimentação, com apoio de documentação, testes e ferramentas digitais.

- **Projeto:** [Sudoku — Desafio de Lógica](https://eliseuangelos.github.io/sudoku/)
- **Site pessoal:** [eliseuangelos.github.io](https://eliseuangelos.github.io/)
- **GitHub:** [github.com/eliseuangelos](https://github.com/eliseuangelos)
- **LinkedIn:** [linkedin.com/in/eliseu-fernandes-laurindo](https://linkedin.com/in/eliseu-fernandes-laurindo)

---

<p align="center"><em>“Quanto mais aumenta nosso conhecimento, mais evidente fica nossa ignorância.”</em><br><strong>John F. Kennedy</strong></p>
