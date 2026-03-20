/**
 * Gift Package - Exibe uma seção para adicionar embalagem de presente ao carrinho
 */

 window.GiftPackageConfig = {
    title: "Vai presentear? Dê um upgrade com uma embalagem especial",
    description: "Aviso: A embalagem é enviada à parte para você montar.",
    productName: "Embalagem Dra. Charm",
    productPrice: "R$ 10,00",
    productImageUrl: "https://cdn.awsli.com.br/380x380/1930/1930166/produto/191964467/caixapresente-4fgiyy9loh.jpg", 
    targetSelector: "#formularioCheckout > div > .span4:nth-child(1)",

    colors: {
        cardBackground: "#ffffff",
        cardBorder: "#e5e7eb",
        titleColor: "#1f2937",
        descriptionColor: "#6b7280",
        productNameColor: "#1f2937",
        productPriceColor: "#1f2937",
        addButtonBackground: "#ff7cae",
        addButtonText: "#ffffff",
        addButtonHover: "#ff4c8b",
        qtyBackground: "#1f2937",
        qtyText: "#ffffff",
        qtyCountBackground: "#ffffff",
        qtyCountColor: "#1f2937",
        qtyBorder: "#1f2937",
        inputBorder: "#d1d5db",
        inputFocus: "#131313",
        inputText: "#131313",
        labelColor: "#374151"
    },
   
};

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.GiftPackageConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,
        productId: 191964467,              // ID do produto de embalagem para presente
        cartStorageKey: "carrinho_minicart", // chave do sessionStorage com os dados do carrinho

        // Textos
        title: "Vai presentear? Dê um upgrade com nossa Gift Bag",
        description: "Aviso: A sacola é enviada à parte para você montar.",
        productName: "Gift Bag",
        productPrice: "R$ 9,00",
        productImageUrl: "", // URL da imagem do produto (deixe vazio para usar ícone padrão)
        addButtonText: "Adicionar",
        cardMessageLabel: "Mensagem do cartão presente",
        cardMessagePlaceholder: "Escreva sua mensagem para o cartão...",

        // Callbacks
        // function(plugin) — chamada ao clicar em "+" (ou no botão Adicionar inicial)
        // Use plugin.setQuantity(n) dentro do callback para confirmar a nova quantidade
        onAddClick: null,

        // function(plugin) — chamada ao clicar em "-"
        // Use plugin.setQuantity(n) dentro do callback para confirmar a nova quantidade
        onRemoveClick: null,

        // function(message, plugin) — chamada sempre que a mensagem do cartão é alterada
        onCardMessageChange: null,

        // Seletor CSS do elemento onde o plugin será inserido (null = document.body)
        targetSelector: null,

        // CORES E ESTILOS
        colors: {
            cardBackground: "#ffffff",
            cardBorder: "#e5e7eb",
            titleColor: "#1f2937",
            descriptionColor: "#6b7280",
            productNameColor: "#1f2937",
            productPriceColor: "#1f2937",
            addButtonBackground: "#1f2937",
            addButtonText: "#ffffff",
            addButtonHover: "#374151",
            qtyBackground: "#1f2937",
            qtyText: "#ffffff",
            qtyCountBackground: "#ffffff",
            qtyCountColor: "#1f2937",
            qtyBorder: "#1f2937",
            inputBorder: "#d1d5db",
            inputFocus: "#3b82f6",
            inputText: "#1f2937",
            labelColor: "#374151"
        }
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.GiftPackageConfig && typeof window.GiftPackageConfig === 'object') {
        Object.assign(CONFIG, window.GiftPackageConfig);

        // Mescla cores separadamente para permitir personalização parcial
        if (window.GiftPackageConfig.colors && typeof window.GiftPackageConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.GiftPackageConfig.colors);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    const CSS_STYLES = `
        <style id="gift-package-styles">
            .gift-package-wrapper {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                margin: 16px 0;
            }

            .gift-package-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 12px;
                padding: 16px;
            }

            .gift-package-header {
                margin-bottom: 12px;
            }

            .gift-package-title {
                font-size: 15px;
                font-weight: 600;
                color: ${CONFIG.colors.titleColor};
                margin: 0 0 4px 0;
                line-height: 1.4;
            }

            .gift-package-description {
                font-size: 13px;
                color: ${CONFIG.colors.descriptionColor};
                margin: 0;
                line-height: 1.4;
            }

            .gift-package-product {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .gift-package-image {
                width: 64px;
                height: 64px;
                object-fit: contain;
                border-radius: 8px;
                border: 1px solid ${CONFIG.colors.cardBorder};
                flex-shrink: 0;
                background: #f9fafb;
            }

            .gift-package-image-placeholder {
                width: 64px;
                height: 64px;
                border-radius: 8px;
                border: 1px solid ${CONFIG.colors.cardBorder};
                flex-shrink: 0;
                background: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 26px;
            }

            .gift-package-info {
                flex: 1;
                min-width: 0;
            }

            .gift-package-product-name {
                font-size: 14px;
                font-weight: 600;
                color: ${CONFIG.colors.productNameColor};
                margin: 0 0 2px 0;
            }

            .gift-package-product-price {
                font-size: 14px;
                color: ${CONFIG.colors.productPriceColor};
                margin: 0;
            }

            .gift-package-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
                transition: background-color 0.2s ease, opacity 0.2s ease;
                flex-shrink: 0;
            }

            .gift-package-wrapper.gp-loading .gift-package-btn,
            .gift-package-wrapper.gp-loading .gift-package-qty-btn {
                opacity: 0.45;
                cursor: not-allowed;
                pointer-events: none;
            }

            .gift-package-btn-add {
                background: ${CONFIG.colors.addButtonBackground};
                color: ${CONFIG.colors.addButtonText};
            }

            .gift-package-btn-add:hover {
                background: ${CONFIG.colors.addButtonHover};
            }

            .gift-package-qty-selector {
                display: none;
                align-items: center;
                flex-shrink: 0;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid ${CONFIG.colors.qtyBorder};
            }

            html body.pagina-carrinho.carrinho-checkout #corpo .gift-package-qty-selector.gp-qty-visible {
                display: flex;
                overflow:hidden!important;
            }

            .gift-package-qty-btn {
                width: 38px;
                height: 40px;
                border: none;
                background: ${CONFIG.colors.qtyBackground};
                color: ${CONFIG.colors.qtyText};
                font-size: 20px;
                font-weight: 400;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: background-color 0.2s ease;
                flex-shrink: 0;
            }

            .gift-package-qty-btn:hover {
                background: ${CONFIG.colors.addButtonHover};
            }

            .gift-package-qty-count {
                min-width: 30px;
                text-align: center;
                font-size: 14px;
                font-weight: 700;
                color: ${CONFIG.colors.qtyCountColor};
                background: ${CONFIG.colors.qtyCountBackground};
                padding: 0 6px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                user-select: none;
            }

            .gift-package-message-section {
                margin-top: 14px;
                display: none;
            }

            .gift-package-message-section.gp-visible {
                display: block;
            }

            .gift-package-message-label {
                display: block;
                font-size: 13px;
                font-weight: 500;
                color: ${CONFIG.colors.labelColor};
                margin-bottom: 6px;
            }

            .gift-package-message-input {
                width: 100%;
                box-sizing: border-box;
                padding: 10px 12px;
                border: 1px solid ${CONFIG.colors.inputBorder};
                border-radius: 8px;
                font-size: 13px;
                color: ${CONFIG.colors.inputText};
                resize: vertical;
                min-height: 80px;
                font-family: inherit;
                outline: none;
                transition: border-color 0.2s ease, box-shadow 0.2s ease;
            }

            .gift-package-message-input:focus {
                border-color: ${CONFIG.colors.inputFocus};
                box-shadow: 0 0 0 3px ${CONFIG.colors.inputFocus}33;
            }
        </style>
    `;

    const HTML_TEMPLATE = `
        <div id="gift-package-wrapper" class="gift-package-wrapper">
            <div class="gift-package-card">
                <div class="gift-package-header">
                    <p class="gift-package-title" id="gift-package-title"></p>
                    <p class="gift-package-description" id="gift-package-description"></p>
                </div>
                <div class="gift-package-product">
                    <div id="gift-package-image-slot"></div>
                    <div class="gift-package-info">
                        <p class="gift-package-product-name" id="gift-package-product-name"></p>
                        <p class="gift-package-product-price" id="gift-package-product-price"></p>
                    </div>
                    <button class="gift-package-btn gift-package-btn-add" id="gift-package-btn"></button>
                    <div class="gift-package-qty-selector" id="gift-package-qty-selector">
                        <button class="gift-package-qty-btn" id="gift-package-btn-minus" aria-label="Remover">−</button>
                        <span class="gift-package-qty-count" id="gift-package-qty-count">1</span>
                        <button class="gift-package-qty-btn" id="gift-package-btn-plus" aria-label="Adicionar mais">+</button>
                    </div>
                </div>
                <div class="gift-package-message-section" id="gift-package-message-section">
                    <label class="gift-package-message-label" for="gift-package-message-input" id="gift-package-message-label"></label>
                    <textarea class="gift-package-message-input" id="gift-package-message-input"></textarea>
                </div>
            </div>
        </div>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class GiftPackage {
        constructor() {
            this._quantity = 0;
            this.init();
        }

        init() {
            if (!CONFIG.active) return;
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
            this._syncCartState();
        }

        injectStyles() {
            if (!document.getElementById('gift-package-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById('gift-package-wrapper');
            if (existing) existing.remove();

            const target = CONFIG.targetSelector
                ? document.querySelector(CONFIG.targetSelector)
                : document.body;

            if (!target) {
                console.warn('[GiftPackage] targetSelector não encontrado:', CONFIG.targetSelector);
                return;
            }

            target.insertAdjacentHTML('beforeend', HTML_TEMPLATE);
        }

        setupElements() {
            this.wrapper = document.getElementById('gift-package-wrapper');
            this.btn = document.getElementById('gift-package-btn');
            this.qtySelector = document.getElementById('gift-package-qty-selector');
            this.qtyCount = document.getElementById('gift-package-qty-count');
            this.btnMinus = document.getElementById('gift-package-btn-minus');
            this.btnPlus = document.getElementById('gift-package-btn-plus');
            this.messageSection = document.getElementById('gift-package-message-section');
            this.messageInput = document.getElementById('gift-package-message-input');

            document.getElementById('gift-package-title').textContent = CONFIG.title;
            document.getElementById('gift-package-description').textContent = CONFIG.description;
            document.getElementById('gift-package-product-name').textContent = CONFIG.productName;
            document.getElementById('gift-package-product-price').textContent = CONFIG.productPrice;
            document.getElementById('gift-package-message-label').textContent = CONFIG.cardMessageLabel;
            this.messageInput.placeholder = CONFIG.cardMessagePlaceholder;
            this.btn.textContent = CONFIG.addButtonText;

            const imageSlot = document.getElementById('gift-package-image-slot');
            if (CONFIG.productImageUrl) {
                const img = document.createElement('img');
                img.src = CONFIG.productImageUrl;
                img.alt = CONFIG.productName;
                img.className = 'gift-package-image';
                imageSlot.appendChild(img);
            } else {
                imageSlot.innerHTML = '<div class="gift-package-image-placeholder">🎁</div>';
            }
        }

        setupEventListeners() {
            if (!this.btn) return;

            this.btn.addEventListener('click', (e) => {
                e.preventDefault();
                this._handleAdd();
            });

            if (this.btnPlus) {
                this.btnPlus.addEventListener('click', (e) => {
                    e.preventDefault();
                    this._handleAdd();
                });
            }

            if (this.btnMinus) {
                this.btnMinus.addEventListener('click', (e) => {
                    e.preventDefault();
                    this._handleRemove();
                });
            }

            if (this.messageInput) {
                this.messageInput.addEventListener('input', () => {
                    if (typeof CONFIG.onCardMessageChange === 'function') {
                        CONFIG.onCardMessageChange(this.messageInput.value, this);
                    }
                });
            }
        }

        _setLoading(isLoading) {
            if (!this.wrapper) return;
            if (isLoading) {
                this.wrapper.classList.add('gp-loading');
                if (this.btn) this.btn.disabled = true;
                if (this.btnPlus) this.btnPlus.disabled = true;
                if (this.btnMinus) this.btnMinus.disabled = true;
            } else {
                this.wrapper.classList.remove('gp-loading');
                if (this.btn) this.btn.disabled = false;
                if (this.btnPlus) this.btnPlus.disabled = false;
                if (this.btnMinus) this.btnMinus.disabled = false;
            }
        }

        _refreshCartTotal(reloadSummary) {
            if (typeof $ === 'undefined' || typeof $.getJSON !== 'function') return;
            var self = this;
            $.getJSON('/carrinho/valor/', {}, function(b) {
                if (typeof alteraValorTotal === 'function') {
                    alteraValorTotal(b.total);
                }

                // Quando não há mudança de linha (só atualização de qty/preço)
                if (!reloadSummary) {
                    var itemsDetalhe = b.valor_items_detalhe || [];
                    for (var h = 0; h < itemsDetalhe.length; h++) {
                        var k = itemsDetalhe[h];
                        var f = $('.resumo-compra .tabela-carrinho td[data-produto-id=' + k.id + ']');
                        if (!f.length) continue;

                        if (f.attr('data-produto-quantidade') != String(k.quantity)) {
                            f.attr('data-produto-quantidade', k.quantity);
                            f.siblings('.conteiner-qtd').find('div').html(k.quantity);
                        }

                        var precoCel = f.siblings('.conteiner-preco[data-item-unit-valor]');
                        if (precoCel.length && typeof formatar_decimal_br === 'function') {
                            var l = k.price.sellingPrice;
                            if (parseFloat(precoCel.attr('data-item-unit-valor') || 0) != l) {
                                precoCel.attr('data-item-unit-valor', l);
                                precoCel.find('.preco-produto .preco-promocional').html('R$ ' + formatar_decimal_br(l * k.quantity));
                            }
                        }
                    }
                }
            }).done(function() {
                if (typeof ativarBotaoCompra === 'function') ativarBotaoCompra();
                $('.preco-carrinho-total, .aguardar-valor').removeClass('valor-loading');

                // Item adicionado pela 1ª vez ou removido completamente: recarrega o resumo
                if (reloadSummary) {
                    self._reloadCartSummary();
                    
                }
                $.ajax({
                    url: "/carrinho/minicart"
                }).done(function(F) {
                    F && F.carrinho && (sessionStorage.setItem("carrinho_minicart", JSON.stringify(F.carrinho)),
                    atualizarCarrinhoAsync(F.carrinho))
                })
            });
        }

        _reloadCartSummary() {
            $.get(window.location.href, function(html) {
                var $newSummary = $(html).find('.resumo-compra');
                if ($newSummary.length) {
                    $('.resumo-compra').html($newSummary.html());
                    theme.functions.checkoutProductImage();
                }
            });
        }

        _handleAdd() {
            // Se o cliente definiu um callback, usa o callback (ele é responsável por chamar setQuantity)
            if (typeof CONFIG.onAddClick === 'function') {
                CONFIG.onAddClick(this);
                return;
            }
            // Comportamento padrão: AJAX ao carrinho
            const wasZero = this._quantity === 0;
            const newQty = this._quantity + 1;
            const url = wasZero
                ? '/carrinho/produto/' + CONFIG.productId + '/adicionar/1'
                : '/carrinho/produto/' + CONFIG.productId + '/atualizar/' + newQty;
            this._setLoading(true);
            fetch(url)
                .then(() => {
                    this.setQuantity(newQty);
                    this._refreshCartTotal(wasZero); // recarrega resumo quando é a 1ª adição
                })
                .catch((e) => console.warn('[GiftPackage] Erro ao adicionar ao carrinho:', e))
                .finally(() => this._setLoading(false));
        }

        _handleRemove() {
            // Se o cliente definiu um callback, usa o callback (ele é responsável por chamar setQuantity)
            if (typeof CONFIG.onRemoveClick === 'function') {
                CONFIG.onRemoveClick(this);
                return;
            }
            // Comportamento padrão: AJAX ao carrinho
            const newQty = this._quantity - 1;
            const goingToZero = newQty <= 0;
            const url = goingToZero
                ? '/carrinho/produto/' + CONFIG.productId + '/remover'
                : '/carrinho/produto/' + CONFIG.productId + '/atualizar/' + newQty;
            this._setLoading(true);
            fetch(url)
                .then(() => {
                    this.setQuantity(newQty);
                    this._refreshCartTotal(goingToZero); // recarrega resumo quando remove completamente
                })
                .catch((e) => console.warn('[GiftPackage] Erro ao remover do carrinho:', e))
                .finally(() => this._setLoading(false));
        }

        _syncCartState() {
            try {
                const raw = sessionStorage.getItem(CONFIG.cartStorageKey);
                if (!raw) return;
                const cart = JSON.parse(raw);
                if (!cart || !Array.isArray(cart.items)) return;
                const item = cart.items.find(
                    (i) => i.id === CONFIG.productId || i.parentId === CONFIG.productId
                );
                if (item && item.quantity > 0) {
                    this.setQuantity(item.quantity);
                }
            } catch (e) {
                console.warn('[GiftPackage] Erro ao sincronizar estado do carrinho:', e);
            }
        }

        _updateCartUI() {
            if (!this.btn || !this.qtySelector || !this.messageSection) return;

            if (this._quantity > 0) {
                this.btn.style.display = 'none';
                this.qtySelector.classList.add('gp-qty-visible');
                this.qtyCount.textContent = this._quantity;
                this.messageSection.classList.add('gp-visible');
            } else {
                this.btn.style.display = '';
                this.qtySelector.classList.remove('gp-qty-visible');
                this.messageSection.classList.remove('gp-visible');
                if (this.messageInput) this.messageInput.value = '';
            }
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Define a quantidade do produto no carrinho e atualiza a UI
         * @param {number} qty - Quantidade (0 reverte para o botão Adicionar)
         */
        setQuantity(qty) {
            this._quantity = Math.max(0, parseInt(qty, 10) || 0);
            this._updateCartUI();
        }

        /**
         * Retorna a quantidade atual no carrinho
         * @returns {number}
         */
        getQuantity() {
            return this._quantity;
        }

        /**
         * Retorna true se o produto estiver no carrinho (quantidade > 0)
         * @returns {boolean}
         */
        isInCart() {
            return this._quantity > 0;
        }

        /**
         * Retorna o valor atual da mensagem do cartão presente
         * @returns {string}
         */
        getCardMessage() {
            return this.messageInput ? this.messageInput.value : '';
        }

        /**
         * Define o valor da mensagem do cartão presente
         * @param {string} message
         */
        setCardMessage(message) {
            if (this.messageInput) {
                this.messageInput.value = message;
            }
        }

        /**
         * Remove completamente o plugin do DOM
         */
        destroy() {
            if (this.wrapper) this.wrapper.remove();
            const styles = document.getElementById('gift-package-styles');
            if (styles) styles.remove();
        }

        /**
         * Reinicializa o plugin
         */
        reinit() {
            this.destroy();
            this._quantity = 0;
            this.init();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initGiftPackage() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.GiftPackage = new GiftPackage();
            });
        } else {
            window.GiftPackage = new GiftPackage();
        }
    }

    initGiftPackage();

})();
