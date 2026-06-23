/**
 * Store Region Selector v1.0.0
 * Popup de confirmação de loja por região + tarja "Você está em: {Loja}" com troca entre lojas.
 *
 * @date 2026-06-15
 * @version 1.0.0
 */

(function () {
    "use strict";

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.StoreRegionSelectorConfig antes de carregar este script
    // para sobrescrever estas configurações.
    const DEFAULT_CONFIG = {
        active: true, // true OU false
        useLocalStorage: true, // true = persiste entre sessões (recomendado), false = apenas na sessão atual
        storageKey: "store_region_selected",

        // true = sempre exibe o popup no primeiro acesso (mesmo já estando em um domínio
        // de loja conhecido) para o cliente confirmar a loja. Após escolher, não exibe mais.
        confirmOnFirstVisit: false,

        // Mantém a página atual (caminho + parâmetros) ao redirecionar.
        // false = sempre vai para a home da loja escolhida.
        keepPathOnRedirect: true,

        // ----- CONTEÚDO DO POPUP -----
        popupTitle: "Escolha a sua loja",
        popupText: "Selecione a loja da sua região para uma experiência completa:",
        popupImage: "", // URL da imagem exibida no topo do popup (deixe "" para ocultar)
        popupImageAlt: "Selecione sua loja",
        dismissible: false, // true permite fechar o popup sem escolher (não recomendado)

        // ----- TARJA (BANNER) -----
        showBanner: true,
        bannerPrefix: "Você está em:", // resultado: "Você está em: São Paulo SP"
        changeButtonText: "Trocar loja",

        // ----- LOJAS -----
        // name  = nome completo exibido
        // short = sigla/abreviação (ex: SP, RJ) — opcional
        // url   = URL base da loja (domínio). Usada para detecção e redirecionamento.
        stores: [
            { name: "São Paulo", short: "SP", url: "https://sp.minhaloja.com.br" },
            { name: "Rio de Janeiro", short: "RJ", url: "https://rj.minhaloja.com.br" },
        ],

        // ----- CORES E ESTILOS -----
        // As 3 cores abaixo controlam todo o visual (popup + tarja).
        colors: {
            background: "#000000", // cor de fundo de todo o popup (e da tarja)
            text: "#ffffff", // cor do texto
            accent: "#f8c84b", // cor de detalhe (destaques, hover, link de troca)
            overlay: "rgba(0, 0, 0, 0.6)", // fundo escurecido atrás do popup
        },
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.StoreRegionSelectorConfig && typeof window.StoreRegionSelectorConfig === "object") {
        Object.assign(CONFIG, window.StoreRegionSelectorConfig);

        // Mescla cores separadamente para permitir personalização parcial
        if (window.StoreRegionSelectorConfig.colors && typeof window.StoreRegionSelectorConfig.colors === "object") {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.StoreRegionSelectorConfig.colors);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    const CSS_STYLES = `
        <style id="store-region-selector-styles">
            body.store-region-no-scroll {
                overflow: hidden;
            }

            /* ----- OVERLAY / POPUP ----- */
            .store-region-overlay {
                position: fixed;
                inset: 0;
                width: 100%;
                height: 100%;
                background: ${CONFIG.colors.overlay};
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                padding: 16px;
                box-sizing: border-box;
                animation: srsFadeIn 0.3s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            }

            .store-region-overlay.fade-out {
                animation: srsFadeOut 0.3s ease-out forwards;
            }

            @keyframes srsFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes srsFadeOut { from { opacity: 1; } to { opacity: 0; } }

            .store-region-modal {
                position: relative;
                box-sizing: border-box;
                background: ${CONFIG.colors.background};
                color: ${CONFIG.colors.text};
                border: 1px solid ${CONFIG.colors.accent};
                border-radius: 12px;
                padding: 32px;
                max-width: 90%;
                width: 480px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
                text-align: center;
                animation: srsSlideUp 0.3s ease-out;
            }

            @keyframes srsSlideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .store-region-close {
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                font-size: 26px;
                line-height: 1;
                cursor: pointer;
                color: ${CONFIG.colors.text};
                opacity: 0.6;
                padding: 4px;
            }

            .store-region-close:hover { opacity: 1; }

            .store-region-image {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin-bottom: 20px;
                margin-left:auto;
                margin-right:auto;
            }

            .store-region-modal h2 {
                font-size: 22px;
                font-weight: bold;
                color: ${CONFIG.colors.text};
                margin: 0 0 12px 0;
            }

            .store-region-modal p {
                font-size: 15px;
                color: ${CONFIG.colors.text};
                opacity: 0.75;
                line-height: 1.5;
                margin: 0 0 24px 0;
            }

            .store-region-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .store-region-option {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 14px 16px;
                font-size: 16px;
                font-weight: 600;
                font-family: inherit;
                color: ${CONFIG.colors.text};
                background: transparent;
                border: 2px solid ${CONFIG.colors.accent};
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
            }

            .store-region-option:hover {
                background: ${CONFIG.colors.accent};
                color: ${CONFIG.colors.background};
                transform: translateY(-1px);
            }

            .store-region-option.is-current {
                background: ${CONFIG.colors.accent};
                color: ${CONFIG.colors.background};
            }

            .store-region-option .srs-badge {
                font-size: 12px;
                font-weight: 700;
                opacity: 0.7;
            }

            /* ----- TARJA / BANNER (minimalista) ----- */
            .store-region-banner {
                width: 100%;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-wrap: wrap;
                gap: 4px 8px;
                padding: 5px 12px;
                background: ${CONFIG.colors.background};
                color: ${CONFIG.colors.text};
                font-size: 12px;
                line-height: 1.3;
                letter-spacing: 0.2px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                z-index: 99990;
            }

            .store-region-banner__text {
                opacity: 0.85;
            }

            .store-region-banner__text strong {
                font-weight: 600;
            }

            .store-region-banner__change {
                background: none;
                border: none;
                padding: 0;
                margin: 0;
                font-size: 12px;
                font-family: inherit;
                color: ${CONFIG.colors.accent};
                cursor: pointer;
                text-decoration: underline;
                text-underline-offset: 2px;
            }

            .store-region-banner__change:hover {
                opacity: 0.8;
            }

            @media (max-width: 768px) {
                .store-region-modal { padding: 24px; }
                .store-region-modal h2 { font-size: 19px; }
            }
        </style>
    `;

    const HTML_TEMPLATE = `
        <div id="storeRegionOverlay" class="store-region-overlay" style="display: none;">
            <div class="store-region-modal" id="storeRegionModal" role="dialog" aria-modal="true" aria-labelledby="storeRegionTitle">
                <button type="button" class="store-region-close" id="storeRegionClose" aria-label="Fechar" style="display:none;">&times;</button>
                <img id="storeRegionImage" class="store-region-image" alt="" style="display:none;">
                <h2 id="storeRegionTitle"></h2>
                <p id="storeRegionText"></p>
                <div class="store-region-options" id="storeRegionOptions"></div>
            </div>
        </div>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class StoreRegionSelector {
        constructor() {
            this.overlay = null;
            this.modal = null;
            this.banner = null;
            this.init();
        }

        init() {
            if (!CONFIG.active) return;

            if (!Array.isArray(CONFIG.stores) || CONFIG.stores.length === 0) {
                console.warn("[StoreRegionSelector] Nenhuma loja configurada em CONFIG.stores.");
                return;
            }

            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
            this.run();
        }

        injectStyles() {
            if (!document.getElementById("store-region-selector-styles")) {
                document.head.insertAdjacentHTML("beforeend", CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById("storeRegionOverlay");
            if (existing) existing.remove();
            document.body.insertAdjacentHTML("beforeend", HTML_TEMPLATE);
        }

        setupElements() {
            this.overlay = document.getElementById("storeRegionOverlay");
            this.modal = document.getElementById("storeRegionModal");
            this.closeBtn = document.getElementById("storeRegionClose");
            this.imageEl = document.getElementById("storeRegionImage");
            this.optionsEl = document.getElementById("storeRegionOptions");

            document.getElementById("storeRegionTitle").textContent = CONFIG.popupTitle;
            document.getElementById("storeRegionText").textContent = CONFIG.popupText;

            if (CONFIG.popupImage) {
                this.imageEl.src = CONFIG.popupImage;
                this.imageEl.alt = CONFIG.popupImageAlt || "";
                this.imageEl.style.display = "block";
            }

            if (CONFIG.dismissible) {
                this.closeBtn.style.display = "block";
            }

            this.renderOptions();
        }

        // Cria os botões de cada loja dentro do popup
        renderOptions() {
            this.optionsEl.innerHTML = "";
            const current = this.getCurrentStore();

            CONFIG.stores.forEach((store, index) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "store-region-option";
                if (current && current.url === store.url) {
                    btn.classList.add("is-current");
                }

                const label = document.createElement("span");
                label.textContent = store.name;
                btn.appendChild(label);

                if (store.short) {
                    const badge = document.createElement("span");
                    badge.className = "srs-badge";
                    badge.textContent = store.short;
                    btn.appendChild(badge);
                }

                btn.addEventListener("click", () => this.selectStore(index));
                this.optionsEl.appendChild(btn);
            });
        }

        setupEventListeners() {
            // Fechar pelo X (somente se dismissible)
            this.closeBtn.addEventListener("click", () => {
                if (CONFIG.dismissible) this.hideOverlay();
            });

            // Clique fora fecha apenas se dismissible
            this.overlay.addEventListener("click", (e) => {
                if (e.target === this.overlay) {
                    if (CONFIG.dismissible) {
                        this.hideOverlay();
                    } else {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });

            // ESC fecha apenas se dismissible
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && CONFIG.dismissible && this.overlay.style.display === "flex") {
                    this.hideOverlay();
                }
            });
        }

        // ========================================
        // FUNÇÕES AUXILIARES
        // ========================================

        // Normaliza um hostname para comparação (remove "www." e força minúsculas)
        normalizeHost(host) {
            return String(host || "").toLowerCase().replace(/^www\./, "");
        }

        // Extrai o hostname de uma URL de loja com segurança
        getStoreHost(store) {
            try {
                return this.normalizeHost(new URL(store.url).hostname);
            } catch (e) {
                console.warn("[StoreRegionSelector] URL inválida na loja:", store);
                return "";
            }
        }

        // Retorna a loja correspondente ao domínio atual (ou null)
        getCurrentStore() {
            const currentHost = this.normalizeHost(window.location.hostname);
            return CONFIG.stores.find((store) => this.getStoreHost(store) === currentHost) || null;
        }

        loadSavedStore() {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                const data = storage.getItem(CONFIG.storageKey);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.warn("[StoreRegionSelector] Erro ao carregar loja salva:", e);
                return null;
            }
        }

        saveStore(store) {
            const data = {
                name: store.name,
                short: store.short || "",
                url: store.url,
                host: this.getStoreHost(store),
                timestamp: Date.now(),
            };
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                storage.setItem(CONFIG.storageKey, JSON.stringify(data));
            } catch (e) {
                console.warn("[StoreRegionSelector] Erro ao salvar loja:", e);
            }
        }

        // Monta a URL de destino preservando (ou não) o caminho atual
        buildRedirectUrl(store) {
            try {
                const target = new URL(store.url);
                if (CONFIG.keepPathOnRedirect) {
                    target.pathname = window.location.pathname;
                    target.search = window.location.search;
                    target.hash = window.location.hash;
                }
                return target.href;
            } catch (e) {
                return store.url;
            }
        }

        // ========================================
        // FLUXO PRINCIPAL
        // ========================================

        run() {
            const currentStore = this.getCurrentStore();
            const savedStore = this.loadSavedStore();

            // Já escolheu antes: respeita a escolha, sem popup.
            // (currentStore quando em domínio conhecido; savedStore caso contrário.)
            if (savedStore) {
                this.showBanner(currentStore || savedStore);
                if (currentStore) this.saveStore(currentStore);
                return;
            }

            // Sem escolha salva. Se confirmOnFirstVisit, sempre confirma no popup,
            // mesmo já estando em um domínio de loja conhecido.
            if (!currentStore || CONFIG.confirmOnFirstVisit) {
                this.showOverlay();
                return;
            }

            // Domínio conhecido e sem confirmação obrigatória: assume a loja atual.
            this.saveStore(currentStore);
            this.showBanner(currentStore);
        }

        // Seleção de loja a partir do popup ou da troca
        selectStore(index) {
            const store = CONFIG.stores[index];
            if (!store) return;

            this.saveStore(store);

            const currentHost = this.normalizeHost(window.location.hostname);
            const targetHost = this.getStoreHost(store);

            // Já está no domínio correto: nada de redirect, apenas fecha e mostra a tarja.
            if (currentHost === targetHost) {
                this.hideOverlay();
                this.showBanner(store);
                return;
            }

            // Domínio diferente: redireciona.
            window.location.href = this.buildRedirectUrl(store);
        }

        showOverlay() {
            this.overlay.style.display = "flex";
            document.body.classList.add("store-region-no-scroll");
        }

        hideOverlay() {
            this.overlay.classList.add("fade-out");
            setTimeout(() => {
                this.overlay.style.display = "none";
                this.overlay.classList.remove("fade-out");
                document.body.classList.remove("store-region-no-scroll");
            }, 300);
        }

        // ========================================
        // TARJA / BANNER
        // ========================================

        showBanner(store) {
            if (!CONFIG.showBanner || !store) return;

            // Remove tarja anterior, se houver
            this.removeBanner();

            const banner = document.createElement("div");
            banner.id = "storeRegionBanner";
            banner.className = "store-region-banner";

            const text = document.createElement("span");
            text.className = "store-region-banner__text";
            const shortLabel = store.short ? ` ${store.short}` : "";
            text.innerHTML = `${CONFIG.bannerPrefix} <strong>${store.name}${shortLabel}</strong>`;

            const changeBtn = document.createElement("button");
            changeBtn.type = "button";
            changeBtn.className = "store-region-banner__change";
            changeBtn.textContent = CONFIG.changeButtonText;
            changeBtn.addEventListener("click", () => this.showOverlay());

            banner.appendChild(text);
            banner.appendChild(changeBtn);

            // Insere no começo do body
            document.body.insertBefore(banner, document.body.firstChild);
            this.banner = banner;

            // Atualiza marcação da loja atual nas opções do popup
            this.renderOptions();
        }

        removeBanner() {
            const existing = document.getElementById("storeRegionBanner");
            if (existing) existing.remove();
            this.banner = null;
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        // Força a exibição do popup
        open() {
            this.showOverlay();
        }

        // Fecha o popup (respeita a tarja já exibida)
        close() {
            this.hideOverlay();
        }

        // Limpa a loja salva e reexibe o popup
        reset() {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                storage.removeItem(CONFIG.storageKey);
            } catch (e) {
                console.warn("[StoreRegionSelector] Erro ao limpar loja salva:", e);
            }
            this.removeBanner();
            this.showOverlay();
        }

        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
            if (newConfig && newConfig.colors) {
                CONFIG.colors = Object.assign({}, CONFIG.colors, newConfig.colors);
            }
            this.setupElements();
        }

        destroy() {
            if (this.overlay) this.overlay.remove();
            this.removeBanner();
            const styles = document.getElementById("store-region-selector-styles");
            if (styles) styles.remove();
            document.body.classList.remove("store-region-no-scroll");
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initStoreRegionSelector() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                window.StoreRegionSelector = new StoreRegionSelector();
            });
        } else {
            window.StoreRegionSelector = new StoreRegionSelector();
        }
    }

    initStoreRegionSelector();
})();
