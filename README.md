# 🍄 Super Mario Web — Plataforma em JavaScript

Experimento de plataforma feito com HTML, CSS e JavaScript puro. **Fan game não oficial**: Mario, imagens e músicas da franquia pertencem aos titulares dos direitos.

## Jogar

**[GitHub Pages](https://helioconde.github.io/Super-Mario-in-JavaScript-html/)**

> A versão 2 está sendo desenvolvida na branch `improve/platformer-core-2026`. O GitHub Pages só mostrará esta versão depois do merge em `gh-pages`.

## Funcionalidades da versão 2

- Três fases com cenários, obstáculos e dificuldades diferentes.
- Física com aceleração, desaceleração, gravidade, pulo variável, colisões com teto/paredes/chão e plataformas móveis.
- Moedas, pontuação, blocos surpresa e quebráveis, inimigos, checkpoints e bandeiras de conclusão.
- Três vidas, dano, período de invulnerabilidade e proteção colecionável.
- Menus, HUD, pausa, reinício, recordes e desbloqueio persistidos no navegador.
- Teclas e controles sensíveis ao toque.
- Sem bibliotecas de runtime: HTML Canvas 2D e módulos ES.

## Controles

| Ação | Teclado | Toque |
|---|---|---|
| Mover | ← → ou A D | ◀ ▶ |
| Pular | Espaço, W ou ↑ | ▲ |
| Correr | Shift | ⚡ |
| Pausar | P ou Esc | botão Pausar |
| Reiniciar | R | botão Reiniciar |

## Executar e testar

```bash
git clone https://github.com/HelioConde/Super-Mario-in-JavaScript-html.git
cd Super-Mario-in-JavaScript-html
npm run check
python -m http.server 8000
```

Acesse `http://localhost:8000`. O Node.js é necessário **apenas para os testes**; o jogo roda sem servidor de backend.

## Estrutura

- `index.html`: estrutura semântica do jogo.
- `css/game.css`: layout responsivo e menus.
- `js/levels.js`: mapas editáveis, armazenados em dados.
- `js/game.js`: física, renderização, estados, inimigos e interações.
- `tests/levels.test.js`: testes automáticos de integridade dos mapas.
- `.github/workflows/quality.yml`: validação no GitHub Actions.
- `img/`, `song/`, `js/script.js`: recursos e protótipo histórico preservados.

## Qualidade e limitações

A integridade dos mapas e a sintaxe têm verificações automáticas. Ainda são necessários testes visuais e reais de gameplay, principalmente em dispositivos móveis. Física e inimigos usam regras simples; faltam acessibilidade ampliada, editor visual de fases, arte original e uma suíte de testes ponta a ponta.

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).
