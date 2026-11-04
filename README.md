
# ◈ SUDOKU — Desafio de Lógica

<p align="center">
  <strong>Um desafio de lógica, estratégia e concentração.</strong>
  <br>
  Jogue diretamente no navegador com uma interface moderna,
  minimalista e tecnológica.
</p>

<p align="center">
  <a href="https://eliseuangelos.github.io/sudoku/">
    <img src="https://img.shields.io/badge/▶_JOGAR_SUDOKU-00E5FF?style=for-the-badge&logoColor=black" alt="Jogar Sudoku">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Responsivo-Sim-00C853?style=flat-square" alt="Responsivo">
  <img src="https://img.shields.io/badge/Offline-Sim-526FFF?style=flat-square" alt="Offline">
</p>

---

## 🎮 Sobre o projeto

O **SUDOKU — Desafio de Lógica** é uma aplicação web
desenvolvida para proporcionar uma experiência interativa
de resolução de Sudoku diretamente no navegador.

O projeto combina um motor próprio de geração e validação
de desafios com uma interface visual inspirada no conceito
Dark Premium, utilizando tons escuros, detalhes em ciano,
efeitos de iluminação e transições suaves.

O objetivo é oferecer uma experiência simples e intuitiva:
abrir o jogo, encontrar um desafio pronto e começar a jogar.

Não exige cadastro, instalação de aplicativos ou conexão
com serviços externos.

## 🚀 Acesse o jogo

<p align="center">
  <a href="https://eliseuangelos.github.io/sudoku/">
    <strong>ACESSAR SUDOKU →</strong>
  </a>
</p>

Disponível para computadores, tablets e smartphones.

---

## ✨ Funcionalidades

### 🧩 Desafios e dificuldades

- Geração dinâmica de tabuleiros 9x9.
- Três níveis de dificuldade:
  - Fácil.
  - Médio.
  - Difícil.
- Geração de diferentes combinações de desafios.
- Validação matemática dos tabuleiros.
- Verificação da unicidade da solução.

### 🎯 Recursos de jogo

- Preenchimento por teclado.
- Teclado numérico para dispositivos móveis.
- Seleção de células.
- Destaque de linhas, colunas e blocos 3x3.
- Identificação de números iguais.
- Detecção de números conflitantes.
- Diferenciação visual entre números originais,
  preenchidos pelo jogador e revelados pelo sistema.

### 💡 Dicas e soluções

- Revelação individual de uma resposta.
- Seleção inteligente de células para dicas.
- Revelação da solução completa.
- Verificação de respostas incorretas.
- Identificação de conflitos no tabuleiro.
- Modo de anotações para registrar possibilidades.

### ⏱️ Acompanhamento

- Cronômetro da partida.
- Identificação do nível selecionado.
- Feedback visual durante o jogo.
- Animação de conclusão ao resolver corretamente
  o desafio.

### 🖨️ Impressão

Duas modalidades de impressão:

**Somente Sudoku**
- Imprime o desafio original.
- Mantém as células não preenchidas.
- Formato A4, orientação vertical.

**Sudoku + Gabarito**
- Primeira página: desafio original.
- Segunda página: solução completa.
- Layout otimizado para impressão ou salvamento em PDF.

### 📱 Experiência responsiva

- Interface adaptável a diferentes tamanhos de tela.
- Menu lateral expansível.
- Controles adaptados para dispositivos móveis.
- Navegação por teclado.
- Efeitos e transições CSS.
- Interface minimalista e acessível.

---

## 🧠 Tecnologia e lógica do Sudoku

O projeto possui um motor independente da interface,
responsável pela geração, resolução, validação e
avaliação dos desafios.

### Geração dos tabuleiros

A geração utiliza o algoritmo de **Backtracking**,
com randomização para produzir diferentes combinações.

O processo envolve:

1. Construção de uma grade completa e válida.
2. Remoção progressiva de números.
3. Verificação da validade das linhas, colunas e blocos.
4. Contagem de soluções possíveis.
5. Preservação de desafios com solução única.
6. Avaliação lógica da dificuldade.

### Verificação de unicidade

O solucionador utiliza uma estratégia de busca com
parada antecipada ao encontrar duas soluções.

Como o objetivo é garantir uma única resposta,
não é necessário continuar a busca após identificar
uma segunda solução.

### Avaliação de dificuldade

O motor utiliza técnicas de resolução lógica:

| Técnica | Classificação |
|---|---|
| Naked Singles | Fácil |
| Hidden Singles | Fácil |
| Locked Candidates | Médio |
| Naked Pairs | Difícil |
| Hidden Pairs | Difícil |

A quantidade de pistas também é considerada como
referência complementar na geração dos desafios.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| HTML5 | Estrutura da aplicação |
| CSS3 | Identidade visual, animações e responsividade |
| JavaScript ES6+ | Interatividade e funcionalidades |
| CSS Grid | Organização do tabuleiro 9x9 |
| Flexbox | Distribuição dos elementos |
| Backtracking | Geração e resolução dos desafios |
| Local Browser | Processamento no navegador |

O projeto não utiliza frameworks ou bibliotecas externas.

Toda a lógica de geração e funcionamento é executada
localmente no navegador.

---

## 📂 Estrutura do projeto

```text
sudoku/
│
├── index.html
│   └── Estrutura HTML da aplicação
│
├── style.css
│   └── Estilos, animações, responsividade e impressão
│
├── sudoku-engine.js
│   └── Motor matemático:
│       ├── Geração dos tabuleiros
│       ├── Backtracking
│       ├── Validação
│       ├── Contagem de soluções
│       ├── Cálculo de candidatos
│       ├── Avaliação de dificuldade
│       └── Desafios de contingência
│
├── app.js
│   └── Controle da interface:
│       ├── Seleção de células
│       ├── Preenchimento
│       ├── Teclado numérico
│       ├── Anotações
│       ├── Revelação de respostas
│       ├── Verificação de erros
│       ├── Cronômetro
│       ├── Menu lateral
│       └── Impressão
│
└── README.md
    └── Documentação do projeto
```

---

## 💻 Como executar localmente

Não é necessário instalar dependências ou configurar
um backend.

### 1. Clonar o repositório

```bash
git clone https://github.com/eliseuangelos/sudoku.git
```

### 2. Acessar a pasta

```bash
cd sudoku
```

### 3. Executar

Uma opção é abrir o arquivo `index.html` diretamente
no navegador.

Outra opção é iniciar um servidor HTTP local:

```bash
python3 -m http.server 8000
```

Depois, acesse:

```text
http://localhost:8000
```

---

## 🌐 Hospedagem

O projeto está hospedado no **GitHub Pages**.

Sua estrutura estática permite publicação sem
necessidade de servidor backend.

Para acessar:

https://eliseuangelos.github.io/sudoku/

---

## 🔒 Privacidade e funcionamento offline

O Sudoku foi desenvolvido para funcionar diretamente
no navegador.

- Não exige cadastro.
- Não utiliza banco de dados remoto.
- Não depende de APIs externas.
- Não utiliza bibliotecas hospedadas em CDNs.
- Não envia os dados da partida para um servidor.

Após carregar os arquivos da aplicação, os recursos
do jogo funcionam localmente, sem necessidade de
conexão contínua com a internet.

---

## 👨‍💻 Desenvolvedor

**ELISEU FERNANDES LAURINDO**

Projeto desenvolvido como parte de uma iniciativa
de aprendizado, desenvolvimento web e exploração
de algoritmos aplicados a jogos de lógica.

🌐 **Site pessoal e profissional:**

https://eliseuangelos.github.io/eliseuangelos/

💻 **GitHub:**

https://github.com/eliseuangelos

🎮 **Jogue Sudoku:**

https://eliseuangelos.github.io/sudoku/

---

<p align="center">
  <strong>SUDOKU — Desafie sua lógica.</strong>
  <br>
  <sub>Desenvolvido por Eliseu Fernandes Laurindo.</sub>
</p>
