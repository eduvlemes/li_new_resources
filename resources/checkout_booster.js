/**
 * Checkout Booster - Sistema de Upsell Inteligente
 */

(function() {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    const DEFAULT_CONFIG = {
        active: true, // true OU false
        title: "🔥 Aproveite e Leve Também!",
        subtitle: "Produtos selecionados especialmente para você",
        buttonText: "Adicionar ao Carrinho",
        loadingText: "Carregando sugestões...",
        noProductsText: "Nenhuma sugestão disponível no momento",
        maxProducts: 4, // Máximo de produtos para mostrar
        
        // API Configuration
        apiBaseUrl: "https://demo-alpix-dev-playground.lojaintegrada.com.br/_search",
        
        // CORES E ESTILOS
        colors: {
            background: "#ffffff",
            border: "#e5e7eb",
            titleColor: "#1f2937",
            subtitleColor: "#6b7280",
            buttonBackground: "#3b82f6",
            buttonText: "#ffffff",
            buttonHover: "#2563eb",
            priceColor: "#059669",
            oldPriceColor: "#9ca3af",
            loadingColor: "#6b7280"
        },
        
        // CONFIGURAÇÕES DE COMPORTAMENTO
        showOnPages: ['.pagina-carrinho'], // Seletores das páginas onde deve aparecer
        productSelector: '[data-produto-id]', // Seletor dos produtos no carrinho
        insertPosition: 'afterend', // Onde inserir o upsell
        autoLoad: true, // Carregar automaticamente
        animationDuration: 300
    };

    // Mescla configuração padrão com configuração do cliente
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);
    
    if (window.CheckoutBoosterConfig && typeof window.CheckoutBoosterConfig === 'object') {
        Object.assign(CONFIG, window.CheckoutBoosterConfig);
        
        if (window.CheckoutBoosterConfig.colors && typeof window.CheckoutBoosterConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.CheckoutBoosterConfig.colors);
        }
    }

    // ======
    // ESTILOS CSS
    // ======
    const CSS_STYLES = `
        <style id="checkout-booster-styles">
            .checkout-booster {
                background: ${CONFIG.colors.background};
                border: 1px solid ${CONFIG.colors.border};
                border-radius: 12px;
                padding: 24px;
                margin: 20px 0;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                animation: slideIn ${CONFIG.animationDuration}ms ease-out;
            }

            .checkout-booster-header {
                text-align: center;
                margin-bottom: 20px;
            }

            .checkout-booster-title {
                color: ${CONFIG.colors.titleColor};
                font-size: 24px;
                font-weight: bold;
                margin: 0 0 8px 0;
            }

            .checkout-booster-subtitle {
                color: ${CONFIG.colors.subtitleColor};
                font-size: 16px;
                margin: 0;
            }

            .checkout-booster-products {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
                margin-top: 20px;
            }

            .checkout-booster-product {
                border: 1px solid ${CONFIG.colors.border};
                border-radius: 8px;
                padding: 16px;
                text-align: center;
                transition: all 0.2s ease;
                background: #fafafa;
            }

            .checkout-booster-product:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .checkout-booster-product-image {
                width: 100%;
                height: 150px;
                object-fit: cover;
                border-radius: 6px;
                margin-bottom: 12px;
            }

            .checkout-booster-product-title {
                color: ${CONFIG.colors.titleColor};
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 8px 0;
                line-height: 1.4;
                height: 40px;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .checkout-booster-product-price {
                margin-bottom: 12px;
            }

            .checkout-booster-price {
                color: ${CONFIG.colors.priceColor};
                font-size: 18px;
                font-weight: bold;
            }

            .checkout-booster-old-price {
                color: ${CONFIG.colors.oldPriceColor};
                font-size: 14px;
                text-decoration: line-through;
                margin-left: 8px;
            }

            .checkout-booster-button {
                background: ${CONFIG.colors.buttonBackground};
                color: ${CONFIG.colors.buttonText};
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                width: 100%;
            }

            .checkout-booster-button:hover {
                background: ${CONFIG.colors.buttonHover};
                transform: translateY(-1px);
            }

            .checkout-booster-loading {
                text-align: center;
                padding: 40px;
                color: ${CONFIG.colors.loadingColor};
                font-size: 16px;
            }

            .checkout-booster-loading::after {
                content: "";
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid ${CONFIG.colors.loadingColor};
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s linear infinite;
                margin-left: 10px;
                vertical-align: middle;
            }

            .checkout-booster-empty {
                text-align: center;
                padding: 40px;
                color: ${CONFIG.colors.subtitleColor};
                font-size: 16px;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .checkout-booster {
                    padding: 16px;
                    margin: 16px 0;
                }

                .checkout-booster-title {
                    font-size: 20px;
                }

                .checkout-booster-subtitle {
                    font-size: 14px;
                }

                .checkout-booster-products {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .checkout-booster-product-image {
                    height: 120px;
                }
            }
        </style>
    `;

    // ======
    // HTML TEMPLATE
    // ======
    const HTML_TEMPLATE = `
        <div id="checkoutBooster" class="checkout-booster" style="display: none;">
            <div class="checkout-booster-header">
                <h3 class="checkout-booster-title" id="boosterTitle"></h3>
                <p class="checkout-booster-subtitle" id="boosterSubtitle"></p>
            </div>
            <div id="boosterContent">
                <div class="checkout-booster-loading" id="boosterLoading"></div>
            </div>
        </div>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class CheckoutBooster {
        constructor() {
            this.container = null;
            this.cartProductIds = [];
            this.recommendedProducts = [];
            
            this.init();
        }

        // Inicializa o sistema
        init() {
            if (!CONFIG.active) return;
            
            // Verifica se está na página certa
            if (!this.isOnTargetPage()) return;
            
            this.injectStyles();
            this.getCartProductIds();
            
            if (this.cartProductIds.length > 0) {
                this.injectHTML();
                this.setupElements();
                
                if (CONFIG.autoLoad) {
                    this.loadRecommendations();
                }
            }
        }

        // Verifica se está na página correta
        isOnTargetPage() {
            return CONFIG.showOnPages.some(selector => document.querySelector(selector));
        }

        // Injeta estilos CSS
        injectStyles() {
            if (!document.getElementById('checkout-booster-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        // Obtém IDs dos produtos no carrinho
        getCartProductIds() {
            const productElements = document.querySelectorAll(CONFIG.productSelector);
            this.cartProductIds = Array.from(productElements).map(el => {
                return el.getAttribute('data-produto-id') || el.dataset.produtoId;
            }).filter(id => id);
            
            console.log('Produtos no carrinho:', this.cartProductIds);
        }

        // Injeta HTML na página
        injectHTML() {
            const targetElement = document.querySelector(CONFIG.showOnPages[0]);
            if (targetElement) {
                targetElement.insertAdjacentHTML(CONFIG.insertPosition, HTML_TEMPLATE);
            }
        }

        // Configura elementos
        setupElements() {
            this.container = document.getElementById('checkoutBooster');
            
            if (!this.container) return;
            
            document.getElementById('boosterTitle').textContent = CONFIG.title;
            document.getElementById('boosterSubtitle').textContent = CONFIG.subtitle;
            document.getElementById('boosterLoading').textContent = CONFIG.loadingText;
            
            this.showContainer();
        }

        // Mostra o container
        showContainer() {
            if (this.container) {
                this.container.style.display = 'block';
            }
        }

        // Carrega recomendações da API
        async loadRecommendations() {
            try {
                // Estratégia 1: Tentar API de busca geral com termos relacionados
                await this.tryGeneralSearch();
                
                // Estratégia 2: Se falhar, buscar produtos individuais
                if (this.recommendedProducts.length === 0) {
                    await this.tryIndividualSearch();
                }
                
                // Estratégia 3: Se ainda falhar, usar produtos populares
                if (this.recommendedProducts.length === 0) {
                    await this.tryPopularProducts();
                }
                
                // Estratégia 4: Fallback com produtos fixos/mockados
                if (this.recommendedProducts.length === 0) {
                    this.useFallbackProducts();
                }
                
                if (this.recommendedProducts.length > 0) {
                    this.renderProducts();
                } else {
                    this.showEmptyState();
                }
                
            } catch (error) {
                console.error('Erro ao carregar recomendações:', error);
                this.showEmptyState();
            }
        }

        // Estratégia 1: Busca geral por categorias/termos
        async tryGeneralSearch() {
            const searchTerms = ['produto', 'oferta', 'promocao', 'desconto'];
            
            for (const term of searchTerms) {
                try {
                    const response = await fetch(`${CONFIG.apiBaseUrl}?q=${term}&limit=${CONFIG.maxProducts}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`Busca por "${term}":`, data);
                        
                        if (data && data.products && data.products.length > 0) {
                            this.recommendedProducts = data.products
                                .filter(p => !this.cartProductIds.includes(p.id.toString()))
                                .slice(0, CONFIG.maxProducts);
                            
                            if (this.recommendedProducts.length > 0) {
                                console.log('✅ Sucesso com busca geral:', term);
                                return;
                            }
                        }
                    }
                } catch (err) {
                    console.warn(`Erro na busca por "${term}":`, err);
                    continue;
                }
            }
        }

        // Estratégia 2: Busca produtos individuais
        async tryIndividualSearch() {
            const promises = this.cartProductIds.slice(0, 3).map(async (id) => {
                try {
                    const response = await fetch(`${CONFIG.apiBaseUrl}?filters=product_ids:${id}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        return data.products || [];
                    }
                } catch (err) {
                    console.warn(`Erro ao buscar produto ${id}:`, err);
                    return [];
                }
                return [];
            });

            const results = await Promise.all(promises);
            const allProducts = results.flat();
            
            // Remove produtos que já estão no carrinho
            this.recommendedProducts = allProducts
                .filter(p => p && !this.cartProductIds.includes(p.id.toString()))
                .slice(0, CONFIG.maxProducts);
                
            if (this.recommendedProducts.length > 0) {
                console.log('✅ Sucesso com busca individual');
            }
        }

        // Estratégia 3: Busca produtos populares/recentes
        async tryPopularProducts() {
            const popularSearches = [
                `${CONFIG.apiBaseUrl}?sort=popularity&limit=${CONFIG.maxProducts}`,
                `${CONFIG.apiBaseUrl}?sort=newest&limit=${CONFIG.maxProducts}`,
                `${CONFIG.apiBaseUrl}?sort=price_asc&limit=${CONFIG.maxProducts}`,
                `${CONFIG.apiBaseUrl}?limit=${CONFIG.maxProducts}`
            ];

            for (const url of popularSearches) {
                try {
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Busca popular:', data);
                        
                        if (data && data.products && data.products.length > 0) {
                            this.recommendedProducts = data.products
                                .filter(p => !this.cartProductIds.includes(p.id.toString()))
                                .slice(0, CONFIG.maxProducts);
                            
                            if (this.recommendedProducts.length > 0) {
                                console.log('✅ Sucesso com produtos populares');
                                return;
                            }
                        }
                    }
                } catch (err) {
                    console.warn('Erro na busca popular:', err);
                    continue;
                }
            }
        }

        // Estratégia 4: Produtos fallback (mock/exemplo)
        useFallbackProducts() {
            console.log('📦 Usando produtos fallback');
            
            this.recommendedProducts = [
                {
                    id: 'fallback_1',
                    name: 'Produto Recomendado 1',
                    price: 49.90,
                    promotional_price: 39.90,
                    image: 'https://via.placeholder.com/200x150/3b82f6/ffffff?text=Produto+1',
                    url: '#'
                },
                {
                    id: 'fallback_2', 
                    name: 'Produto Recomendado 2',
                    price: 79.90,
                    promotional_price: 79.90,
                    image: 'https://via.placeholder.com/200x150/10b981/ffffff?text=Produto+2',
                    url: '#'
                },
                {
                    id: 'fallback_3',
                    name: 'Produto Recomendado 3', 
                    price: 129.90,
                    promotional_price: 99.90,
                    image: 'https://via.placeholder.com/200x150/f59e0b/ffffff?text=Produto+3',
                    url: '#'
                }
            ].slice(0, CONFIG.maxProducts);
        }

        // Renderiza os produtos
        renderProducts() {
            const content = document.getElementById('boosterContent');
            if (!content) return;
            
            const productsHTML = `
                <div class="checkout-booster-products">
                    ${this.recommendedProducts.map(product => this.generateProductHTML(product)).join('')}
                </div>
            `;
            
            content.innerHTML = productsHTML;
            this.setupProductEvents();
        }

        // Gera HTML de um produto
        generateProductHTML(product) {
            const imageUrl = product.image || product.images?.[0]?.url || 'https://via.placeholder.com/200x150?text=Produto';
            const title = product.name || product.title || 'Produto';
            const price = this.formatPrice(product.price || product.promotional_price || 0);
            const oldPrice = product.price !== product.promotional_price ? this.formatPrice(product.price) : '';
            
            return `
                <div class="checkout-booster-product" data-product-id="${product.id}">
                    <img src="${imageUrl}" alt="${title}" class="checkout-booster-product-image" 
                         onerror="this.src='https://via.placeholder.com/200x150?text=Produto'">
                    <h4 class="checkout-booster-product-title">${title}</h4>
                    <div class="checkout-booster-product-price">
                        <span class="checkout-booster-price">${price}</span>
                        ${oldPrice ? `<span class="checkout-booster-old-price">${oldPrice}</span>` : ''}
                    </div>
                    <button class="checkout-booster-button" data-action="add-to-cart" data-product-id="${product.id}">
                        ${CONFIG.buttonText}
                    </button>
                </div>
            `;
        }

        // Configura eventos dos produtos
        setupProductEvents() {
            const buttons = document.querySelectorAll('.checkout-booster-button[data-action="add-to-cart"]');
            
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const productId = button.getAttribute('data-product-id');
                    this.addToCart(productId, button);
                });
            });
        }

        // Adiciona produto ao carrinho
        addToCart(productId, button) {
            const originalText = button.textContent;
            button.textContent = 'Adicionando...';
            button.disabled = true;
            
            // Verifica se é produto fallback
            if (productId.startsWith('fallback_')) {
                button.textContent = '🔗 Ver Produto';
                button.style.background = '#6b7280';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                    button.style.background = '';
                }, 2000);
                
                alert('Este é um produto de exemplo. Em produção, seria adicionado ao carrinho.');
                return;
            }
            
            // Lógica real para Loja Integrada
            // Opção 1: Usar formulário existente
            this.addViaForm(productId, button, originalText);
            
            // Opção 2: Usar AJAX (descomente se preferir)
            // this.addViaAjax(productId, button, originalText);
        }

        // Método 1: Adicionar via formulário (mais compatível)
        addViaForm(productId, button, originalText) {
            try {
                // Procura formulário de adicionar produto na página
                let form = document.querySelector(`form[action*="carrinho"][action*="${productId}"]`);
                
                // Se não encontrar, cria um formulário temporário
                if (!form) {
                    form = document.createElement('form');
                    form.method = 'POST';
                    form.action = `/carrinho/adicionar/${productId}`;
                    form.style.display = 'none';
                    
                    // Adiciona campos necessários
                    const quantityInput = document.createElement('input');
                    quantityInput.type = 'hidden';
                    quantityInput.name = 'quantidade';
                    quantityInput.value = '1';
                    
                    form.appendChild(quantityInput);
                    document.body.appendChild(form);
                }
                
                // Submete o formulário
                form.submit();
                
            } catch (error) {
                console.error('Erro ao adicionar via formulário:', error);
                this.showAddError(button, originalText);
            }
        }

        // Método 2: Adicionar via AJAX (alternativa)
        addViaAjax(productId, button, originalText) {
            const formData = new FormData();
            formData.append('produto_id', productId);
            formData.append('quantidade', '1');
            
            fetch('/carrinho/adicionar', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (response.ok) {
                    button.textContent = '✓ Adicionado';
                    button.style.background = '#10b981';
                    
                    // Atualiza contador do carrinho se existir
                    this.updateCartCounter();
                    
                    setTimeout(() => {
                        // Opcional: recarregar página ou atualizar carrinho
                        location.reload();
                    }, 1500);
                } else {
                    throw new Error('Erro na resposta do servidor');
                }
            })
            .catch(error => {
                console.error('Erro AJAX:', error);
                this.showAddError(button, originalText);
            });
        }

        // Mostra erro ao adicionar
        showAddError(button, originalText) {
            button.textContent = '❌ Erro';
            button.style.background = '#ef4444';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                button.style.background = '';
            }, 3000);
        }

        // Atualiza contador do carrinho
        updateCartCounter() {
            const counters = document.querySelectorAll('.carrinho-contador, .cart-count, #cart-count');
            counters.forEach(counter => {
                const current = parseInt(counter.textContent) || 0;
                counter.textContent = current + 1;
            });
        }

        // Mostra estado vazio
        showEmptyState() {
            const content = document.getElementById('boosterContent');
            if (content) {
                content.innerHTML = `<div class="checkout-booster-empty">${CONFIG.noProductsText}</div>`;
            }
        }

        // Formata preço
        formatPrice(price) {
            const numPrice = parseFloat(price) || 0;
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(numPrice);
        }

        // Remove o sistema
        destroy() {
            if (this.container) {
                this.container.remove();
            }
            
            const styles = document.getElementById('checkout-booster-styles');
            if (styles) {
                styles.remove();
            }
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initCheckoutBooster() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.CheckoutBooster = new CheckoutBooster();
            });
        } else {
            window.CheckoutBooster = new CheckoutBooster();
        }
    }

    // Inicializa automaticamente
    initCheckoutBooster();

})();