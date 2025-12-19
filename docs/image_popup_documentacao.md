# 🖼️ Image Popup - Documentação

Sistema de popups de imagens com regras personalizáveis de exibição.

## 📋 Índice

- [Instalação](#instalação)
- [Configuração Básica](#configuração-básica)
- [Configuração Avançada](#configuração-avançada)
- [Múltiplos Popups](#múltiplos-popups)
- [Regras de Exibição](#regras-de-exibição)
- [API Pública](#api-pública)
- [Exemplos Práticos](#exemplos-práticos)

---

## 🚀 Instalação

### 1. Incluir o Script

```html
<script src="path/to/image_popup.js"></script>
```

### 2. Configuração Opcional (antes do script)

```html
<script>
  window.ImagePopupConfig = {
    // Suas configurações aqui
  };
</script>
<script src="path/to/image_popup.js"></script>
```

---

## ⚙️ Configuração Básica

### Exemplo Simples

```html
<script>
  window.ImagePopupConfig = {
    popups: [
      {
        id: "promocao",
        imageUrl: "https://seusite.com/imagens/promocao.jpg",
        maxDisplays: 3,
        cooldownHours: 24,
        enabled: true,
      },
    ],
  };
</script>
<script src="path/to/image_popup.js"></script>
```

### Propriedades de um Popup

| Propriedade     | Tipo    | Padrão | Descrição                                                 |
| --------------- | ------- | ------ | --------------------------------------------------------- |
| `id`            | string  | -      | **Obrigatório**. Identificador único do popup             |
| `imageUrl`      | string  | -      | **Obrigatório**. URL da imagem a ser exibida              |
| `maxDisplays`   | number  | 3      | Quantidade máxima de exibições por sessão (0 = ilimitado) |
| `cooldownHours` | number  | 24     | Horas de espera após fechar para reaparecer               |
| `displayRule`   | string  | "true" | Regra JavaScript para controlar quando exibir             |
| `enabled`       | boolean | true   | Ativa/desativa o popup                                    |

---

## 🎨 Configuração Avançada

### Personalização Completa

```javascript
window.ImagePopupConfig = {
  // Array de popups
  popups: [
    {
      id: "welcome",
      imageUrl: "/images/welcome.png",
      maxDisplays: 1,
      cooldownHours: 168, // 1 semana
      displayRule: "true",
      enabled: true,
    },
  ],

  // Configurações globais
  storageKey: "meu_site_popups",
  useLocalStorage: true, // true = persiste entre sessões
  checkInterval: 3000, // Verifica a cada 3 segundos

  // Textos
  closeButtonText: "×",
  closeButtonAriaLabel: "Fechar popup",

  // Cores personalizadas
  colors: {
    overlayBackground: "rgba(0, 0, 0, 0.85)",
    popupBackground: "#ffffff",
    popupBorder: "#cccccc",
    closeButtonBackground: "#ff0000",
    closeButtonText: "#ffffff",
    closeButtonHover: "#cc0000",
  },

  // Dimensões
  maxWidth: "80%",
  maxHeight: "85vh",
  borderRadius: "16px",
  closeButtonSize: "50px",
};
```

---

## 🔢 Múltiplos Popups

Você pode configurar vários popups que serão exibidos em momentos diferentes:

```javascript
window.ImagePopupConfig = {
  popups: [
    {
      id: "popup_welcome",
      imageUrl: "/images/welcome.jpg",
      maxDisplays: 1,
      cooldownHours: 168, // 1 semana
      displayRule: "true", // Sempre tenta exibir
      enabled: true,
    },
    {
      id: "popup_promo",
      imageUrl: "/images/promo.jpg",
      maxDisplays: 5,
      cooldownHours: 12,
      displayRule: "document.querySelector('.produto') !== null", // Só em páginas de produto
      enabled: true,
    },
    {
      id: "popup_newsletter",
      imageUrl: "/images/newsletter.jpg",
      maxDisplays: 3,
      cooldownHours: 48,
      displayRule: "window.scrollY > 500", // Só após rolar 500px
      enabled: true,
    },
  ],
};
```

**Importante**: Apenas um popup é exibido por vez. O sistema verifica os popups na ordem do array e exibe o primeiro que atender todas as condições.

---

## 🎯 Regras de Exibição

As regras de exibição (`displayRule`) são expressões JavaScript que retornam `true` ou `false`.

### Exemplos de Regras

#### 1. **Sempre Exibir** (padrão)

```javascript
displayRule: "true";
```

#### 2. **Baseado em Elemento na Página**

```javascript
// Exibe apenas se houver um elemento com classe .produto
displayRule: "document.querySelector('.produto') !== null";

// Exibe se houver jQuery e body existe
displayRule: "typeof $ !== 'undefined' && $('body').length > 0";
```

#### 3. **Baseado em Scroll**

```javascript
// Exibe após rolar 300px
displayRule: "window.scrollY > 300";

// Exibe quando chegar ao fim da página
displayRule: "window.scrollY + window.innerHeight >= document.body.scrollHeight - 100";
```

#### 4. **Baseado em Tempo na Página**

```javascript
// Criar variável global no início da página:
// <script>window.pageLoadTime = Date.now();</script>

// Exibe após 30 segundos na página
displayRule: "(Date.now() - window.pageLoadTime) > 30000";
```

#### 5. **Baseado em URL**

```javascript
// Exibe apenas em URLs que contêm "checkout"
displayRule: "window.location.href.includes('checkout')";

// Exibe apenas na homepage
displayRule: "window.location.pathname === '/'";
```

#### 6. **Baseado em Cookies ou Storage**

```javascript
// Exibe se um cookie específico existe
displayRule: "document.cookie.includes('usuario_logado')";

// Exibe se há itens no carrinho (exemplo com localStorage)
displayRule: "localStorage.getItem('carrinho') !== null";
```

#### 7. **Baseado em Hora do Dia**

```javascript
// Exibe apenas durante horário comercial (9h-18h)
displayRule: "new Date().getHours() >= 9 && new Date().getHours() < 18";
```

#### 8. **Combinações Complexas**

```javascript
// Múltiplas condições
displayRule: "window.scrollY > 500 && document.querySelector('.produto') !== null && !sessionStorage.getItem('ja_comprou')";
```

### ⚠️ Cuidados com Regras

- As regras são avaliadas periodicamente (padrão: a cada 2 segundos)
- Evite regras muito complexas que podem impactar performance
- Use `try/catch` implícito - erros na regra retornam `false`
- Teste suas regras no console do navegador antes de usar

---

## 🛠️ API Pública

### Métodos Disponíveis

#### `forceShowPopup(popupId)`

Força a exibição de um popup específico, ignorando as regras.

```javascript
// Força exibir popup com ID "promocao"
window.ImagePopup.forceShowPopup("promocao");
```

#### `close()`

Fecha o popup atual.

```javascript
window.ImagePopup.close();
```

#### `resetPopupData(popupId)`

Reseta os dados de um popup (contador de exibições, último fechamento).

```javascript
// Reseta apenas o popup "welcome"
window.ImagePopup.resetPopupData("welcome");

// Reseta TODOS os popups
window.ImagePopup.resetPopupData();
```

#### `addPopup(popupConfig)`

Adiciona um novo popup dinamicamente.

```javascript
window.ImagePopup.addPopup({
  id: "novo_popup",
  imageUrl: "/images/novo.jpg",
  maxDisplays: 2,
  cooldownHours: 12,
  enabled: true,
});
```

#### `removePopup(popupId)`

Remove um popup da configuração.

```javascript
window.ImagePopup.removePopup("popup_antigo");
```

#### `updatePopupConfig(popupId, updates)`

Atualiza a configuração de um popup existente.

```javascript
window.ImagePopup.updatePopupConfig("promocao", {
  imageUrl: "/images/nova-promocao.jpg",
  maxDisplays: 10,
});
```

#### `getPopupStats(popupId)`

Retorna estatísticas de um popup.

```javascript
const stats = window.ImagePopup.getPopupStats("promocao");
console.log(stats);
// {
//     id: "promocao",
//     displayCount: 2,
//     maxDisplays: 3,
//     lastClosedAt: "2024-12-19T10:30:00.000Z",
//     canShow: false
// }
```

#### `destroy()`

Remove completamente o sistema de popups.

```javascript
window.ImagePopup.destroy();
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Popup de Boas-Vindas (Uma Única Vez)

```html
<script>
  window.ImagePopupConfig = {
    popups: [
      {
        id: "welcome",
        imageUrl: "https://seusite.com/welcome.jpg",
        maxDisplays: 1,
        cooldownHours: 8760, // 1 ano
        displayRule: "true",
        enabled: true,
      },
    ],
    useLocalStorage: true, // Persiste entre sessões
  };
</script>
<script src="path/to/image_popup.js"></script>
```

### Exemplo 2: Popup Promocional Recorrente

```html
<script>
  window.ImagePopupConfig = {
    popups: [
      {
        id: "black_friday",
        imageUrl: "https://seusite.com/black-friday.jpg",
        maxDisplays: 0, // Ilimitado
        cooldownHours: 24, // Uma vez por dia
        displayRule: "true",
        enabled: true,
      },
    ],
    colors: {
      overlayBackground: "rgba(0, 0, 0, 0.9)",
      closeButtonBackground: "#000000",
    },
  };
</script>
<script src="path/to/image_popup.js"></script>
```

### Exemplo 3: Popup Baseado em Comportamento

```html
<script>
  window.ImagePopupConfig = {
    popups: [
      {
        id: "exit_intent",
        imageUrl: "/images/nao-va-embora.jpg",
        maxDisplays: 2,
        cooldownHours: 48,
        displayRule:
          "window.scrollY < 100 && document.querySelector('.produto-adicionado')",
        enabled: true,
      },
    ],
    checkInterval: 1000, // Verifica a cada 1 segundo
  };
</script>
<script src="path/to/image_popup.js"></script>
```

### Exemplo 4: Múltiplos Popups com Prioridades

```html
<script>
  window.ImagePopupConfig = {
    popups: [
      // Prioridade 1: Welcome (apenas primeira visita)
      {
        id: "welcome",
        imageUrl: "/images/bem-vindo.jpg",
        maxDisplays: 1,
        cooldownHours: 8760,
        displayRule: "true",
        enabled: true,
      },
      // Prioridade 2: Promoção (após scroll)
      {
        id: "promocao",
        imageUrl: "/images/promocao.jpg",
        maxDisplays: 3,
        cooldownHours: 24,
        displayRule: "window.scrollY > 800",
        enabled: true,
      },
      // Prioridade 3: Newsletter (no checkout)
      {
        id: "newsletter",
        imageUrl: "/images/newsletter.jpg",
        maxDisplays: 5,
        cooldownHours: 12,
        displayRule: "window.location.pathname.includes('/checkout')",
        enabled: true,
      },
    ],
    useLocalStorage: true,
  };
</script>
<script src="path/to/image_popup.js"></script>
```

### Exemplo 5: Controle Manual via JavaScript

```html
<script src="path/to/image_popup.js"></script>

<button onclick="window.ImagePopup.forceShowPopup('promocao')">
  Ver Promoção
</button>

<button onclick="window.ImagePopup.resetPopupData()">
  Resetar Todos Popups
</button>

<script>
  // Adicionar popup dinamicamente após 5 segundos
  setTimeout(() => {
    window.ImagePopup.addPopup({
      id: "dinamico",
      imageUrl: "/images/oferta-especial.jpg",
      maxDisplays: 1,
      cooldownHours: 1,
      enabled: true,
    });
  }, 5000);

  // Verificar estatísticas
  setInterval(() => {
    const stats = window.ImagePopup.getPopupStats("promocao");
    console.log("Status da promoção:", stats);
  }, 10000);
</script>
```

---

## 🎨 Personalização Visual

### Cores Personalizadas

```javascript
window.ImagePopupConfig = {
  colors: {
    overlayBackground: "rgba(25, 25, 112, 0.95)", // Azul escuro
    popupBackground: "#f0f0f0",
    popupBorder: "#4169e1",
    closeButtonBackground: "#ff6347",
    closeButtonText: "#ffffff",
    closeButtonHover: "#ff4500",
  },
};
```

### Dimensões Customizadas

```javascript
window.ImagePopupConfig = {
  maxWidth: "600px", // Largura fixa
  maxHeight: "80vh",
  borderRadius: "20px",
  closeButtonSize: "60px",
};
```

---

## 📊 Storage e Persistência

### Session Storage (Padrão para `useLocalStorage: false`)

- Dados persistem apenas durante a sessão do navegador
- Ao fechar o navegador, os dados são perdidos
- Popups podem reaparecer em nova sessão mesmo que já tenham atingido `maxDisplays`

### Local Storage (`useLocalStorage: true`)

- Dados persistem entre sessões
- Permanece mesmo após fechar o navegador
- Popups respeitam `maxDisplays` e `cooldownHours` entre sessões

```javascript
window.ImagePopupConfig = {
  storageKey: "meu_site_popups", // Chave personalizada
  useLocalStorage: true, // Usar localStorage
};
```

---

## 🐛 Debugging

### Ver Dados Salvos

```javascript
// Ver todos os dados salvos
console.log(window.ImagePopup.popupData);

// Ver estatísticas de um popup específico
console.log(window.ImagePopup.getPopupStats("promocao"));
```

### Limpar Dados para Testes

```javascript
// Limpar dados de um popup específico
window.ImagePopup.resetPopupData("welcome");

// Limpar TODOS os dados
window.ImagePopup.resetPopupData();

// Ou diretamente no storage
localStorage.removeItem("image_popup_data");
```

### Forçar Exibição para Testes

```javascript
// Força mostrar independente das regras
window.ImagePopup.forceShowPopup("promocao");
```

---

## ✅ Checklist de Implementação

- [ ] Script incluído na página
- [ ] Configuração definida (se personalizada)
- [ ] IDs únicos para cada popup
- [ ] URLs das imagens corretas e acessíveis
- [ ] Regras de exibição testadas
- [ ] `maxDisplays` e `cooldownHours` configurados adequadamente
- [ ] `useLocalStorage` definido conforme necessidade
- [ ] Testado em diferentes dispositivos (responsivo)
- [ ] Acessibilidade verificada (ESC fecha, foco no botão)

---

## 🚨 Problemas Comuns

### Popup não aparece

1. **Verifique a regra**: Teste a `displayRule` no console
2. **Verifique maxDisplays**: Pode ter atingido o limite
3. **Verifique cooldown**: Pode estar no período de espera
4. **Verifique enabled**: Certifique-se que está `true`
5. **Limpe os dados**: Use `resetPopupData()` para testar

### Imagem não carrega

1. **Verifique URL**: Confirme que a URL está correta
2. **CORS**: Certifique-se que a imagem permite acesso
3. **Caminho relativo**: Use caminhos absolutos quando possível

### Popup aparece demais

1. **Ajuste maxDisplays**: Reduza o número de exibições
2. **Aumente cooldown**: Aumente as horas de espera
3. **Refine a regra**: Adicione condições mais específicas

---

**Versão**: 1.0  
**Última atualização**: Dezembro 2024  
**Compatibilidade**: Navegadores modernos (ES6+)
