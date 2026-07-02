/**
 * Auto Cart Product - Adiciona produtos ao carrinho automaticamente quando um gatilho é atendido.
 *
 * Sem interface. Roda na página de carrinho (.pagina-carrinho): lê os itens do
 * carrinho (via /carrinho/minicart), avalia as regras e, para cada regra cujo
 * gatilho casa, adiciona o produto configurado via
 * /carrinho/produto/{id}/adicionar/{qty} e recarrega a página.
 *
 * Idempotente: se o produto a adicionar já está no carrinho, a regra é ignorada
 * (não re-adiciona nem briga com a quantidade escolhida pelo cliente).
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.AutoCartProductConfig antes de carregar este script.
    //
    // Cada regra em `rules`:
    //   addProductId: id do PRODUTO (ou SKU) a adicionar quando o gatilho casar.
    //   addQty:       quantidade a adicionar (default 1).
    //   priority:     menor número = maior prioridade (só afeta a ordem de aplicação).
    //   logic:        "OU" = basta um gatilho casar (default) | "E" = todos precisam casar.
    //   conditions (todos os gatilhos são opcionais; os definidos viram checagens):
    //     productId:    123               -> esse produto está no carrinho (qtd >= 1)
    //     productIds:   [111, 222]        -> pelo menos UM desses produtos está no carrinho
    //     products:     [{ id, minQty }]  -> cada item vira uma checagem: qtd desse id >= minQty
    //     minItems:     3                 -> soma das quantidades no carrinho >= 3
    //     nameContains: "brinde"          -> algum item tem esse termo no nome (string ou array)
    //     minPrice:     100               -> algum item tem preço unitário >= 100
    //     maxPrice:     50                -> algum item tem preço unitário <= 50
    //   (id/productId casam tanto com o id do PRODUTO quanto do SKU/variação.)
    const DEFAULT_CONFIG = {
        active: true,
        minicartEndpoint: '/carrinho/minicart',

        // Chamado logo antes do reload, após adicionar. onAdd(productId, qty)
        onAdd: null,

        rules: [
            {
                addProductId: 191964467,
                addQty: 1,
                priority: 1,
                logic: 'OU',
                conditions: {
                    productIds: [178961766],
                    minItems: 3,
                    nameContains: 'kit'
                    // minPrice: 100
                }
            }
        ]
    };

    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (typeof window !== 'undefined' && window.AutoCartProductConfig && typeof window.AutoCartProductConfig === 'object') {
        Object.assign(CONFIG, window.AutoCartProductConfig);
        if (Array.isArray(window.AutoCartProductConfig.rules)) {
            CONFIG.rules = window.AutoCartProductConfig.rules;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // Produtos removidos manualmente pelo usuário — não readicionar nesta sessão.
    const REMOVED_KEY = 'auto_cart_product_removed';

    // Quantidade somada de um id (produto ou sku) no carrinho.
    function qtyOf(products, id) {
        const target = String(id);
        return products
            .filter(p => String(p.id) === target || String(p.parentId) === target)
            .reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
    }

    // Total de itens no carrinho (soma das quantidades).
    function totalItems(products) {
        return products.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
    }

    function hasProduct(products, id) {
        return qtyOf(products, id) > 0;
    }

    // Avalia uma regra contra o carrinho. Retorna true se o produto deve ser adicionado.
    function ruleMatches(rule, cart) {
        const cond = (rule && rule.conditions) || {};
        const checks = [];

        if (cond.productId != null) checks.push(hasProduct(cart.products, cond.productId));

        if (Array.isArray(cond.productIds) && cond.productIds.length) {
            checks.push(cond.productIds.some(id => hasProduct(cart.products, id)));
        }

        if (Array.isArray(cond.products)) {
            cond.products.forEach(p => {
                checks.push(qtyOf(cart.products, p.id) >= (Number(p.minQty) || 1));
            });
        }

        if (cond.minItems != null) checks.push(totalItems(cart.products) >= Number(cond.minItems));

        if (cond.nameContains != null) {
            const terms = (Array.isArray(cond.nameContains) ? cond.nameContains : [cond.nameContains])
                .map(t => String(t).toLowerCase());
            checks.push(cart.products.some(p =>
                terms.some(t => String(p.name || '').toLowerCase().includes(t))
            ));
        }

        if (cond.minPrice != null) checks.push(cart.products.some(p => Number(p.price) >= Number(cond.minPrice)));
        if (cond.maxPrice != null) checks.push(cart.products.some(p => Number(p.price) <= Number(cond.maxPrice)));

        if (checks.length === 0) return false; // regra sem gatilhos nunca aplica

        const logic = String(rule.logic || 'OU').toUpperCase();
        return logic === 'E' ? checks.every(Boolean) : checks.some(Boolean);
    }

    // Regras cujo gatilho casa e cujo produto ainda NÃO está no carrinho e não
    // foi removido manualmente. Ordena por priority (menor primeiro) e remove duplicados.
    function rulesToApply(rules, cart, removedSet) {
        const removed = removedSet || new Set();
        const seen = new Set();
        return (rules || [])
            .filter(r => r && r.addProductId != null)
            .map((r, i) => ({ r, i }))
            .sort((a, b) => {
                const pa = a.r.priority != null ? Number(a.r.priority) : Infinity;
                const pb = b.r.priority != null ? Number(b.r.priority) : Infinity;
                return pa !== pb ? pa - pb : a.i - b.i;
            })
            .map(x => x.r)
            .filter(r => {
                const id = String(r.addProductId);
                if (seen.has(id)) return false;              // já vai adicionar essa regra
                if (removed.has(id)) return false;           // removido manualmente pelo usuário
                if (hasProduct(cart.products, id)) return false; // já está no carrinho
                if (!ruleMatches(r, cart)) return false;
                seen.add(id);
                return true;
            });
    }

    // Extrai preço unitário de um item do minicart (número ou objeto de preços).
    function priceOf(item) {
        const p = item && item.price;
        if (p == null) return 0;
        if (typeof p === 'number') return p;
        return Number(p.selling || p.promotional || p.sell || p.base || p.full || 0) || 0;
    }

    class AutoCartProduct {
        constructor() {
            this._busy = false;
            this._observer = null;
            this.init();
        }

        init() {
            if (!CONFIG.active) return;
            if (typeof document === 'undefined') return;
            if (!document.querySelector('.pagina-carrinho')) return; // só na página de carrinho
            this.bindManualRemoval();
            this.evaluate();

            // Reavalia quando o carrinho re-renderiza (mudança de quantidade via AJAX).
            const container = document.querySelector('.pagina-carrinho');
            if (container && 'MutationObserver' in window) {
                this._observer = new MutationObserver(() => this.evaluate());
                this._observer.observe(container, { childList: true, subtree: true });
            }
        }

        removedSet() {
            try {
                return new Set(JSON.parse(sessionStorage.getItem(REMOVED_KEY) || '[]'));
            } catch (e) {
                return new Set();
            }
        }

        // Registra produtos removidos manualmente pelo usuário para não readicioná-los.
        // Detecta pelo próprio link de remoção do carrinho (/carrinho/produto/{id}/remover).
        bindManualRemoval() {
            document.body.addEventListener('click', (e) => {
                const link = e.target.closest && e.target.closest('a[href*="/remover"], [data-remover-produto]');
                if (!link) return;
                const href = link.getAttribute('href') || '';
                const m = href.match(/\/carrinho\/produto\/(\d+)\/remover/);
                const id = m ? m[1] : link.getAttribute('data-remover-produto');
                if (!id) return;
                try {
                    const set = this.removedSet();
                    set.add(String(id));
                    sessionStorage.setItem(REMOVED_KEY, JSON.stringify([...set]));
                } catch (err) { /* storage indisponível */ }
                // deixa o link seguir seu fluxo normal (remoção + re-render)
            });
        }

        // Lê os itens do carrinho do minicart. Retorna Promise<{ products:[{id,parentId,qty,name,price}] }>.
        readCart() {
            return fetch(CONFIG.minicartEndpoint, {
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(r => r.json())
                .then(data => {
                    const items = (data && data.carrinho && Array.isArray(data.carrinho.items)) ? data.carrinho.items : [];
                    return {
                        products: items.map(it => ({
                            id: it.id,
                            parentId: it.parentId,
                            qty: Number(it.quantity) || 0,
                            name: it.name || '',
                            price: priceOf(it)
                        }))
                    };
                })
                .catch(() => ({ products: [] }));
        }

        evaluate() {
            if (this._busy) return;
            this._busy = true;
            this.readCart().then(cart => {
                const toApply = rulesToApply(CONFIG.rules, cart, this.removedSet());
                if (!toApply.length) { this._busy = false; return; }
                Promise.all(toApply.map(r => this.add(r.addProductId, Number(r.addQty) || 1)))
                    .then(() => this.finish())
                    .catch(() => { this._busy = false; });
            });
        }

        add(productId, qty) {
            const url = '/carrinho/produto/' + encodeURIComponent(productId) + '/adicionar/' + encodeURIComponent(qty);
            return fetch(url, {
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(r => r.text())
                .then(() => {
                    if (typeof CONFIG.onAdd === 'function') {
                        try { CONFIG.onAdd(productId, qty); } catch (e) { console.warn('[AutoCartProduct] onAdd:', e); }
                    }
                })
                .catch(err => { console.warn('[AutoCartProduct] falha ao adicionar produto:', err); });
        }

        // Extrai a .tabela-carrinho de um HTML. Retorna o elemento ou null.
        parseTable(html) {
            if (!html) return null;
            try {
                return new DOMParser().parseFromString(html, 'text/html').querySelector('.tabela-carrinho');
            } catch (e) {
                return null;
            }
        }

        // Atualiza o HTML do carrinho sem reload, igual ao auto_coupon: troca só a
        // .tabela-carrinho. O endpoint de adicionar não devolve a tabela, então busca
        // a própria página de carrinho pra extraí-la. No checkout (ou sem tabela), recarrega.
        finish() {
            const current = document.querySelector('.pagina-carrinho:not(.carrinho-checkout) .tabela-carrinho');
            if (!current) {
                setTimeout(() => window.location.reload(), 500);
                return;
            }

            fetch(window.location.href, {
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(r => r.text())
                .then(pageHtml => {
                    const incoming = this.parseTable(pageHtml);
                    if (!incoming) { setTimeout(() => window.location.reload(), 500); return; }
                    current.innerHTML = incoming.innerHTML; // MutationObserver reavalia o novo carrinho
                    this._busy = false;
                })
                .catch(() => setTimeout(() => window.location.reload(), 500));
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        refresh() { this.evaluate(); }

        // Limpa o registro de produtos removidos manualmente.
        resetRemoved() {
            try { sessionStorage.removeItem(REMOVED_KEY); } catch (e) { /* ignore */ }
        }

        destroy() {
            if (this._observer) this._observer.disconnect();
            this._observer = null;
        }
    }

    function initAutoCartProduct() {
        // 2s após a tela carregada (deixa o carrinho renderizar primeiro)
        const start = () => setTimeout(() => { window.AutoCartProduct = new AutoCartProduct(); }, 2000);
        if (document.readyState === 'complete') {
            start();
        } else {
            window.addEventListener('load', start);
        }
    }

    // Browser: inicializa. Node: expõe helpers para o self-check.
    if (typeof window !== 'undefined') {
        initAutoCartProduct();
    } else if (typeof module !== 'undefined') {
        module.exports = { ruleMatches, qtyOf, totalItems, hasProduct, rulesToApply, priceOf };
    }

})();
