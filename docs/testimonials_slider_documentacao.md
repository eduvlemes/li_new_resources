# 📋 Testimonials Slider — Documentação

Seção de depoimentos responsiva com slider em Vanilla JS. Zero dependências externas.

---

## Visão geral

O plugin injeta automaticamente uma seção de depoimentos com slider na página. Cada slide exibe um card com:

- Aspas tipográficas decorativas
- Texto do depoimento
- Foto circular (ou iniciais como fallback), nome e cargo do autor

**Recursos:**

- Responsivo: 3 cards no desktop, 2 no tablet, 1 no mobile
- Navegação por setas, pontos indicadores e swipe touch
- Autoplay com pausa ao hover
- Teclado: `←` / `→` com foco no viewport
- Loop infinito configurável
- Tema claro e escuro prontos para usar
- Acessível (ARIA roles e labels)
- Seguro: todo conteúdo dinâmico é escapado contra XSS

---

## Inclusão na página

```html
<!-- Opcional: configuração personalizada (deve vir ANTES do script) -->
<script>
  window.TestimonialsSliderConfig = {
    title: "BEM-ESTAR NÃO É META. É ESTADO.",
    testimonials: [
      /* ... */
    ],
  };
</script>

<!-- Script do plugin -->
<script src="resources/testimonials_slider.js"></script>
```

---

## Referência de configuração

Todas as propriedades são opcionais. O plugin usa os valores padrão para qualquer propriedade não informada.

### Controle geral

| Propriedade      | Padrão        | Descrição                                                          |
| ---------------- | ------------- | ------------------------------------------------------------------ |
| `active`         | `true`        | `false` desativa o plugin completamente                            |
| `insertSelector` | `"body"`      | Seletor CSS do elemento onde a seção será inserida                 |
| `insertMethod`   | `"beforeend"` | Como inserir: `beforeend`, `afterbegin`, `beforebegin`, `afterend` |
| `containerClass` | `""`          | Classe CSS extra adicionada à `<section>`                          |

### Título

| Propriedade | Padrão                          | Descrição                           |
| ----------- | ------------------------------- | ----------------------------------- |
| `showTitle` | `true`                          | Exibe ou oculta o bloco de título   |
| `title`     | `"O QUE NOSSOS CLIENTES DIZEM"` | Título principal em caixa alta      |
| `subtitle`  | `""`                            | Subtítulo opcional abaixo do título |

### Depoimentos

```js
testimonials: [
  {
    quote: "Texto do depoimento.", // obrigatório
    author: "Nome Sobrenome", // obrigatório
    role: "Cargo ou título", // opcional
    photo: "https://url-da-foto.jpg", // opcional; usa iniciais como fallback
  },
];
```

### Comportamento do slider

| Propriedade            | Padrão | Descrição                                  |
| ---------------------- | ------ | ------------------------------------------ |
| `autoplay`             | `true` | Avança os slides automaticamente           |
| `autoplayDelay`        | `5000` | Intervalo em ms entre transições           |
| `loop`                 | `true` | Volta ao início ao chegar no último slide  |
| `showArrows`           | `true` | Exibe botões de navegação anterior/próximo |
| `showDots`             | `true` | Exibe os pontos indicadores de posição     |
| `visibleCards.desktop` | `3`    | Cards visíveis em telas ≥ 1024px           |
| `visibleCards.tablet`  | `2`    | Cards visíveis em telas ≥ 600px            |
| `visibleCards.mobile`  | `1`    | Cards visíveis em telas < 600px            |
| `cardGap`              | `24`   | Espaço em px entre os cards                |

### Cores

Todas as cores podem ser sobrescritas individualmente:

| Chave               | Padrão             | Onde é aplicada                |
| ------------------- | ------------------ | ------------------------------ |
| `sectionBackground` | `#f5f5f5`          | Fundo da seção                 |
| `titleColor`        | `#111111`          | Cor do título                  |
| `subtitleColor`     | `#666666`          | Cor do subtítulo               |
| `cardBackground`    | `#ffffff`          | Fundo do card                  |
| `cardBorder`        | `#e8e8e8`          | Borda do card                  |
| `cardShadow`        | `rgba(0,0,0,0.07)` | Sombra do card                 |
| `quoteMarkColor`    | `#dddddd`          | Cor das aspas decorativas      |
| `quoteTextColor`    | `#333333`          | Cor do texto do depoimento     |
| `authorNameColor`   | `#111111`          | Cor do nome do autor           |
| `authorRoleColor`   | `#888888`          | Cor do cargo do autor          |
| `authorSeparator`   | `#eeeeee`          | Linha divisória acima do autor |
| `arrowBackground`   | `#ffffff`          | Fundo dos botões de seta       |
| `arrowBorder`       | `#e0e0e0`          | Borda dos botões de seta       |
| `arrowIcon`         | `#333333`          | Cor do ícone da seta           |
| `arrowHover`        | `#f0f0f0`          | Fundo das setas ao hover       |
| `dotActive`         | `#111111`          | Cor do ponto ativo             |
| `dotInactive`       | `#cccccc`          | Cor dos pontos inativos        |
| `photoBackground`   | `#e8e8e8`          | Fundo da foto/iniciais         |
| `photoInitialsText` | `#999999`          | Cor do texto das iniciais      |

### Dimensões

| Propriedade         | Padrão        | Descrição                              |
| ------------------- | ------------- | -------------------------------------- |
| `sectionPadding`    | `"72px 20px"` | Padding da seção (CSS shorthand)       |
| `cardBorderRadius`  | `"16px"`      | Raio das bordas dos cards              |
| `photoSize`         | `"68px"`      | Tamanho da foto/iniciais               |
| `photoBorderRadius` | `"50%"`       | Raio da borda da foto (50% = circular) |

---

## API pública

Após a inicialização, o plugin fica disponível em `window.TestimonialsSlider`:

```js
// Navegar para um slide específico (0-indexado)
window.TestimonialsSlider.goTo(2);

// Navegar manualmente
window.TestimonialsSlider.next();
window.TestimonialsSlider.prev();

// Controlar o autoplay
window.TestimonialsSlider.stopAutoplay();
window.TestimonialsSlider.startAutoplay();

// Remover o widget completamente da página
window.TestimonialsSlider.destroy();
```

---

## Exemplos de uso

### Inserir em um seletor específico

```js
window.TestimonialsSliderConfig = {
  insertSelector: "#secao-depoimentos",
  insertMethod: "afterbegin",
};
```

### Tema escuro

```js
window.TestimonialsSliderConfig = {
  colors: {
    sectionBackground: "#0d0d0d",
    titleColor: "#ffffff",
    cardBackground: "#1a1a1a",
    cardBorder: "#2a2a2a",
    quoteTextColor: "#cccccc",
    authorNameColor: "#ffffff",
    authorSeparator: "#2a2a2a",
    arrowBackground: "#1a1a1a",
    arrowBorder: "#333333",
    arrowIcon: "#cccccc",
    dotActive: "#ffffff",
    dotInactive: "#444444",
    photoBackground: "#2a2a2a",
  },
};
```

### Exibir apenas 1 card por vez (qualquer tela)

```js
window.TestimonialsSliderConfig = {
  visibleCards: { desktop: 1, tablet: 1, mobile: 1 },
  cardGap: 0,
};
```

### Sem autoplay e sem dots

```js
window.TestimonialsSliderConfig = {
  autoplay: false,
  showDots: false,
  showArrows: true,
};
```

---

## Arquivo de exemplo

Veja `exemplo_testimonials_slider.html` para uma demonstração ao vivo com tema claro e escuro.
