/**
 * Auto Coupon - Aplica cupons automaticamente quando o carrinho atende às regras.
 *
 * Sem interface. Roda apenas na página de carrinho (.pagina-carrinho), lê os
 * produtos/subtotal do DOM, avalia as regras e aplica (ou remove) o cupom via
 * /carrinho/cupom/validar | /carrinho/cupom/remover, recarregando a página.
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.AutoCouponConfig antes de carregar este script.
    //
    // Cada regra em `coupons`:
    //   coupon:   código a aplicar (string)
    //   priority: menor número = maior prioridade. Entre as regras que casam,
    //             a de menor priority vence (empate: ordem na lista).
    //   logic:    "E"  = todas as condições definidas precisam passar (AND)
    //             "OU" = basta uma condição passar (OR)
    //   conditions:
    //     products: [{ id: 178961766, minQty: 1 }] -> produto no carrinho com qtd >= minQty
    //                                                  (id = data-produto-id, o id do PRODUTO)
    //     minTotal: 100                             -> subtotal do carrinho >= 100
    //     maxTotal: 500                             -> subtotal do carrinho <= 500
    // Condições omitidas são ignoradas.
    const DEFAULT_CONFIG = {
        active: true,
        applyEndpoint: '/carrinho/cupom/validar',
        removeEndpoint: '/carrinho/cupom/remover',

        // Chamados logo antes do reload, após o retorno do servidor.
        onApply: null,   // onApply(code)
        onRemove: null,  // onRemove(code)

        coupons: [
            {
                coupon: 'EXEMPLO10',
                priority: 1,
                logic: 'E',
                conditions: {
                    products: [{ id: 178961766, minQty: 1 }],
                    minTotal: 100
                    // maxTotal: 500
                }
            }
        ]
    };

    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (typeof window !== 'undefined' && window.AutoCouponConfig && typeof window.AutoCouponConfig === 'object') {
        Object.assign(CONFIG, window.AutoCouponConfig);
        if (Array.isArray(window.AutoCouponConfig.coupons)) {
            CONFIG.coupons = window.AutoCouponConfig.coupons;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // Cupons removidos manualmente pelo usuário — não reaplicar nesta sessão.
    const REMOVED_KEY = 'auto_coupon_removed';

    // Quantidade somada de um id de PRODUTO no carrinho (lista [{id, qty}]).
    function qtyOf(products, id) {
        const target = String(id);
        return products
            .filter(p => String(p.id) === target)
            .reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
    }

    // Avalia uma regra contra o carrinho. Retorna true se o cupom deve ser aplicado.
    function ruleMatches(rule, cart) {
        const cond = (rule && rule.conditions) || {};
        const checks = [];

        if (Array.isArray(cond.products)) {
            cond.products.forEach(p => {
                checks.push(qtyOf(cart.products, p.id) >= (Number(p.minQty) || 1));
            });
        }
        if (cond.minTotal != null) checks.push(cart.subtotal >= Number(cond.minTotal));
        if (cond.maxTotal != null) checks.push(cart.subtotal <= Number(cond.maxTotal));

        if (checks.length === 0) return false; // regra sem condições nunca aplica

        const logic = String(rule.logic || 'E').toUpperCase();
        return logic === 'OU' ? checks.some(Boolean) : checks.every(Boolean);
    }

    // Melhor regra aplicável: casa com o carrinho, não foi removida manualmente,
    // menor `priority` vence (empate = ordem da lista). Retorna a regra ou null.
    function pickRule(coupons, cart, removedSet) {
        return (coupons || [])
            .map((r, i) => ({ r, i }))
            .filter(x => x.r && x.r.coupon && !removedSet.has(x.r.coupon) && ruleMatches(x.r, cart))
            .sort((a, b) => {
                const pa = a.r.priority != null ? Number(a.r.priority) : Infinity;
                const pb = b.r.priority != null ? Number(b.r.priority) : Infinity;
                return pa !== pb ? pa - pb : a.i - b.i;
            })
            .map(x => x.r)[0] || null;
    }

    // Lê o carrinho do DOM da página de carrinho/checkout.
    // Retorna { products:[{id, qty}], subtotal, appliedCoupon } ou null se não for página de carrinho.
    function readCartFromDOM() {
        if (!document.querySelector('.pagina-carrinho')) return null;

        const products = [];
        document.querySelectorAll('[data-produto-id]').forEach(el => {
            products.push({
                id: el.getAttribute('data-produto-id'),
                qty: parseInt(el.getAttribute('data-produto-quantidade'), 10) || 1
            });
        });

        let subtotal = 0;
        const isCheckout = !!document.querySelector('.carrinho-checkout');
        if (isCheckout) {
            const el = document.querySelector('[data-subtotal]');
            // formato "1.234,56"
            if (el) subtotal = parseFloat(String(el.getAttribute('data-subtotal')).replace(/\./g, '').replace(',', '.')) || 0;
        } else {
            const el = document.querySelector('[data-subtotal-valor]');
            if (el) subtotal = parseFloat(el.getAttribute('data-subtotal-valor')) || 0;
        }

        const couponEl = document.querySelector('.cupom-codigo');
        const appliedCoupon = couponEl ? couponEl.textContent.trim() : '';

        return { products, subtotal, appliedCoupon };
    }

    class AutoCoupon {
        constructor() {
            this._busy = false;
            this._observer = null;
            this.init();
        }

        init() {
            if (!CONFIG.active) return;
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

        // Registra cupons removidos manualmente pelo usuário para não reaplicá-los.
        bindManualRemoval() {
            document.body.addEventListener('click', (e) => {
                const link = e.target.closest && e.target.closest('.remover-cupom');
                if (!link) return;
                const wrap = link.closest('.cupom-sucesso') || document;
                const codeEl = wrap.querySelector('.cupom-codigo');
                const code = codeEl ? codeEl.textContent.trim() : '';
                if (code) {
                    try {
                        const set = this.removedSet();
                        set.add(code);
                        sessionStorage.setItem(REMOVED_KEY, JSON.stringify([...set]));
                    } catch (err) { /* storage indisponível */ }
                }
                // deixa o link seguir seu fluxo normal (remoção + navegação)
            });
        }

        evaluate() {
            if (this._busy) return;
            const cart = readCartFromDOM();
            if (!cart) return;

            const removed = this.removedSet();
            const managed = new Set(CONFIG.coupons.map(r => r && r.coupon).filter(Boolean));
            const winner = pickRule(CONFIG.coupons, cart, removed);
            const applied = cart.appliedCoupon;

            // 1) Cupom gerenciado aplicado que não deveria mais estar (regra deixou de casar,
            //    foi removido manualmente, ou existe um vencedor diferente) -> remove.
            if (applied && managed.has(applied)) {
                const stillWinner = winner && winner.coupon === applied;
                if (!stillWinner || removed.has(applied)) {
                    this.remove(applied);
                    return;
                }
            }

            // 2) Aplica o vencedor, se houver e for diferente do já aplicado.
            if (winner && winner.coupon !== applied) {
                this.apply(winner.coupon);
            }
        }

        apply(code) {
            this._busy = true;
            const body = new FormData();
            body.append('cupom', code);
            fetch(CONFIG.applyEndpoint, {
                method: 'POST',
                body: body,
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(response => response.text()) // aguarda o retorno completo do servidor
                .then(() => {
                    if (typeof CONFIG.onApply === 'function') {
                        try { CONFIG.onApply(code); } catch (e) { console.warn('[AutoCoupon] onApply:', e); }
                    }
                    window.location.reload();
                })
                .catch(err => {
                    console.warn('[AutoCoupon] falha ao aplicar cupom:', err);
                    this._busy = false;
                });
        }

        remove(code) {
            this._busy = true;
            fetch(CONFIG.removeEndpoint + '?cupom=' + encodeURIComponent(code), {
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(response => response.text()) // aguarda o retorno completo do servidor
                .then(() => {
                    if (typeof CONFIG.onRemove === 'function') {
                        try { CONFIG.onRemove(code); } catch (e) { console.warn('[AutoCoupon] onRemove:', e); }
                    }
                    window.location.reload();
                })
                .catch(err => {
                    console.warn('[AutoCoupon] falha ao remover cupom:', err);
                    this._busy = false;
                });
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        refresh() { this.evaluate(); }

        // Limpa o registro de cupons removidos manualmente.
        resetRemoved() {
            try { sessionStorage.removeItem(REMOVED_KEY); } catch (e) { /* ignore */ }
        }

        destroy() {
            if (this._observer) this._observer.disconnect();
            this._observer = null;
        }
    }

    function initAutoCoupon() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.AutoCoupon = new AutoCoupon();
            });
        } else {
            window.AutoCoupon = new AutoCoupon();
        }
    }

    // Browser: inicializa. Node: expõe helpers para o self-check.
    if (typeof window !== 'undefined') {
        initAutoCoupon();
    } else if (typeof module !== 'undefined') {
        module.exports = { ruleMatches, qtyOf, pickRule };
    }

})();
