/**
 * Checkout Variation Validator - Valida modelos/variações antes de finalizar compra
 * 
 * Este plugin intercepta o clique no botão de finalizar compra e valida se há produtos
 * com variações específicas (modelos, tamanhos, etc.) configuradas, exibindo um modal
 * de confirmação para o usuário.
 * 
 * NOVO v1.1.0: Suporte a IA para detecção automática de variações
 * 
 * @version 1.1.0
 * @date 2026-02-26
 */

(function() {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.CheckoutVariationValidatorConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        // Ativa/desativa o plugin
        active: true,

        // Seletor da página onde o plugin deve funcionar
        pageSelector: '.pagina-carrinho:not(.carrinho-checkout)',

        // Seletor dos produtos no carrinho (onde buscar o nome/texto)
        productSelector: '.tabela-carrinho [data-produto-id] .produto-info > a',

        // Seletor do botão de finalizar compra
        buttonSelector: '.finalizar-compra .acao-editar .botao.principal.grande',

        // Lista de variações a serem validadas
        // Cada item pode ser uma string (busca case-insensitive) ou regex
        variations: [
            'IPHONE AIR',
            'IPHONE 17 PRO',
            'IPHONE 15',
            'SAMSUNG S24',
            'TAMANHO P',
            'TAMANHO M',
            'TAMANHO G'
        ],

        // Mensagens personalizáveis (suportam HTML)
        messages: {
            // Use {models} como placeholder para os modelos encontrados
            single: 'Você está comprando um item para:{models}<br>Deseja prosseguir?',
            
            // Use {models} como placeholder para a lista de modelos
            multiple: 'Você está comprando itens para:{models}<br>Deseja prosseguir?',
            
            title: 'Confirmar Compra',
            confirmButton: 'Sim, prosseguir',
            cancelButton: 'Cancelar'
        },

        // Configurações de comportamento
        caseSensitive: false,              // Busca case-sensitive ou não
        formatModelNames: true,            // Formata nomes para Title Case no modal
        separator: ' e ',                  // Separador para múltiplos modelos
        useAnd: true,                      // Usar "e" antes do último item em lista (ex: "A, B e C")

        // Configurações de IA
        useIA: false,                      // Usar IA para gerar lista de variações automaticamente
        iaEndpoint: '',                    // URL do endpoint da IA
        iaMethod: 'POST',                  // Método HTTP (POST, GET, etc.)
        iaHeaders: {                       // Headers da requisição
            'Content-Type': 'application/json'
        },
        iaTimeout: 10000,                  // Timeout da requisição em ms
        iaStorageKey: 'cvv_ia_cache',      // Chave do sessionStorage para cache

        // Configurações de estilo
        colors: {
            overlay: 'rgba(0, 0, 0, 0.7)',
            background: '#ffffff',
            text: '#1f2937',
            title: '#111827',
            border: '#e5e7eb',
            confirmButton: '#3b82f6',
            confirmButtonHover: '#2563eb',
            confirmButtonText: '#ffffff',
            cancelButton: '#6b7280',
            cancelButtonHover: '#4b5563',
            cancelButtonText: '#ffffff',
            warningAccent: '#f59e0b'
        },

        // Animação
        animationDuration: 300,

        // Debug mode
        debug: false
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.CheckoutVariationValidatorConfig && typeof window.CheckoutVariationValidatorConfig === 'object') {
        Object.assign(CONFIG, window.CheckoutVariationValidatorConfig);

        // Mescla cores separadamente para permitir personalização parcial
        if (window.CheckoutVariationValidatorConfig.colors && typeof window.CheckoutVariationValidatorConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.CheckoutVariationValidatorConfig.colors);
        }

        // Mescla mensagens separadamente
        if (window.CheckoutVariationValidatorConfig.messages && typeof window.CheckoutVariationValidatorConfig.messages === 'object') {
            CONFIG.messages = Object.assign({}, DEFAULT_CONFIG.messages, window.CheckoutVariationValidatorConfig.messages);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // Estilos CSS
    const CSS_STYLES = `
        <style id="checkout-variation-validator-styles">
            .cvv-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${CONFIG.colors.overlay};
                z-index: 999999;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity ${CONFIG.animationDuration}ms ease;
            }

            .cvv-overlay.cvv-active {
                display: flex;
                opacity: 1;
            }

            .cvv-modal {
                background: ${CONFIG.colors.background};
                border-radius: 12px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                transform: scale(0.9);
                transition: transform ${CONFIG.animationDuration}ms ease;
                overflow: hidden;
            }

            .cvv-overlay.cvv-active .cvv-modal {
                transform: scale(1);
            }

            .cvv-modal-header {
                padding: 24px 24px 16px;
                border-bottom: 2px solid ${CONFIG.colors.warningAccent};
            }

            .cvv-modal-title {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                color: ${CONFIG.colors.title};
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .cvv-modal-icon {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: ${CONFIG.colors.warningAccent};
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 18px;
                flex-shrink: 0;
            }

            .cvv-modal-body {
                padding: 24px;
            }

            .cvv-modal-message {
                font-size: 16px;
                line-height: 1.6;
                color: ${CONFIG.colors.text};
                margin: 0;
            }

            .cvv-models-list {
                list-style: none;
                padding: 0;
                margin: 16px 0;
                background: #f9fafb;
                border-radius: 8px;
                border: 2px solid ${CONFIG.colors.warningAccent};
                max-height:40dvh;
                overflow-y:auto;
            }

            .cvv-models-list li {
                padding: 12px 16px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                color: ${CONFIG.colors.text};
            }

            .cvv-models-list li:last-child {
                border-bottom: none;
            }

            .cvv-models-list li:before {
                content: '•';
                color: ${CONFIG.colors.warningAccent};
                font-size: 24px;
                font-weight: bold;
                line-height: 1;
            }

            .cvv-modal-footer {
                padding: 16px 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .cvv-button {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 200ms ease;
                outline: none;
                font-family: inherit;
            }

            .cvv-button-confirm {
                background: ${CONFIG.colors.confirmButton};
                color: ${CONFIG.colors.confirmButtonText};
            }

            .cvv-button-confirm:hover {
                background: ${CONFIG.colors.confirmButtonHover};
                transform: translateY(-1px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .cvv-button-cancel {
                background: ${CONFIG.colors.cancelButton};
                color: ${CONFIG.colors.cancelButtonText};
            }

            .cvv-button-cancel:hover {
                background: ${CONFIG.colors.cancelButtonHover};
                transform: translateY(-1px);
            }

            .cvv-button:active {
                transform: translateY(0);
            }

            /* Animação de pulso no ícone */
            @keyframes cvv-pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }

            .cvv-modal-icon {
                animation: cvv-pulse 2s ease-in-out infinite;
            }

            /* Responsividade */
            @media (max-width: 600px) {
                .cvv-modal {
                    width: 95%;
                    max-width: none;
                }

                .cvv-modal-header {
                    padding: 20px 20px 12px;
                }

                .cvv-modal-title {
                    font-size: 20px;
                }

                .cvv-modal-body {
                    padding: 20px;
                }

                .cvv-modal-message {
                    font-size: 15px;
                }

                .cvv-modal-footer {
                    padding: 12px 20px 20px;
                    flex-direction: column-reverse;
                }

                .cvv-button {
                    width: 100%;
                    padding: 14px 20px;
                }
            }
        </style>
    `;

    // Template HTML
    const HTML_TEMPLATE = `
        <div id="cvvOverlay" class="cvv-overlay" role="dialog" aria-modal="true" aria-labelledby="cvvModalTitle">
            <div class="cvv-modal">
                <div class="cvv-modal-header">
                    <h2 class="cvv-modal-title" id="cvvModalTitle">
                        <span class="cvv-modal-icon">!</span>
                        <span id="cvvModalTitleText">${CONFIG.messages.title}</span>
                    </h2>
                </div>
                <div class="cvv-modal-body">
                    <p class="cvv-modal-message" id="cvvModalMessage"></p>
                </div>
                <div class="cvv-modal-footer">
                    <button type="button" class="cvv-button cvv-button-cancel" id="cvvButtonCancel">
                        ${CONFIG.messages.cancelButton}
                    </button>
                    <button type="button" class="cvv-button cvv-button-confirm" id="cvvButtonConfirm">
                        ${CONFIG.messages.confirmButton}
                    </button>
                </div>
            </div>
        </div>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class CheckoutVariationValidator {
        constructor() {
            this.overlay = null;
            this.modal = null;
            this.messageElement = null;
            this.confirmButton = null;
            this.cancelButton = null;
            this.checkoutButton = null;
            this.pendingAction = null;
            this.isConfirming = false;
            this.iaLoading = false;
            this.iaLoaded = false;
            
            this.init();
        }

        async init() {
            // Verifica se está na página correta
            if (!this.isValidPage()) {
                this.log('Plugin não ativo nesta página');
                return;
            }

            if (!CONFIG.active) {
                this.log('Plugin desativado via configuração');
                return;
            }

            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
            
            // Carregar variações via IA se habilitado
            if (CONFIG.useIA && CONFIG.iaEndpoint) {
                await this.loadVariationsFromIA();
            }
            
            this.log('Plugin inicializado com sucesso');
        }

        log(message, ...args) {
            if (CONFIG.debug) {
                console.log(`[CheckoutVariationValidator] ${message}`, ...args);
            }
        }

        isValidPage() {
            return document.querySelector(CONFIG.pageSelector) !== null;
        }

        injectStyles() {
            if (!document.getElementById('checkout-variation-validator-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById('cvvOverlay');
            if (existing) {
                existing.remove();
            }
            document.body.insertAdjacentHTML('beforeend', HTML_TEMPLATE);
        }

        setupElements() {
            this.overlay = document.getElementById('cvvOverlay');
            this.modal = this.overlay?.querySelector('.cvv-modal');
            this.messageElement = document.getElementById('cvvModalMessage');
            this.confirmButton = document.getElementById('cvvButtonConfirm');
            this.cancelButton = document.getElementById('cvvButtonCancel');
        }

        setupEventListeners() {
            // Interceptar cliques no botão de finalizar compra
            document.addEventListener('click', (e) => {
                if (this.isConfirming) return;
                const button = e.target.closest(CONFIG.buttonSelector);
                if (button) {
                    this.log('Clique detectado no botão de finalizar compra');
                    this.handleCheckoutClick(e, button);
                }
            }, true); // Use capture phase para interceptar antes

            // Botões do modal
            if (this.confirmButton) {
                this.confirmButton.addEventListener('click', () => this.handleConfirm());
            }

            if (this.cancelButton) {
                this.cancelButton.addEventListener('click', () => this.handleCancel());
            }

            // Fechar ao clicar fora do modal
            if (this.overlay) {
                this.overlay.addEventListener('click', (e) => {
                    if (e.target === this.overlay) {
                        this.handleCancel();
                    }
                });
            }

            // Atalhos de teclado
            document.addEventListener('keydown', (e) => {
                if (!this.overlay || !this.overlay.classList.contains('cvv-active')) {
                    return;
                }

                if (e.key === 'Escape') {
                    this.handleCancel();
                } else if (e.key === 'Enter') {
                    this.handleConfirm();
                }
            });
        }

        handleCheckoutClick(event, button) {
            const foundModels = this.detectVariations();

            if (foundModels.length === 0) {
                this.log('Nenhuma variação detectada, prosseguindo normalmente');
                return; // Deixa o clique prosseguir normalmente
            }

            // Bloqueia o evento
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            this.log('Variações detectadas:', foundModels);
            
            // Armazena a ação pendente
            this.pendingAction = () => {
                // Simula o clique original
                if (button.tagName === 'A') {
                    window.location.href = button.href;
                } else {
                    button.click();
                }
            };

            // Mostra o modal
            this.showModal(foundModels);
        }

        detectVariations() {
            const products = document.querySelectorAll(CONFIG.productSelector);
            const foundModels = new Set();

            this.log(`Verificando ${products.length} produtos`);

            products.forEach(product => {
                const productText = product.textContent || product.innerText || '';
                this.log('Analisando produto:', productText);

                CONFIG.variations.forEach(variation => {
                    if (this.matchesVariation(productText, variation)) {
                        foundModels.add(variation);
                        this.log('Variação encontrada:', variation);
                    }
                });
            });

            return Array.from(foundModels);
        }

        matchesVariation(text, variation) {
            if (variation instanceof RegExp) {
                return variation.test(text);
            }

            const searchText = CONFIG.caseSensitive ? text : text.toLowerCase();
            const searchVariation = CONFIG.caseSensitive ? variation : variation.toLowerCase();
            
            return searchText.includes(searchVariation);
        }

        showModal(models) {
            const formattedModels = this.formatModels(models);
            const message = models.length === 1 
                ? CONFIG.messages.single.replace('{models}', formattedModels)
                : CONFIG.messages.multiple.replace('{models}', formattedModels);

            if (this.messageElement) {
                this.messageElement.innerHTML = message;
            }

            if (this.overlay) {
                this.overlay.classList.add('cvv-active');
                
                // Foco no botão de confirmar para acessibilidade
                setTimeout(() => {
                    if (this.confirmButton) {
                        this.confirmButton.focus();
                    }
                }, CONFIG.animationDuration);
            }

            // Bloqueia scroll do body
            document.body.style.overflow = 'hidden';
        }

        formatModels(models) {
            const formatted = CONFIG.formatModelNames 
                ? models.map(model => model.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()))
                : models;

            // Gera HTML de lista
            const listItems = formatted.map(model => `<li>${model}</li>`).join('');
            return `<ul class="cvv-models-list">${listItems}</ul>`;
        }

        joinModels(models) {
            // Método mantido para compatibilidade, mas não é mais usado
            if (models.length === 1) {
                return models[0];
            }

            if (models.length === 2) {
                return models.join(CONFIG.separator);
            }

            // Para 3 ou mais itens
            if (CONFIG.useAnd) {
                const lastModel = models[models.length - 1];
                const otherModels = models.slice(0, -1);
                return otherModels.join(', ') + CONFIG.separator + lastModel;
            }

            return models.join(', ');
        }

        handleConfirm() {
            this.log('Usuário confirmou, prosseguindo com checkout');
            this.hideModal();

            // Executa a ação pendente após fechar o modal
            setTimeout(() => {
                if (this.pendingAction) {
                    this.isConfirming = true;
                    this.pendingAction();
                    this.pendingAction = null;
                    setTimeout(() => { this.isConfirming = false; }, 200);
                }
            }, CONFIG.animationDuration);
        }

        handleCancel() {
            this.log('Usuário cancelou');
            this.hideModal();
            this.pendingAction = null;
        }

        hideModal() {
            if (this.overlay) {
                this.overlay.classList.remove('cvv-active');
            }

            // Restaura scroll do body
            document.body.style.overflow = '';
        }

        // ========================================
        // MÉTODOS DE IA
        // ========================================

        /**
         * Coleta os nomes dos produtos no carrinho
         * @returns {Array} Array de nomes de produtos
         */
        getProductNames() {
            const products = document.querySelectorAll(CONFIG.productSelector);
            const productNames = [];

            products.forEach(product => {
                const name = (product.textContent || product.innerText || '').trim();
                if (name) {
                    productNames.push(name);
                }
            });

            return productNames;
        }

        /**
         * Gera hash dos nomes de produtos para comparação
         * @param {Array} productNames - Array de nomes
         * @returns {string} Hash simples dos produtos
         */
        hashProductNames(productNames) {
            return productNames.sort().join('|');
        }

        /**
         * Carrega variações do cache ou da IA
         * @returns {Promise<void>}
         */
        async loadVariationsFromIA() {
            if (this.iaLoading || this.iaLoaded) {
                this.log('IA já está carregando ou foi carregada');
                return;
            }

            this.iaLoading = true;
            this.log('Iniciando carregamento de variações via IA');

            try {
                const productNames = this.getProductNames();
                
                if (productNames.length === 0) {
                    this.log('Nenhum produto encontrado no carrinho');
                    this.iaLoading = false;
                    return;
                }

                const currentHash = this.hashProductNames(productNames);
                this.log('Hash dos produtos atuais:', currentHash);

                // Tentar carregar do cache
                const cached = this.loadFromCache();
                
                if (cached && cached.hash === currentHash) {
                    this.log('Usando variações do cache');
                    CONFIG.variations = cached.variations;
                    this.iaLoaded = true;
                    this.iaLoading = false;
                    return;
                }

                // Cache inválido ou não existe, buscar da IA
                this.log('Cache inválido ou inexistente, buscando da IA...');
                const variations = await this.fetchVariationsFromIA(productNames);

                if (variations && Array.isArray(variations) && variations.length > 0) {
                    this.log('Variações recebidas da IA:', variations);
                    CONFIG.variations = variations;
                    
                    // Salvar no cache
                    this.saveToCache(currentHash, variations);
                    this.iaLoaded = true;
                } else {
                    this.log('IA não retornou variações válidas, usando variações padrão');
                }

            } catch (error) {
                this.log('Erro ao carregar variações da IA:', error);
            } finally {
                this.iaLoading = false;
            }
        }

        /**
         * Faz requisição para a IA e retorna as variações
         * @param {Array} productNames - Nomes dos produtos
         * @returns {Promise<Array>} Array de variações
         */
        async fetchVariationsFromIA(productNames) {
            this.log('Fazendo requisição para:', CONFIG.iaEndpoint);
            this.log('Produtos enviados:', productNames);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.iaTimeout);

            try {
                const response = await fetch(CONFIG.iaEndpoint, {
                    method: CONFIG.iaMethod,
                    headers: CONFIG.iaHeaders,
                    body: JSON.stringify({ products: productNames }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.log('Resposta da IA:', data);

                // Aceitar tanto [...] diretamente quanto { variations: [...] }
                if (Array.isArray(data)) {
                    return data;
                } else if (data.variations && Array.isArray(data.variations)) {
                    return data.variations;
                }
                return null;

            } catch (error) {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    this.log('Requisição abortada por timeout');
                } else {
                    this.log('Erro na requisição:', error.message);
                }
                
                throw error;
            }
        }

        /**
         * Salva variações no sessionStorage
         * @param {string} hash - Hash dos produtos
         * @param {Array} variations - Variações a salvar
         */
        saveToCache(hash, variations) {
            try {
                const cacheData = {
                    hash: hash,
                    variations: variations,
                    timestamp: Date.now()
                };
                sessionStorage.setItem(CONFIG.iaStorageKey, JSON.stringify(cacheData));
                this.log('Cache salvo no sessionStorage');
            } catch (error) {
                this.log('Erro ao salvar cache:', error);
            }
        }

        /**
         * Carrega variações do sessionStorage
         * @returns {Object|null} Dados do cache ou null
         */
        loadFromCache() {
            try {
                const cached = sessionStorage.getItem(CONFIG.iaStorageKey);
                if (!cached) {
                    return null;
                }
                
                const data = JSON.parse(cached);
                this.log('Cache encontrado:', data);
                return data;
            } catch (error) {
                this.log('Erro ao carregar cache:', error);
                return null;
            }
        }

        /**
         * Limpa o cache de variações da IA
         */
        clearIACache() {
            try {
                sessionStorage.removeItem(CONFIG.iaStorageKey);
                this.log('Cache da IA limpo');
            } catch (error) {
                this.log('Erro ao limpar cache:', error);
            }
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Atualiza a configuração do plugin
         * @param {Object} newConfig - Novas configurações
         */
        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
            
            if (newConfig.colors) {
                Object.assign(CONFIG.colors, newConfig.colors);
            }
            
            if (newConfig.messages) {
                Object.assign(CONFIG.messages, newConfig.messages);
            }

            this.log('Configuração atualizada', CONFIG);
        }

        /**
         * Adiciona uma nova variação à lista
         * @param {string|RegExp} variation - Variação para adicionar
         */
        addVariation(variation) {
            if (!CONFIG.variations.includes(variation)) {
                CONFIG.variations.push(variation);
                this.log('Variação adicionada:', variation);
            }
        }

        /**
         * Remove uma variação da lista
         * @param {string|RegExp} variation - Variação para remover
         */
        removeVariation(variation) {
            const index = CONFIG.variations.indexOf(variation);
            if (index > -1) {
                CONFIG.variations.splice(index, 1);
                this.log('Variação removida:', variation);
            }
        }

        /**
         * Limpa todas as variações
         */
        clearVariations() {
            CONFIG.variations = [];
            this.log('Todas as variações removidas');
        }

        /**
         * Ativa o plugin
         */
        activate() {
            CONFIG.active = true;
            this.log('Plugin ativado');
        }

        /**
         * Desativa o plugin
         */
        deactivate() {
            CONFIG.active = false;
            this.hideModal();
            this.log('Plugin desativado');
        }

        /**
         * Remove completamente o plugin
         */
        destroy() {
            this.hideModal();

            // Remove elementos do DOM
            if (this.overlay) {
                this.overlay.remove();
            }

            // Remove estilos
            const styles = document.getElementById('checkout-variation-validator-styles');
            if (styles) {
                styles.remove();
            }

            this.log('Plugin destruído');
        }

        /**
         * Reinicializa o plugin
         */
        reinit() {
            this.destroy();
            this.init();
            this.log('Plugin reinicializado');
        }

        /**
         * Retorna as variações atualmente encontradas no carrinho
         * @returns {Array} Array de variações encontradas
         */
        getCurrentVariations() {
            return this.detectVariations();
        }

        /**
         * Retorna a configuração atual
         * @returns {Object} Configuração atual
         */
        getConfig() {
            return { ...CONFIG };
        }

        /**
         * Recarrega variações da IA
         * @param {boolean} forceReload - Forçar recarga ignorando cache
         * @returns {Promise<void>}
         */
        async reloadVariationsFromIA(forceReload = false) {
            if (!CONFIG.useIA || !CONFIG.iaEndpoint) {
                this.log('IA não está habilitada');
                return;
            }

            if (forceReload) {
                this.clearIACache();
                this.iaLoaded = false;
            }

            this.iaLoading = false; // Reset para permitir nova chamada
            await this.loadVariationsFromIA();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initCheckoutVariationValidator() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.CheckoutVariationValidator = new CheckoutVariationValidator();
            });
        } else {
            window.CheckoutVariationValidator = new CheckoutVariationValidator();
        }
    }

    initCheckoutVariationValidator();

})();
