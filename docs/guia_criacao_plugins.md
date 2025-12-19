# 📋 Guia para Criação de Plugins JavaScript

Este documento fornece as diretrizes e padrões para criar novos plugins JavaScript seguindo a estrutura estabelecida no projeto.

## 🎯 Princípios Fundamentais

### 1. **Isolamento de Escopo**

- Sempre utilizar IIFE (Immediately Invoked Function Expression)
- Evitar poluir o namespace global
- Expor apenas a API pública necessária

### 2. **Configuração Flexível**

- Configurações padrão sempre definidas
- Permitir sobrescrita através de objeto global
- Merge inteligente de configurações

### 3. **Separação de Responsabilidades**

- Configuração claramente separada da lógica
- Indicação clara do que pode/deve ser editado pelo cliente

---

## 📐 Estrutura Base do Plugin

```javascript
/**
 * [Nome do Plugin] - [Descrição breve]
 */

(function() {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.[NomePlugin]Config antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        // Configurações principais
        active: true,

        // Configurações de comportamento
        // ...

        // Configurações de estilo
        colors: {
            primary: "#3b82f6",
            secondary: "#6b7280",
            // ...
        }
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.[NomePlugin]Config && typeof window.[NomePlugin]Config === 'object') {
        Object.assign(CONFIG, window.[NomePlugin]Config);

        // Mescla cores separadamente para permitir personalização parcial
        if (window.[NomePlugin]Config.colors && typeof window.[NomePlugin]Config.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.[NomePlugin]Config.colors);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // Estilos CSS
    const CSS_STYLES = `
        <style id="[nome-plugin]-styles">
            /* Estilos aqui */
        </style>
    `;

    // Template HTML
    const HTML_TEMPLATE = `
        <!-- HTML aqui -->
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class [NomePlugin] {
        constructor() {
            this.init();
        }

        init() {
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
        }

        injectStyles() {
            if (!document.getElementById('[nome-plugin]-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById('[nome-plugin]-container');
            if (existing) {
                existing.remove();
            }
            document.body.insertAdjacentHTML('beforeend', HTML_TEMPLATE);
        }

        setupElements() {
            // Configurar referências aos elementos DOM
        }

        setupEventListeners() {
            // Configurar event listeners
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        destroy() {
            // Limpar recursos e remover do DOM
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function init[NomePlugin]() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.[NomePlugin] = new [NomePlugin]();
            });
        } else {
            window.[NomePlugin] = new [NomePlugin]();
        }
    }

    init[NomePlugin]();

})();
```

---

## 📝 Seções Obrigatórias

### 1. **Header Comentário**

```javascript
/**
 * [Nome Descritivo do Plugin] - [Descrição em 1-2 linhas]
 */
```

### 2. **IIFE com 'use strict'**

```javascript
(function () {
  "use strict";
  // código aqui
})();
```

### 3. **Bloco de Configuração Padrão**

```javascript
// ======
// CONFIGURAÇÃO PADRÃO
// ======
// O cliente pode definir window.[NomePlugin]Config antes de carregar este script
// para sobrescrever estas configurações
const DEFAULT_CONFIG = {
  // ...
};
```

**Importante:**

- Sempre incluir comentário explicativo sobre personalização
- Usar nomes descritivos para as propriedades
- Agrupar configurações relacionadas

### 4. **Merge de Configurações**

```javascript
const CONFIG = Object.assign({}, DEFAULT_CONFIG);

if (window.[NomePlugin]Config && typeof window.[NomePlugin]Config === 'object') {
    Object.assign(CONFIG, window.[NomePlugin]Config);

    // Para objetos aninhados (como colors), fazer merge separado
    if (window.[NomePlugin]Config.colors && typeof window.[NomePlugin]Config.colors === 'object') {
        CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.[NomePlugin]Config.colors);
    }
}
```

### 5. **Demarcação "NÃO ALTERAR"**

```javascript
// ======
// NÃO ALTERAR DAQUI PRA BAIXO
// ======
```

Esta linha serve como aviso visual claro para o cliente sobre onde termina a área de configuração.

### 6. **Templates CSS e HTML**

```javascript
const CSS_STYLES = `
    <style id="[id-unico-do-plugin]">
        /* CSS aqui usando interpolação de CONFIG */
        .elemento {
            color: ${CONFIG.colors.primary};
        }
    </style>
`;

const HTML_TEMPLATE = `
    <div id="[id-unico-do-plugin]">
        <!-- HTML aqui -->
    </div>
`;
```

**Boas práticas:**

- Usar IDs únicos para evitar conflitos
- Interpolar valores de CONFIG nos estilos
- Incluir prefixos nos nomes de classes CSS

### 7. **Classe Principal**

```javascript
class [NomePlugin] {
    constructor() {
        // Inicializar propriedades
        this.init();
    }

    init() {
        // Sequência de inicialização
    }

    // Métodos auxiliares privados

    // ========================================
    // API PÚBLICA
    // ========================================

    // Métodos públicos claramente demarcados
}
```

### 8. **Inicialização Automática**

```javascript
function init[NomePlugin]() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.[NomePlugin] = new [NomePlugin]();
        });
    } else {
        window.[NomePlugin] = new [NomePlugin]();
    }
}

init[NomePlugin]();
```

---

## 🎨 Padrões de Configuração

### Estrutura Recomendada de CONFIG

```javascript
const DEFAULT_CONFIG = {
  // 1. Flags de ativação/comportamento
  active: true,
  autoInit: true,

  // 2. Textos e conteúdo
  title: "Título Padrão",
  message: "Mensagem padrão",
  buttonText: "OK",

  // 3. Configurações técnicas
  storageKey: "plugin_data",
  useLocalStorage: false,
  timeout: 5000,

  // 4. Estilos e cores (em objeto separado)
  colors: {
    primary: "#3b82f6",
    secondary: "#6b7280",
    background: "#ffffff",
    text: "#1f2937",
    border: "#e5e7eb",
    // ...
  },
};
```

### Personalização pelo Cliente

O cliente pode personalizar criando um objeto de configuração **antes** de carregar o script:

```html
<script>
  window.[NomePlugin]Config = {
      active: true,
      title: "Meu Título Personalizado",
      colors: {
          primary: "#ff0000",
          // Outras cores mantêm o padrão
      }
  };
</script>
<script src="path/to/plugin.js"></script>
```

---

## 🔧 Padrões de Implementação

### 1. **Injeção de Estilos**

```javascript
injectStyles() {
    if (!document.getElementById('[plugin-id]-styles')) {
        document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
    }
}
```

### 2. **Injeção de HTML**

```javascript
injectHTML() {
    const existing = document.getElementById('[plugin-id]');
    if (existing) {
        existing.remove();
    }

    if (CONFIG.active) {
        document.body.insertAdjacentHTML('beforeend', HTML_TEMPLATE);
    }
}
```

### 3. **Configuração de Elementos**

```javascript
setupElements() {
    this.container = document.getElementById('[plugin-id]');
    this.button = document.getElementById('[plugin-id]-button');

    // Aplicar textos da configuração
    if (this.button) {
        this.button.textContent = CONFIG.buttonText;
    }
}
```

### 4. **Event Listeners**

```javascript
setupEventListeners() {
    if (!this.button) return;

    this.button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleClick();
    });
}
```

### 5. **Storage (localStorage/sessionStorage)**

```javascript
saveData(data) {
    try {
        const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
        storage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
        console.warn('Erro ao salvar dados:', e);
    }
}

loadData() {
    try {
        const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
        const data = storage.getItem(CONFIG.storageKey);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn('Erro ao carregar dados:', e);
        return null;
    }
}
```

---

## 🎯 API Pública Recomendada

Todo plugin deve expor no mínimo:

```javascript
// ========================================
// API PÚBLICA
// ========================================

/**
 * Atualiza a configuração do plugin
 * @param {Object} newConfig - Novas configurações
 */
updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
    // Reaplicar configurações se necessário
}

/**
 * Remove completamente o plugin
 */
destroy() {
    // Remover elementos do DOM
    if (this.container) {
        this.container.remove();
    }

    // Remover estilos
    const styles = document.getElementById('[plugin-id]-styles');
    if (styles) {
        styles.remove();
    }

    // Limpar event listeners, timers, etc.
}

/**
 * Reinicializa o plugin
 */
reinit() {
    this.destroy();
    this.init();
}
```

---

## ✅ Checklist de Qualidade

Antes de finalizar um plugin, verificar:

- [ ] IIFE com 'use strict' implementado
- [ ] Configuração padrão completa e bem documentada
- [ ] Suporte a personalização via window.[NomePlugin]Config
- [ ] Merge de configurações funcionando (incluindo objetos aninhados)
- [ ] Comentário "NÃO ALTERAR DAQUI PRA BAIXO" presente
- [ ] IDs únicos em CSS e HTML
- [ ] Prefixos nas classes CSS para evitar conflitos
- [ ] Verificações de existência de elementos antes de usar
- [ ] Try/catch em operações de storage
- [ ] API pública documentada
- [ ] Método destroy() implementado
- [ ] Inicialização automática com verificação de DOMContentLoaded
- [ ] Compatibilidade com múltiplas chamadas/recarregamentos
- [ ] Responsividade (media queries) quando aplicável
- [ ] Acessibilidade básica (focus, keyboard navigation)

---

## 🚀 Exemplo Completo Mínimo

```javascript
/**
 * Simple Alert Plugin - Exibe alertas customizáveis
 */

(function () {
  "use strict";

  // ======
  // CONFIGURAÇÃO PADRÃO
  // ======
  const DEFAULT_CONFIG = {
    message: "Olá!",
    buttonText: "Fechar",
    colors: {
      background: "#ffffff",
      text: "#000000",
    },
  };

  const CONFIG = Object.assign({}, DEFAULT_CONFIG);

  if (
    window.SimpleAlertConfig &&
    typeof window.SimpleAlertConfig === "object"
  ) {
    Object.assign(CONFIG, window.SimpleAlertConfig);

    if (
      window.SimpleAlertConfig.colors &&
      typeof window.SimpleAlertConfig.colors === "object"
    ) {
      CONFIG.colors = Object.assign(
        {},
        DEFAULT_CONFIG.colors,
        window.SimpleAlertConfig.colors
      );
    }
  }

  // ======
  // NÃO ALTERAR DAQUI PRA BAIXO
  // ======

  const CSS_STYLES = `
        <style id="simple-alert-styles">
            .simple-alert {
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${CONFIG.colors.background};
                color: ${CONFIG.colors.text};
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 9999;
            }
        </style>
    `;

  const HTML_TEMPLATE = `
        <div id="simpleAlert" class="simple-alert" style="display: none;">
            <p id="alertMessage"></p>
            <button id="alertButton"></button>
        </div>
    `;

  class SimpleAlert {
    constructor() {
      this.init();
    }

    init() {
      this.injectStyles();
      this.injectHTML();
      this.setupElements();
      this.setupEventListeners();
    }

    injectStyles() {
      if (!document.getElementById("simple-alert-styles")) {
        document.head.insertAdjacentHTML("beforeend", CSS_STYLES);
      }
    }

    injectHTML() {
      const existing = document.getElementById("simpleAlert");
      if (existing) existing.remove();
      document.body.insertAdjacentHTML("beforeend", HTML_TEMPLATE);
    }

    setupElements() {
      this.alert = document.getElementById("simpleAlert");
      this.message = document.getElementById("alertMessage");
      this.button = document.getElementById("alertButton");

      this.message.textContent = CONFIG.message;
      this.button.textContent = CONFIG.buttonText;
    }

    setupEventListeners() {
      this.button.addEventListener("click", () => this.hide());
    }

    // ========================================
    // API PÚBLICA
    // ========================================

    show() {
      this.alert.style.display = "block";
    }

    hide() {
      this.alert.style.display = "none";
    }

    destroy() {
      if (this.alert) this.alert.remove();
      const styles = document.getElementById("simple-alert-styles");
      if (styles) styles.remove();
    }
  }

  function initSimpleAlert() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        window.SimpleAlert = new SimpleAlert();
      });
    } else {
      window.SimpleAlert = new SimpleAlert();
    }
  }

  initSimpleAlert();
})();
```

---

## 📚 Recursos Adicionais

### Convenções de Nomenclatura

- **Arquivos**: `snake_case.js` (ex: `launch_mode.js`, `coupon_timer.js`)
- **Classes**: `PascalCase` (ex: `LaunchMode`, `CouponTimer`)
- **Variáveis e Funções**: `camelCase` (ex: `showOverlay`, `passwordInput`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `DEFAULT_CONFIG`, `CSS_STYLES`)
- **IDs e Classes CSS**: `kebab-case` (ex: `launch-mode-overlay`, `coupon-timer-container`)

### Compatibilidade de Navegadores

Recursos ES6+ utilizados que requerem atenção:

- Template literals (`` ` ``)
- `const` e `let`
- Arrow functions (`=>`)
- `Object.assign()`
- Classes (`class`)

Para suporte a navegadores antigos, considerar transpilação com Babel.

### Performance

- Minimizar manipulações do DOM
- Usar `insertAdjacentHTML` ao invés de `innerHTML` quando possível
- Debounce/throttle em eventos de scroll/resize
- Lazy loading quando apropriado

---

## 🎓 Estudo de Caso: launch_mode.js

O arquivo `launch_mode.js` é um exemplo completo que implementa:

✅ Sistema de proteção por senha  
✅ Persistência de autenticação (sessionStorage/localStorage)  
✅ Verificação por data  
✅ Animações CSS  
✅ Validação de formulário  
✅ API pública completa  
✅ Configuração altamente personalizável  
✅ Código limpo e bem documentado

**Recomendação**: Use-o como referência ao criar novos plugins.

---

## 📞 Manutenção e Versionamento

### Cabeçalho de Versão (Recomendado)

```javascript
/**
 * [Nome do Plugin] v1.0.0
 * [Descrição]
 *
 * @author [Nome]
 * @date [Data]
 * @version 1.0.0
 */
```

### Changelog

Manter um changelog no topo do arquivo ou em arquivo separado:

```javascript
/**
 * CHANGELOG:
 * v1.0.0 (2024-01-15) - Versão inicial
 * v1.1.0 (2024-02-20) - Adicionado suporte a callbacks
 * v1.1.1 (2024-03-01) - Correção de bug no IE11
 */
```

---

**Documento criado com base em**: `launch_mode.js`  
**Última atualização**: Dezembro 2024  
**Versão**: 1.0
