/**
 * Preço a Partir - Busca e exibe o menor preço disponível de cada produto na listagem
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.PrecoAPartirConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,

        // Seletor dos itens de listagem que contêm o atributo data-id
        itemSelector: '.listagem-item[data-id]',

        // Seletor relativo ao item onde o preço será inserido
        priceSelector: '.preco-a-partir .preco-venda',

        // Prefixo da chave usada no sessionStorage (por produto)
        storagePrefix: 'pa_preco_',

        // false = considera apenas SKUs disponíveis (available: true)
        // true  = considera todos os SKUs, independente de disponibilidade
        includeUnavailable: false,
    };

    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.PrecoAPartirConfig && typeof window.PrecoAPartirConfig === 'object') {
        Object.assign(CONFIG, window.PrecoAPartirConfig);
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class PrecoAPartir {
        constructor() {
            this.lojaId = window.LOJA_ID || '';
            this.init();
        }

        init() {
            var self = this;
            var items = document.querySelectorAll(CONFIG.itemSelector);
            if (!items.length) return;

            items.forEach(function (el) {
                var id = el.getAttribute('data-id');
                if (!id) return;

                self.getMinPrice(id).then(function (minPrice) {
                    if (minPrice === null) return;

                    var priceEl = el.querySelector(CONFIG.priceSelector);
                    if (!priceEl) return;

                    priceEl.textContent = PrecoAPartir.formatPrice(minPrice);
                });
            });
        }

        getMinPrice(productId) {
            var cacheKey = CONFIG.storagePrefix + productId;

            try {
                var cached = sessionStorage.getItem(cacheKey);
                if (cached !== null) {
                    return Promise.resolve(JSON.parse(cached));
                }
            } catch (e) {}

            return this.fetchProduct(productId).then(function (minPrice) {
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify(minPrice));
                } catch (e) {}
                return minPrice;
            });
        }

        fetchProduct(productId) {
            var url = '/_search?an=' + encodeURIComponent(this.lojaId)
                + '&filters=product_ids:' + encodeURIComponent(productId);

            return fetch(url)
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (data) {
                    var product = data && Array.isArray(data.products) && data.products[0];
                    if (!product) return null;
                    return PrecoAPartir.calcMinPrice(product.skus || []);
                })
                .catch(function () { return null; });
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        destroy() {
            // Sem elementos injetados para remover
        }

        // ========================================
        // UTILITÁRIOS ESTÁTICOS
        // ========================================

        static calcMinPrice(skus) {
            var candidates = CONFIG.includeUnavailable
                ? skus
                : skus.filter(function (s) { return s.available; });

            if (!candidates.length) return null;

            return candidates.reduce(function (min, s) {
                return s.price.selling < min ? s.price.selling : min;
            }, candidates[0].price.selling);
        }

        static formatPrice(value) {
            var parts = value.toFixed(2).split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return 'R$ ' + parts[0] + ',' + parts[1];
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initPrecoAPartir() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                if (CONFIG.active) window.PrecoAPartir = new PrecoAPartir();
            });
        } else {
            if (CONFIG.active) window.PrecoAPartir = new PrecoAPartir();
        }
    }

    initPrecoAPartir();
})();
