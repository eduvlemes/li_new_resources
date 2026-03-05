# 📋 Checkout Variation Validator - Documentação Completa

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Caso de Uso](#caso-de-uso)
4. [Configuração](#configuração)
5. [Personalização](#personalização)
6. [API Pública](#api-pública)
7. [Exemplos Práticos](#exemplos-práticos)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Checkout Variation Validator** é um plugin JavaScript que valida modelos e variações de produtos antes do usuário finalizar a compra em uma loja virtual. O plugin intercepta o clique no botão de checkout e exibe um modal de confirmação quando detecta produtos com variações específicas configuradas.

### Características Principais

✅ **Validação Inteligente** - Detecta variações específicas nos produtos do carrinho  
✅ **Modal Responsivo** - Interface elegante e responsiva  
✅ **Altamente Configurável** - Mensagens, cores, seletores e comportamentos personalizáveis  
✅ **API Completa** - Controle total via JavaScript  
✅ **Zero Dependências** - Funciona sem jQuery ou outras bibliotecas  
✅ **Performance** - Código otimizado e leve  
✅ **Acessibilidade** - Suporte a navegação por teclado

---

## 📦 Instalação

### Passo 1: Incluir o Script

```html
<script src="resources/checkout_variation_validator.js"></script>
```

### Passo 2: Configuração Básica (Opcional)

Se quiser personalizar, adicione a configuração **antes** de carregar o script:

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    variations: ["IPHONE AIR", "IPHONE 17 PRO", "TAMANHO M"],
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

### Passo 3: Pronto!

O plugin será inicializado automaticamente quando a página carregar.

---

## 💡 Caso de Uso

### Cenário 1: Validação de Modelos de Celular

**Problema:** Cliente compra uma capinha para iPhone Air, mas possui um iPhone 15.

**Solução:** O plugin detecta que há um produto com "IPHONE AIR" no carrinho e exibe:

```
⚠️ Confirmar Compra

Você está comprando um item para:
• Iphone Air

Deseja prosseguir?

[Cancelar]  [Sim, prosseguir]
```

### Cenário 2: Múltiplas Variações

**Problema:** Cliente compra capinha para iPhone Air E película para iPhone 17 Pro.

**Solução:** O plugin detecta múltiplas variações e exibe:

```
⚠️ Confirmar Compra

Você está comprando itens para:
• Iphone Air
• Iphone 17 Pro

Deseja prosseguir?

[Cancelar]  [Sim, prosseguir]
```

### Cenário 3: Validação de Tamanhos

**Problema:** Cliente compra camiseta tamanho P e calça tamanho GG (pode estar comprando para outra pessoa).

**Solução:** O plugin valida tamanhos e solicita confirmação.

---

## ⚙️ Configuração

### Configuração Padrão Completa

```javascript
window.CheckoutVariationValidatorConfig = {
  // ============================================
  // ATIVAÇÃO
  // ============================================

  // Ativa/desativa o plugin
  active: true,

  // ============================================
  // SELETORES
  // ============================================

  // Seletor da página onde o plugin deve funcionar
  pageSelector: ".pagina-carrinho:not(.carrinho-checkout)",

  // Seletor dos produtos no carrinho (onde buscar o texto)
  productSelector: ".tabela-carrinho [data-produto-id] .produto-info > a",

  // Seletor do botão de finalizar compra
  buttonSelector:
    '.carrinho-botoes .botao-finalizar, .btn-finalizar-compra, a[href*="checkout"]',

  // ============================================
  // VARIAÇÕES
  // ============================================

  // Lista de variações a serem validadas
  variations: [
    "IPHONE AIR",
    "IPHONE 17 PRO",
    "IPHONE 15",
    "SAMSUNG S24",
    "TAMANHO P",
    "TAMANHO M",
    "TAMANHO G",
  ],

  // ============================================
  // MENSAGENS
  // ============================================

  messages: {
    // Mensagem para 1 variação encontrada
    // Use {models} como placeholder - será substituído por uma lista HTML <ul>
    single: "Você está comprando um item para:{models}<br>Deseja prosseguir?",

    // Mensagem para múltiplas variações
    // Use {models} como placeholder - será substituído por uma lista HTML <ul>
    multiple: "Você está comprando itens para:{models}<br>Deseja prosseguir?",

    // Título do modal
    title: "Confirmar Compra",

    // Texto dos botões
    confirmButton: "Sim, prosseguir",
    cancelButton: "Cancelar",
  },

  // NOTA: O placeholder {models} é substituído automaticamente por uma
  // lista HTML formatada (<ul><li>Modelo 1</li><li>Modelo 2</li></ul>).
  // Não é necessário adicionar tags HTML para os modelos.

  // ============================================
  // COMPORTAMENTO
  // ============================================

  // Busca case-sensitive ou não
  caseSensitive: false,

  // Formata nomes para Title Case no modal (iPhone Air ao invés de IPHONE AIR)
  formatModelNames: true,

  // Separador entre modelos
  separator: " e ",

  // Usar "e" antes do último item (ex: "A, B e C" vs "A, B, C")
  useAnd: true,

  // ============================================
  // INTELIGÊNCIA ARTIFICIAL (IA)
  // ============================================

  // Usar IA para gerar lista de variações automaticamente
  useIA: false,

  // URL do endpoint da IA
  iaEndpoint: "https://sua-api.com/ai/variations",

  // Método HTTP (POST, GET, etc.)
  iaMethod: "POST",

  // Headers da requisição
  iaHeaders: {
    "Content-Type": "application/json",
    "Authorization": "Bearer seu-token",
  },

  // Timeout da requisição em ms
  iaTimeout: 10000,

  // Chave do sessionStorage para cache
  iaStorageKey: "cvv_ia_cache",

  // NOTA: Quando useIA está ativado, o plugin enviará os nomes dos produtos
  // do carrinho para o endpoint configurado e usará as variações retornadas.
  // O formato esperado da requisição é:
  // { "products": ["Nome Produto 1", "Nome Produto 2", ...] }
  //
  // O formato esperado da resposta é:
  // { "variations": ["VARIAÇÃO 1", "VARIAÇÃO 2", ...] }
  // ou simplesmente:
  // ["VARIAÇÃO 1", "VARIAÇÃO 2", ...]

  // ============================================
  // CORES
  // ============================================

  colors: {
    overlay: "rgba(0, 0, 0, 0.7)",
    background: "#ffffff",
    text: "#1f2937",
    title: "#111827",
    border: "#e5e7eb",
    confirmButton: "#3b82f6",
    confirmButtonHover: "#2563eb",
    confirmButtonText: "#ffffff",
    cancelButton: "#6b7280",
    cancelButtonHover: "#4b5563",
    cancelButtonText: "#ffffff",
    warningAccent: "#f59e0b",
  },

  // ============================================
  // OUTROS
  // ============================================

  // Duração da animação em ms
  animationDuration: 300,

  // Ativa logs no console para debug
  debug: false,
};
```

---

## 🎨 Personalização

### Exemplo 1: Personalizar Apenas as Variações

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    variations: ["XIAOMI 14 PRO", "XIAOMI 13", "POCO X5"],
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

### Exemplo 2: Personalizar Mensagens

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    messages: {
      single:
        "⚠️ Atenção! Você selecionou um item para:{models}Confirma que é o modelo correto?",
      multiple:
        "⚠️ Atenção! Você selecionou itens para:{models}Confirma que os modelos estão corretos?",
      title: "Verificação de Modelo",
      confirmButton: "Sim, tenho certeza",
      cancelButton: "Deixa eu revisar",
    },
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

### Exemplo 3: Personalizar Cores

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    colors: {
      confirmButton: "#10b981", // Verde
      confirmButtonHover: "#059669",
      warningAccent: "#ef4444", // Vermelho
    },
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

### Exemplo 4: Usar Regex para Variações

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    variations: [
      /IPHONE \d+/i, // Qualquer iPhone com número
      /TAMANHO [A-Z]+/i, // Qualquer tamanho
      /SAMSUNG S\d+/i, // Samsung S + número
    ],
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

### Exemplo 5: Personalizar Seletores

Se sua loja usa estrutura HTML diferente:

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    pageSelector: ".cart-page",
    productSelector: ".cart-item .product-name",
    buttonSelector: "#checkout-button, .proceed-checkout",
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

### Exemplo 6: Usar IA para Gerar Variações Automaticamente

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    // Ativar IA
    useIA: true,

    // Endpoint da sua API de IA
    iaEndpoint: "https://sua-api.com/ai/variations",

    // Configurações da requisição
    iaMethod: "POST",
    iaHeaders: {
      "Content-Type": "application/json",
      "Authorization": "Bearer seu-token-aqui",
    },
    iaTimeout: 10000,

    // Mensagens personalizadas
    messages: {
      single: "Você está comprando um item para:{models}<br>Deseja prosseguir?",
      multiple:
        "Você está comprando itens para:{models}<br>Deseja prosseguir?",
    },

    debug: true,
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

**Como funciona:**

1. O plugin coleta automaticamente os nomes dos produtos no carrinho
2. Envia uma requisição POST para o endpoint configurado com o formato:
   ```json
   {
     "products": [
       "Capinha Premium para iPhone Air",
       "Película de Vidro iPhone 17 Pro",
       "Camiseta Básica - Tamanho M"
     ]
   }
   ```
3. A IA deve retornar as variações detectadas:
   ```json
   {
     "variations": ["IPHONE AIR", "IPHONE 17 PRO", "TAMANHO M"]
   }
   ```
   ou simplesmente:
   ```json
   ["IPHONE AIR", "IPHONE 17 PRO", "TAMANHO M"]
   ```
4. O plugin usa essas variações e salva no cache (sessionStorage)
5. Em carregamentos futuros, se os produtos não mudaram, usa o cache

---

## 🤖 Usando IA para Detecção de Variações

### Visão Geral

A funcionalidade de IA permite que o plugin detecte automaticamente as variações relevantes nos produtos do carrinho, sem necessidade de configuração manual.

### Como Ativar

```javascript
window.CheckoutVariationValidatorConfig = {
  useIA: true,
  iaEndpoint: "https://sua-api.com/ai/variations",
  iaHeaders: {
    "Content-Type": "application/json",
    Authorization: "Bearer seu-token",
  },
};
```

### Formato da Requisição

O plugin envia:

```http
POST https://sua-api.com/ai/variations
Content-Type: application/json

{
  "products": [
    "Capinha Premium para iPhone Air",
    "Película de Vidro iPhone 17 Pro"
  ]
}
```

### Formato da Resposta Esperada

A API deve retornar:

**Opção 1 (objeto):**

```json
{
  "variations": ["IPHONE AIR", "IPHONE 17 PRO"]
}
```

**Opção 2 (array direto):**

```json
["IPHONE AIR", "IPHONE 17 PRO"]
```

### Cache Inteligente

O plugin implementa cache automático no `sessionStorage`:

- **Salva**: Hash dos produtos + variações retornadas
- **Reutiliza**: Se os produtos não mudarem, usa cache
- **Atualiza**: Se produtos mudarem, faz nova requisição

**Vantagens:**

- ✅ Reduz chamadas à API
- ✅ Melhora performance
- ✅ Economiza custos de API
- ✅ Funciona offline após primeira carga

### Gerenciar Cache via API

```javascript
// Limpar cache manualmente
window.CheckoutVariationValidator.clearIACache();

// Forçar recarga da IA (ignora cache)
await window.CheckoutVariationValidator.reloadVariationsFromIA(true);

// Recarregar respeitando cache
await window.CheckoutVariationValidator.reloadVariationsFromIA(false);
```

### Exemplo de Implementação do Backend

**Node.js + Express:**

```javascript
app.post("/ai/variations", async (req, res) => {
  const { products } = req.body;

  // Sua lógica de IA aqui
  const variations = await detectVariations(products);

  res.json({ variations });
});
```

**Python + Flask:**

```python
@app.route('/ai/variations', methods=['POST'])
def detect_variations():
    products = request.json['products']
    
    # Sua lógica de IA aqui
    variations = detect_variations_ai(products)
    
    return jsonify({'variations': variations})
```

### Tratamento de Erros

O plugin trata automaticamente:

- ❌ Timeout (configurável via `iaTimeout`)
- ❌ Erros de rede
- ❌ Respostas inválidas
- ❌ API indisponível

**Comportamento em caso de erro:**

- Usa variações padrão configuradas em `variations`
- Registra erro no console (se debug ativo)
- Continua funcionando normalmente

### Configurações Avançadas

```javascript
window.CheckoutVariationValidatorConfig = {
  useIA: true,

  // Endpoint
  iaEndpoint: "https://sua-api.com/ai/variations",

  // Método HTTP
  iaMethod: "POST", // ou 'GET', 'PUT', etc.

  // Headers customizados
  iaHeaders: {
    "Content-Type": "application/json",
    Authorization: "Bearer token-123",
    "X-Custom-Header": "valor",
  },

  // Timeout (10 segundos)
  iaTimeout: 10000,

  // Chave do cache (útil para múltiplos ambientes)
  iaStorageKey: "cvv_ia_cache_production",

  // Fallback: variações padrão caso IA falhe
  variations: ["PADRÃO 1", "PADRÃO 2"],
};
```

---

## 🔧 API Pública

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    pageSelector: ".cart-page",
    productSelector: ".cart-item .product-name",
    buttonSelector: "#checkout-button, .proceed-checkout",
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

---

## 🔧 API Pública

### Métodos Disponíveis

#### `addVariation(variation)`

Adiciona uma nova variação à lista.

```javascript
window.CheckoutVariationValidator.addVariation("IPHONE 16 PRO");
```

#### `removeVariation(variation)`

Remove uma variação da lista.

```javascript
window.CheckoutVariationValidator.removeVariation("IPHONE AIR");
```

#### `clearVariations()`

Remove todas as variações.

```javascript
window.CheckoutVariationValidator.clearVariations();
```

#### `getCurrentVariations()`

Retorna as variações atualmente encontradas no carrinho.

```javascript
const variations = window.CheckoutVariationValidator.getCurrentVariations();
console.log(variations); // ['IPHONE AIR', 'TAMANHO M']
```

#### `updateConfig(newConfig)`

Atualiza a configuração do plugin.

```javascript
window.CheckoutVariationValidator.updateConfig({
  debug: true,
  colors: {
    confirmButton: "#ef4444",
  },
});
```

#### `activate()` / `deactivate()`

Ativa ou desativa o plugin.

```javascript
window.CheckoutVariationValidator.deactivate(); // Desativa
window.CheckoutVariationValidator.activate(); // Ativa novamente
```

#### `reinit()`

Reinicializa o plugin (útil após mudanças dinâmicas no DOM).

```javascript
window.CheckoutVariationValidator.reinit();
```

#### `destroy()`

Remove completamente o plugin da página.

```javascript
window.CheckoutVariationValidator.destroy();
```

#### `getConfig()`

Retorna a configuração atual.

```javascript
const config = window.CheckoutVariationValidator.getConfig();
console.log(config);
```

#### `clearIACache()`

Limpa o cache de variações da IA armazenado no sessionStorage.

```javascript
window.CheckoutVariationValidator.clearIACache();
```

#### `reloadVariationsFromIA(forceReload)`

Recarrega as variações da IA. Se `forceReload` for `true`, ignora o cache.

```javascript
// Recarregar respeitando cache
await window.CheckoutVariationValidator.reloadVariationsFromIA(false);

// Forçar recarga ignorando cache
await window.CheckoutVariationValidator.reloadVariationsFromIA(true);
```

**Parâmetros:**

- `forceReload` (boolean): Se `true`, limpa o cache e faz nova requisição. Se `false`, usa cache se disponível.

**Retorna:** Promise que resolve quando as variações são carregadas.

**Exemplo completo:**

```javascript
try {
  await window.CheckoutVariationValidator.reloadVariationsFromIA(true);
  console.log("Variações atualizadas com sucesso!");

  const config = window.CheckoutVariationValidator.getConfig();
  console.log("Novas variações:", config.variations);
} catch (error) {
  console.error("Erro ao recarregar variações:", error);
}
```

---

## 📚 Exemplos Práticos

### Exemplo 1: E-commerce de Acessórios para Celular

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    variations: [
      "IPHONE 15",
      "IPHONE 15 PRO",
      "IPHONE 15 PRO MAX",
      "IPHONE 14",
      "IPHONE 14 PRO",
      "SAMSUNG S24",
      "SAMSUNG S24 ULTRA",
      "XIAOMI 14",
      "MOTOROLA EDGE 40",
    ],
    messages: {
      single:
        "📱 Você está comprando um acessório para:{models}Confirme se é o modelo do seu aparelho.",
      multiple:
        "📱 Você está comprando acessórios para:{models}Confirme se os modelos estão corretos.",
      title: "Verificar Compatibilidade",
      confirmButton: "Está correto",
      cancelButton: "Corrigir",
    },
    colors: {
      warningAccent: "#8b5cf6",
    },
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

### Exemplo 2: Loja de Roupas

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    variations: [
      "TAMANHO PP",
      "TAMANHO P",
      "TAMANHO M",
      "TAMANHO G",
      "TAMANHO GG",
      "TAMANHO XG",
    ],
    messages: {
      single: "👕 Você selecionou:{models}Confirma o tamanho?",
      multiple: "👕 Você selecionou tamanhos:{models}Confirma os tamanhos?",
      title: "Confirmar Tamanhos",
      confirmButton: "Confirmar",
      cancelButton: "Revisar",
    },
    formatModelNames: true,
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>
```

### Exemplo 3: Controle Dinâmico via JavaScript

```html
<script src="resources/checkout_variation_validator.js"></script>

<script>
  // Adicionar variações dinamicamente
  document.getElementById("addVariationBtn").addEventListener("click", () => {
    const model = document.getElementById("modelInput").value;
    if (model) {
      window.CheckoutVariationValidator.addVariation(model);
      alert(`Modelo "${model}" adicionado!`);
    }
  });

  // Verificar variações no carrinho
  document.getElementById("checkBtn").addEventListener("click", () => {
    const variations = window.CheckoutVariationValidator.getCurrentVariations();
    if (variations.length > 0) {
      alert("Variações encontradas: " + variations.join(", "));
    } else {
      alert("Nenhuma variação encontrada no carrinho.");
    }
  });

  // Ativar modo debug
  document.getElementById("debugBtn").addEventListener("click", () => {
    window.CheckoutVariationValidator.updateConfig({ debug: true });
    alert("Modo debug ativado! Verifique o console.");
  });
</script>
```

### Exemplo 4: Integração com IA

```html
<script>
  window.CheckoutVariationValidatorConfig = {
    // Ativar detecção automática via IA
    useIA: true,
    iaEndpoint: "https://api.minhaloja.com/ai/detect-variations",
    iaHeaders: {
      "Content-Type": "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    iaTimeout: 15000,

    // Variações de fallback caso IA falhe
    variations: ["MODELO GENÉRICO"],

    messages: {
      single:
        "🤖 Detectamos que você está comprando para:{models}Confirma?",
      multiple:
        "🤖 Detectamos múltiplos modelos:{models}Está correto?",
      title: "Validação Inteligente",
    },

    debug: true,
  };
</script>
<script src="resources/checkout_variation_validator.js"></script>

<!-- Controles para gerenciar IA -->
<button onclick="forceReloadIA()">🔄 Forçar Recarga IA</button>
<button onclick="clearCache()">🗑️ Limpar Cache</button>
<button onclick="showCurrentVariations()">👁️ Ver Variações</button>

<script>
  async function forceReloadIA() {
    try {
      console.log("Recarregando variações da IA...");
      await window.CheckoutVariationValidator.reloadVariationsFromIA(true);
      alert("✅ Variações atualizadas com sucesso!");
    } catch (error) {
      alert("❌ Erro ao atualizar: " + error.message);
    }
  }

  function clearCache() {
    window.CheckoutVariationValidator.clearIACache();
    alert("🗑️ Cache limpo!");
  }

  function showCurrentVariations() {
    const config = window.CheckoutVariationValidator.getConfig();
    console.log("Variações atuais:", config.variations);
    alert("Variações: " + config.variations.join(", "));
  }
</script>
```

**Exemplo de resposta esperada da API:**

```json
{
  "variations": [
    "IPHONE 15 PRO MAX",
    "SAMSUNG GALAXY S24 ULTRA",
    "TAMANHO GG"
  ]
}
```

---

## 🔍 Troubleshooting

### O plugin não está funcionando

**Verificações:**

1. Confirme que está na página correta (o seletor `.pagina-carrinho:not(.carrinho-checkout)` deve existir)
2. Ative o modo debug: `window.CheckoutVariationValidator.updateConfig({ debug: true })`
3. Verifique o console do navegador para logs e erros
4. Confirme que há produtos no carrinho com as variações configuradas

**Teste rápido:**

```javascript
// No console do navegador
console.log(window.CheckoutVariationValidator);
console.log(window.CheckoutVariationValidator.getCurrentVariations());
```

### O modal não aparece

**Possíveis causas:**

1. **Nenhuma variação detectada** - As strings nas variações devem corresponder ao texto dos produtos
2. **Seletor de produtos incorreto** - Verifique se `productSelector` aponta para o elemento correto
3. **Plugin desativado** - Verifique: `window.CheckoutVariationValidator.getConfig().active`

**Solução:**

```javascript
// Verificar se o seletor está correto
const products = document.querySelectorAll(
  ".tabela-carrinho [data-produto-id] .produto-info > a",
);
console.log("Produtos encontrados:", products.length);
products.forEach((p) => console.log("Texto:", p.textContent));

// Testar manualmente
const variations = window.CheckoutVariationValidator.getCurrentVariations();
console.log("Variações detectadas:", variations);
```

### O botão de checkout não é interceptado

**Possível causa:** Seletor do botão incorreto.

**Solução:**

```javascript
// Encontrar o seletor correto do botão
const button = document.querySelector(".botao-finalizar");
console.log("Botão encontrado:", button);

// Atualizar configuração
window.CheckoutVariationValidator.updateConfig({
  buttonSelector: ".seu-seletor-correto",
});
window.CheckoutVariationValidator.reinit();
```

### As variações não são detectadas corretamente

**Possível causa:** Case-sensitive ou formato diferente.

**Solução 1:** Desativar case-sensitive

```javascript
window.CheckoutVariationValidator.updateConfig({
  caseSensitive: false,
});
```

**Solução 2:** Usar Regex

```javascript
window.CheckoutVariationValidator.clearVariations();
window.CheckoutVariationValidator.addVariation(/iphone.*air/i);
```

### Múltiplos modais aparecem

**Causa:** Plugin foi carregado múltiplas vezes.

**Solução:**

```javascript
// Destruir e reinicializar
window.CheckoutVariationValidator.destroy();
// Recarregue a página
```

### A IA não está funcionando

**Verificações:**

1. Confirme que `useIA: true` está configurado
2. Verifique se `iaEndpoint` está correto
3. Ative debug mode e verifique o console
4. Teste o endpoint manualmente para confirmar que está funcionando

**Teste rápido:**

```javascript
// Verificar configuração
const config = window.CheckoutVariationValidator.getConfig();
console.log("useIA:", config.useIA);
console.log("iaEndpoint:", config.iaEndpoint);

// Forçar recarga
await window.CheckoutVariationValidator.reloadVariationsFromIA(true);
```

**Verificar cache:**

```javascript
const cache = sessionStorage.getItem("cvv_ia_cache");
console.log("Cache atual:", JSON.parse(cache));
```

### Erro de CORS na requisição da IA

**Causa:** O servidor da IA não está configurado para aceitar requisições do seu domínio.

**Solução:** Configure CORS no backend da IA:

```javascript
// Node.js + Express
app.use(
  cors({
    origin: "https://sua-loja.com",
  }),
);
```

### Timeout na requisição da IA

**Causa:** A IA está demorando muito para responder.

**Solução:** Aumente o timeout:

```javascript
window.CheckoutVariationValidator.updateConfig({
  iaTimeout: 30000, // 30 segundos
});
```

### Cache não está sendo usado

**Verificação:**

```javascript
// Limpar cache e recarregar
window.CheckoutVariationValidator.clearIACache();
await window.CheckoutVariationValidator.reloadVariationsFromIA(false);

// Verificar se salvou
const cache = sessionStorage.getItem("cvv_ia_cache");
console.log("Cache salvo:", cache !== null);
```

---

## 📝 Notas Importantes

### Compatibilidade

- **Navegadores Modernos**: Chrome, Firefox, Safari, Edge (versões recentes)
- **ES6+**: O plugin usa recursos modernos do JavaScript
- **Mobile**: Totalmente responsivo
- **Fetch API**: Necessário para funcionalidade de IA

### Performance

- O plugin usa event delegation para otimizar performance
- Não há polling ou checagens contínuas
- Cache inteligente reduz chamadas à API de IA
- Mínimo impacto no carregamento da página

### Segurança

- Não coleta dados do usuário
- Não faz requisições externas
- Apenas intercepta eventos localmente

### Boas Práticas

1. **Sempre teste** em ambiente de homologação antes de produção
2. **Use nomes claros** nas variações para facilitar detecção
3. **Personalize as mensagens** para o contexto da sua loja
4. **Ative debug** durante desenvolvimento
5. **Documente** variações customizadas adicionadas

---

## 📞 Suporte e Contribuições

### Logs de Debug

Para ativar logs detalhados:

```javascript
window.CheckoutVariationValidatorConfig = {
  debug: true,
};
```

Ou após o carregamento:

```javascript
window.CheckoutVariationValidator.updateConfig({ debug: true });
```

### Estrutura de Arquivos

```
li_new_resources/
├── resources/
│   └── checkout_variation_validator.js    # Plugin principal
├── docs/
│   └── checkout_variation_validator_documentacao.md  # Esta documentação
└── exemplo_checkout_variation_validator.html    # Exemplo funcional
```

---

## 📊 Changelog

### v1.1.0 (2026-02-26)

- ✨ **NOVO:** Suporte a Inteligência Artificial para detecção automática de variações
- ✅ Integração com endpoints de IA via configuração
- ✅ Cache inteligente no sessionStorage para otimizar chamadas
- ✅ Métodos `clearIACache()` e `reloadVariationsFromIA()` adicionados à API
- ✅ Detecção automática de mudanças nos produtos do carrinho
- ✅ Tratamento robusto de erros (timeout, CORS, etc.)
- ✅ Fallback para variações padrão em caso de falha
- 📚 Documentação expandida com exemplos de integração com IA

### v1.0.0 (2026-02-26)

- ✨ Lançamento inicial
- ✅ Suporte a validação de variações
- ✅ Modal responsivo com lista de variações
- ✅ API pública completa
- ✅ Modo debug
- ✅ Configuração flexível

---

## 📄 Licença

Este plugin foi desenvolvido seguindo o **Guia de Criação de Plugins** do projeto.

---

**Última atualização:** 26 de Fevereiro de 2026  
**Versão:** 1.1.0  
**Versão:** 1.0.0
