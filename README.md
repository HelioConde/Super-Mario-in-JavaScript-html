# 🍄 Super Mario — Plataforma Web

Protótipo de jogo de plataforma para navegador, inspirado nos clássicos da Nintendo. Projeto de estudo feito em **HTML, CSS, JavaScript e jQuery**, com sprites e áudio locais.

> **Projeto de fã não oficial.** Personagens, músicas e artes associados a Mario pertencem aos respectivos titulares.

## ▶️ Jogar

**[Abrir o jogo no GitHub Pages](https://helioconde.github.io/Super-Mario-in-JavaScript-html/)**

O GitHub Pages publica a branch `gh-pages`. Alterações propostas por pull request só serão publicadas quando forem mescladas nessa branch.

## 🎮 Comandos (versão modernizada)

| Ação | Controle |
| --- | --- |
| Andar | ← / → ou A / D |
| Pular | Espaço, W ou ↑ |
| Correr | Shift |
| Pausar / continuar | P ou Esc |
| Reiniciar | R |
| Personalizar controles | Botão **Teclas** durante o jogo |

Em dispositivos com tela sensível ao toque, aparecem botões de movimento, corrida e pulo.

## 🛠️ Melhorias da revitalização

- Atualização do movimento em um único ciclo `requestAnimationFrame`, com delta time limitado.
- Gravidade e salto controlados por velocidade vertical.
- Detecção de pouso nas superfícies dos pisos já presentes na fase.
- Câmera horizontal acompanhando o personagem, sem intervalos acumulados.
- Tela inicial com botão de início, conclusão ao chegar ao extremo da fase, botão de reinício e pausa.
- HUD compacto com progresso e contagem de quedas.
- Controles por toque e mapeamento persistente em `localStorage`.
- Pausa automática quando a janela perde foco.
- Remoção dos logs e timers redundantes de movimentação.

## Executar localmente

```bash
git clone https://github.com/HelioConde/Super-Mario-in-JavaScript-html.git
cd Super-Mario-in-JavaScript-html
python -m http.server 8000
```

Acesse `http://localhost:8000`.

## Limitações e próximos passos

A física implementa pouso em superfícies horizontais. Ainda faltam colisões laterais/teto, coleta de moedas, inimigos, checkpoints, sons dedicados a cada evento e fases estruturadas. O cenário histórico é composto por blocos posicionados diretamente no HTML; a evolução ideal será separar mapa, renderização e mecânicas em módulos. A versão precisa de teste visual e funcional em navegadores desktop e mobile antes de ser considerada estável.

Feito por [Hélio Conde](https://github.com/HelioConde).