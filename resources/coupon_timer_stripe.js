/**
 * Sistema de Barra de Cupom com Timer
 */

(function() {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.CouponBarConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        barActive: true, // true OU false
        title: "Frete grátis com cupom PREBLACK - até domingo!",
        couponCode: "PREBLACK",
        couponText: "",
        timerEndDate: "2025-11-27 23:59:59", // YYYY-MM-DD HH:MM:SS
        buttonCloseText: "✕",
        copiedMessage: "Cupom copiado!",
        
        // CORES E ESTILOS
        colors: {
            background: "#000000",
            text: "#ffffff",
            titleColor: "#fff",
            couponBackground: "#000",
            couponText: "#ff7cae",
            couponBorder: "#ff7cae",
            timerBackground: "#fff",
            timerText: "#000",
            closeButtonBackground: "#000",
            closeButtonText: "#ccc",
            closeButtonHover: "#555555"
        },
        
        // CONFIGURAÇÕES DE COMPORTAMENTO
        autoHide: false, // se true, esconde automaticamente quando o timer acabar
        storageKey: "coupon_bar_hidden",
        useLocalStorage: false, // true = persiste entre sessões, false = apenas na sessão atual
        animationDuration: 0 // duração da animação em ms
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);
    
    // Se o cliente definiu uma configuração, mescla com a padrão
    if (window.CouponBarConfig && typeof window.CouponBarConfig === 'object') {
        // Mescla configurações principais
        Object.assign(CONFIG, window.CouponBarConfig);
        
        // Mescla cores separadamente para permitir personalização parcial
        if (window.CouponBarConfig.colors && typeof window.CouponBarConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.CouponBarConfig.colors);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO 
    // ======
    const CSS_STYLES = `
        <style id="coupon-bar-styles">
            .coupon-bar {
                
                top: 0;
                left: 0;
                width: 100%;
                background: ${CONFIG.colors.background};
                color: ${CONFIG.colors.text};
                z-index: 999999;
                padding: 12px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                
                font-size: 14px;
                line-height: 1.4;
                transition: transform ${CONFIG.animationDuration}ms ease-out;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }

            .coupon-bar.hidden {
                transform: translateY(-100%);
            }

            .coupon-bar-content {
                display: flex;
                align-items: center;
                justify-content:center;
                gap: 20px;
                max-width: 1200px;
                width: 100%;
                padding: 0 20px;
                position: relative;
            }

            .coupon-bar-title {
                color: ${CONFIG.colors.titleColor};
                font-weight: bold;
                font-size: 16px;
                flex-shrink: 0;
            }

            .coupon-section {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }

            .coupon-label {
                color: ${CONFIG.colors.text};
                font-weight: 500;
            }

            .coupon-code {
                background: ${CONFIG.colors.couponBackground};
                color: ${CONFIG.colors.couponText};
                padding: 6px 12px;
                border: 2px dashed ${CONFIG.colors.couponBorder};
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                font-family: monospace;
                transition: all 0.2s ease;
                user-select: none;
            }

            .coupon-code:hover {
                opacity: 0.8;
                transform: scale(1.05);
            }

            .coupon-code:active {
                transform: scale(0.95);
            }

            .timer-section {
                display: flex;
                align-items: center;
                gap: 8px;
                background: ${CONFIG.colors.timerBackground};
                color: ${CONFIG.colors.timerText};
                padding: 6px 12px;
                border-radius: 4px;
                font-weight: bold;
                flex-shrink: 0;
            }

            .timer-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                min-width: 30px;
            }

            .timer-number {
                font-size: 18px;
                font-weight: bold;
                line-height: 1;
            }

            .timer-label {
                font-size: 10px;
                text-transform: uppercase;
                opacity: 0.8;
                line-height: 1;
                margin-top: 2px;
            }

            .timer-separator {
                font-size: 16px;
                font-weight: bold;
                margin: 0 4px;
            }

            .close-button {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: ${CONFIG.colors.closeButtonBackground};
                color: ${CONFIG.colors.closeButtonText};
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s ease;
                
            }

            .close-button:hover {
                background: ${CONFIG.colors.closeButtonHover};
            }

            .copied-notification {
                position: fixed;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                background: #28a745;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: bold;
                z-index: 1000000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }

            .copied-notification.show {
                opacity: 1;
            }

            /* Responsivo */
            @media (max-width: 768px) {
                .coupon-bar {
                    font-size: 12px;
                    padding: 10px 0;
                }

                .coupon-bar-content {
                    flex-wrap:wrap;
                    gap: 10px;
                    padding: 0 15px;
                }
                .coupon-code{
                    padding: 5px 10px;
                }
                .coupon-bar-title {
                    font-size: 12px;
                    text-align: center;
                    width:100%;
                }

                .timer-section {
                    gap: 3px;
                    padding: 4px 2px;
                }

                .timer-number {
                    font-size: 16px;
                }

                .timer-separator {
                    font-size: 14px;
                    margin: 0 2px;
                }

                .close-button {
                    width: 20px;
                    height: 20px;
                    font-size: 10px;
                    right: .5rem;
                }
            }

            @media (max-width: 480px) {
                .coupon-bar-content {
                    gap: 8px;
                }

                .coupon-section {
                    flex-direction: row;
                    gap: 10px;
                }

                .timer-item {
                    min-width: 25px;
                }

                .timer-number {
                    font-size: 14px;
                }

                .timer-label {
                    font-size: 7px;
                }
            }

           
        </style>
    `;

    // ========================================
    // HTML TEMPLATE
    // ========================================
    const HTML_TEMPLATE = `
        <div id="couponBar" class="coupon-bar" style="display: none;">
            <div class="coupon-bar-content">
                <div class="coupon-bar-title" id="couponTitle"></div>
                
                <div class="coupon-section">
                    <span class="coupon-label" id="couponLabel"></span>
                    <div class="coupon-code" id="couponCode" title="Clique para copiar"></div>
                </div>

                <div class="timer-section" id="timerSection">
                    <div class="timer-item">
                        <div class="timer-number" id="days">00</div>
                        <div class="timer-label">DIAS</div>
                    </div>
                    <div class="timer-separator">:</div>
                    <div class="timer-item">
                        <div class="timer-number" id="hours">00</div>
                        <div class="timer-label">HORAS</div>
                    </div>
                    <div class="timer-separator">:</div>
                    <div class="timer-item">
                        <div class="timer-number" id="minutes">00</div>
                        <div class="timer-label">MIN</div>
                    </div>
                    <div class="timer-separator">:</div>
                    <div class="timer-item">
                        <div class="timer-number" id="seconds">00</div>
                        <div class="timer-label">SEG</div>
                    </div>
                </div>

                <button class="close-button" id="closeButton" title="Fechar"></button>
            </div>
        </div>

        <div class="copied-notification" id="copiedNotification"></div>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class CouponBar {
        constructor() {
            this.bar = null;
            this.timerInterval = null;
            this.isHidden = this.loadHiddenState();
            
            this.init();
        }

        // Inicializa o sistema
        init() {
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
            this.startTimer();
            this.checkVisibility();
        }

        // Injeta os estilos CSS na página
        injectStyles() {
            if (!document.getElementById('coupon-bar-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        // Injeta o HTML na página
        injectHTML() {
            // Se o tempo expirou, não injeta a barra
            if (this.isTimeExpired()) {
                return;
            }
            
            // Remove barra existente se houver
            const existingBar = document.getElementById('couponBar');
            if (existingBar) {
                existingBar.remove();
            }

            // Remove notificação existente se houver
            const existingNotification = document.getElementById('copiedNotification');
            if (existingNotification) {
                existingNotification.remove();
            }

            // Adiciona o HTML no início do body
            if (CONFIG.barActive) {
                document.body.insertAdjacentHTML('afterbegin', HTML_TEMPLATE);
            }
        }

        // Configura os elementos DOM
        setupElements() {
            this.bar = document.getElementById('couponBar');
            
            if (!this.bar) return;

            // Configura os textos
            document.getElementById('couponTitle').textContent = CONFIG.title;
            document.getElementById('couponLabel').textContent = CONFIG.couponText;
            document.getElementById('couponCode').textContent = CONFIG.couponCode;
            document.getElementById('closeButton').textContent = CONFIG.buttonCloseText;
            document.getElementById('copiedNotification').textContent = CONFIG.copiedMessage;
        }

        // Configura os event listeners
        setupEventListeners() {
            if (!this.bar) return;

            const couponCode = document.getElementById('couponCode');
            const closeButton = document.getElementById('closeButton');

            // Evento de cópia do cupom
            couponCode.addEventListener('click', () => {
                this.copyCoupon();
            });

            // Evento de fechar barra
            closeButton.addEventListener('click', () => {
                this.hideBars();
            });
        }

        // ========================================
        // FUNÇÕES AUXILIARES
        // ========================================

        // Verifica se o tempo do cupom já expirou
        isTimeExpired() {
            const endDate = new Date(CONFIG.timerEndDate);
            const now = new Date();
            return endDate.getTime() <= now.getTime();
        }

        // Carrega estado de visibilidade do storage
        loadHiddenState() {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                const stored = storage.getItem(CONFIG.storageKey);
                return stored === 'true';
            } catch (e) {
                console.warn('Erro ao carregar estado da barra:', e);
                return false;
            }
        }

        // Salva estado de visibilidade no storage
        saveHiddenState(hidden) {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                storage.setItem(CONFIG.storageKey, hidden.toString());
                this.isHidden = hidden;
            } catch (e) {
                console.warn('Erro ao salvar estado da barra:', e);
                this.isHidden = hidden;
            }
        }

        // Copia o código do cupom
        copyCoupon() {
            try {
                // Tenta usar a API moderna de clipboard
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(CONFIG.couponCode).then(() => {
                        this.showCopiedNotification();
                    });
                } else {
                    // Fallback para navegadores mais antigos
                    const textArea = document.createElement('textarea');
                    textArea.value = CONFIG.couponCode;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    textArea.remove();
                    this.showCopiedNotification();
                }
            } catch (err) {
                console.warn('Erro ao copiar cupom:', err);
                // Ainda mostra a notificação mesmo se houve erro
                this.showCopiedNotification();
            }
        }

        // Mostra notificação de cupom copiado
        showCopiedNotification() {
            const notification = document.getElementById('copiedNotification');
            if (notification) {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 2000);
            }
        }

        // Inicia o timer
        startTimer() {
            this.updateTimer(); // Atualiza imediatamente
            this.timerInterval = setInterval(() => {
                this.updateTimer();
            }, 1000);
        }

        // Atualiza o timer
        updateTimer() {
            const endDate = new Date(CONFIG.timerEndDate);
            const now = new Date();
            const difference = endDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                document.getElementById('days').textContent = days.toString().padStart(2, '0');
                document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
                document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
            } else {
                // Timer expirado
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                
                if (CONFIG.autoHide) {
                    this.hideBars();
                }
                
                this.stopTimer();
            }
        }

        // Para o timer
        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }

        // Mostra a barra
        showBar() {
            if (!this.bar) return;
            
            this.bar.style.display = 'flex';
            document.body.classList.add('coupon-bar-active');
            
            // Remove classe hidden com pequeno delay para animação
            setTimeout(() => {
                this.bar.classList.remove('hidden');
            }, 10);
        }

        // Esconde a barra
        hideBars() {
            if (!this.bar) return;
            
            this.bar.classList.add('hidden');
            this.saveHiddenState(true);
            
            setTimeout(() => {
                this.bar.style.display = 'none';
                document.body.classList.remove('coupon-bar-active');
            }, CONFIG.animationDuration);
        }

        // Verifica visibilidade e mostra/esconde conforme necessário
        checkVisibility() {
            // Se o tempo expirou, não mostra a barra
            if (this.isTimeExpired()) {
                return;
            }
            
            if (!this.isHidden) {
                this.showBar();
            }
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        // Força exibição da barra
        forceShow() {
            this.saveHiddenState(false);
            this.showBar();
        }

        // Força ocultação da barra
        forceHide() {
            this.hideBars();
        }

        // Atualiza configuração
        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
            this.destroy();
            this.init();
        }

        // Remove completamente o sistema
        destroy() {
            // Para o timer
            this.stopTimer();
            
            // Remove barra
            if (this.bar) {
                this.bar.remove();
            }
            
            // Remove notificação
            const notification = document.getElementById('copiedNotification');
            if (notification) {
                notification.remove();
            }
            
            // Remove estilos
            const styles = document.getElementById('coupon-bar-styles');
            if (styles) {
                styles.remove();
            }
            
            // Remove classe do body
            document.body.classList.remove('coupon-bar-active');
        }

        // Getter para verificar se está visível
        get isVisible() {
            return !this.isHidden && this.bar && this.bar.style.display !== 'none';
        }

        // Getter para tempo restante
        get timeRemaining() {
            const endDate = new Date(CONFIG.timerEndDate);
            const now = new Date();
            const difference = endDate.getTime() - now.getTime();
            return Math.max(0, difference);
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================

    // Aguarda o DOM estar pronto
    function initCouponBar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.CouponBar = new CouponBar();
            });
        } else {
            window.CouponBar = new CouponBar();
        }
    }

    // Inicializa automaticamente
    initCouponBar();

})();