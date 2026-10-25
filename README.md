<div align="center">
  <h1>🍄 Super Mario — Experimento Web</h1>
  <p><strong>Estudo de movimentação, pulo, gravidade e interação com cenário usando JavaScript e jQuery.</strong></p>
  <p><img alt="HTML/CSS/JS" src="https://img.shields.io/badge/HTML%20%2B%20CSS%20%2B%20JS-Jogo%20Web-F7DF1E?logo=javascript&logoColor=black"> <img alt="Status" src="https://img.shields.io/badge/status-prot%C3%B3tipo%20hist%C3%B3rico-64748b"></p>
</div>

## Sobre o protótipo

Projeto antigo de jogo para navegador, inspirado nos clássicos de plataforma. A implementação usa **HTML, CSS, JavaScript e jQuery**, com sprites, cenários e áudio local.

O script `js/script.js` define rotinas de **movimentação horizontal, pulo, gravidade, animações e colisão simplificada com pisos**. É um experimento de mecânicas, não uma reprodução completa dos jogos oficiais.

## Como testar

```bash
git clone https://github.com/HelioConde/Super-Mario-in-JavaScript-html.git
cd Super-Mario-in-JavaScript-html
python -m http.server 8000
```

Abra `http://localhost:8000`. O projeto não possui `package.json` e não depende de um servidor de jogo.

**A compatibilidade com navegadores e tamanhos de tela atuais não foi validada nesta revisão**. O código utiliza posicionamento de elementos DOM e detecção simples de objetos; colisões e desempenho podem variar.

## Organização

| Caminho | Conteúdo |
| --- | --- |
| `index.html` | Página inicial do protótipo |
| `js/script.js` | Física simplificada, controles e animações |
| `js/jquery.min.js` | Biblioteca histórica de interação |
| `css/` | Estilos e disposição do cenário |
| `img/` | Sprites e imagens |
| `song/` | Recursos de áudio |
| `index.md` | Documento histórico |

## O que precisaria melhorar

- Consolidar um loop único de atualização e movimento por tempo real decorrido.
- Substituir a colisão baseada em `elementFromPoint` por uma camada de física consistente.
- Tratar limites de tela, movimento contínuo, pausa e entrada por toque.
- Criar testes básicos das regras de movimento antes de expandir fases.

## Aviso legal

**Projeto de aprendizado, não oficial.** Mario, suas imagens, músicas e demais recursos da franquia pertencem à Nintendo e aos respectivos titulares. O repositório não concede permissão para redistribuí-los comercialmente.

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).
