/**
 * Sistema de Proteção de Acesso por Senha - Launch Mode
 */

(function() {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.LaunchModeConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        overlayActive: true, // true OU false
        overlayTitle: "🚀 Site em Lançamento - Acesso Restrito",
        overlayText: `� Estamos nos preparativos finais para o lançamento!<br><br>� Para receber acesso antecipado, entre em contato:<br><br><a href="mailto:contato@seusite.com"><strong>� SOLICITAR ACESSO</strong></a><br><br><b>Em breve estaremos online! 🚀</b>`,
        buttonText: "Desbloquear Acesso",
        correctPassword: "PREVIEW2024",
        errorMessage: "Senha incorreta. Tente novamente.",
        placeholder: "Digite a senha de acesso",
        storageKey: "launch_mode_access",
        useLocalStorage: false, // true = persiste entre sessões, false = apenas na sessão atual
        
        // CORES E ESTILOS
        colors: {
            background: "#fef2e2",
            cardBackground: "#ffffff",
            cardBorder: "#e5e7eb",
            titleColor: "#1f2937",
            textColor: "#6b7280",
            linkColor: "#3b82f6",
            buttonBackground: "#3b82f6",
            buttonText: "#ffffff",
            buttonHover: "#2563eb",
            inputBackground: "#f9fafb",
            inputBorder: "#d1d5db",
            inputText: "#1f2937",
            errorColor: "#ef4444"
        }
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);
    
    // Se o cliente definiu uma configuração, mescla com a padrão
    if (window.LaunchModeConfig && typeof window.LaunchModeConfig === 'object') {
        // Mescla configurações principais
        Object.assign(CONFIG, window.LaunchModeConfig);
        
        // Mescla cores separadamente para permitir personalização parcial
        if (window.LaunchModeConfig.colors && typeof window.LaunchModeConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.LaunchModeConfig.colors);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO 
    // ======
    const CSS_STYLES = `
        <style id="access-protection-styles">
            body.access-protection-no-scroll {
                overflow: hidden;
            }

            .access-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${CONFIG.colors.background};
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                animation: fadeIn 0.3s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            }

            .access-overlay.fade-out {
                animation: fadeOut 0.3s ease-out forwards;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }

            .access-modal {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 12px;
                padding: 32px;
                max-width: 90%;
                width: 600px;
                animation: slideUp 0.3s ease-out;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                text-align: center;
            } 
ease-out;
            }

            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .access-modal.shake {
                animation: shake 0.5s ease-in-out;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                20%, 40%, 60%, 80% { transform: translateX(10px); }
            }

            .access-modal h2 {
                font-size: 24px;
                font-weight: bold;
                color: ${CONFIG.colors.titleColor};
                margin-bottom: 16px;
                text-align: center;
                margin-top: 0;
            }

            .access-modal p {
                font-size: 16px;
                color: ${CONFIG.colors.textColor};
                margin-bottom: 24px;
                text-align: center;
                line-height: 1.6;
                margin-top: 0;
            }

            .access-modal p a {
                color: ${CONFIG.colors.linkColor};
                text-decoration: none;
                font-weight: 600;
            }

            .access-modal p a:hover {
                text-decoration: underline;
            }

            .password-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .password-input {
                width: 100%;
                padding: 12px;
                font-size: 16px;
                font-family: inherit;
                color: ${CONFIG.colors.inputText};
                background-color: ${CONFIG.colors.inputBackground};
                border: 2px solid ${CONFIG.colors.inputBorder};
                border-radius: 8px;
                transition: all 0.15s ease;
                outline: none;
                box-sizing: border-box;
            }

            .password-input:focus {
                border-color: ${CONFIG.colors.buttonBackground};
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            }

            .error-message {
                font-size: 14px;
                color: ${CONFIG.colors.errorColor};
                text-align: center;
                margin-top: -8px;
                opacity: 0;
                max-height: 0;
                overflow: hidden;
                transition: all 0.25s ease;
            }

            .error-message.show {
                opacity: 1;
                max-height: 30px;
                margin-top: 0;
            }

            .submit-btn {
                width: 100%;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: 600;
                font-family: inherit;
                color: ${CONFIG.colors.buttonText};
                background: ${CONFIG.colors.buttonBackground};
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.25s ease;
            }

            .submit-btn:hover {
                background: ${CONFIG.colors.buttonHover};
                transform: translateY(-1px);
            }

            .submit-btn:active {
                background: ${CONFIG.colors.buttonHover};
                transform: translateY(0);
            }

            .submit-btn:focus {
                outline: 2px solid ${CONFIG.colors.buttonBackground};
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            }

            @media (max-width: 768px) {
                .access-modal {
                    padding: 24px;
                }

                .access-modal h2 {
                    font-size: 20px;
                }
            }
        </style>
    `;

    // ========================================
    // HTML TEMPLATE
    // ========================================
    const HTML_TEMPLATE = `
        <div id="accessOverlay" class="access-overlay" style="display: none;">
            <div class="access-modal" id="accessModal">
                <h2 id="overlayTitle"></h2>
                <p id="overlayText"></p>
                <form class="password-form" id="passwordForm">
                    <input 
                        type="password" 
                        class="password-input" 
                        id="passwordInput" 
                        placeholder=""
                        autocomplete="off"
                        required
                    >
                    <div class="error-message" id="errorMessage"></div>
                    <button type="submit" class="submit-btn" id="submitBtn"></button>
                </form>
            </div>
        </div>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class AccessProtection {
        constructor() {
            this.authenticationData = this.loadAuthenticationData();
            this.overlay = null;
            this.modal = null;
            this.passwordInput = null;
            this.errorMessageElement = null;
            
            this.init();
        }

        // Inicializa o sistema
        init() {
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
            this.checkAuthentication();
        }

        // Injeta os estilos CSS na página
        injectStyles() {
            if (!document.getElementById('access-protection-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        // Injeta o HTML na página
        injectHTML() {
            // Remove overlay existente se houver
            const existingOverlay = document.getElementById('accessOverlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }

            // Adiciona o HTML ao final do body
   if(CONFIG.overlayActive)         {document.body.insertAdjacentHTML('beforeend', HTML_TEMPLATE);}
        }

        // Configura os elementos DOM
        setupElements() {
            this.overlay = document.getElementById('accessOverlay');
            this.modal = document.getElementById('accessModal');
            this.passwordInput = document.getElementById('passwordInput');
            this.errorMessageElement = document.getElementById('errorMessage');

            // Configura os textos
            document.getElementById('overlayTitle').textContent = CONFIG.overlayTitle;
            document.getElementById('overlayText').innerHTML= CONFIG.overlayText;
            document.getElementById('submitBtn').textContent = CONFIG.buttonText;
            this.passwordInput.placeholder = CONFIG.placeholder;
        }

        // Configura os event listeners
        setupEventListeners() {
            const passwordForm = document.getElementById('passwordForm');
            
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordSubmit();
            });

            // Previne que o overlay seja fechado clicando fora
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }

        // ========================================
        // FUNÇÕES AUXILIARES
        // ========================================

        // Retorna a data atual no formato YYYY-MM-DD
        getCurrentDate() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Carrega dados de autenticação do storage
        loadAuthenticationData() {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                const stored = storage.getItem(CONFIG.storageKey);
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                console.warn('Erro ao carregar dados de autenticação:', e);
                return null;
            }
        }

        // Verifica se o usuário já foi autenticado hoje
        isAuthenticatedToday() {
            const authData = this.loadAuthenticationData();
            if (!authData) return false;
            
            const storedDate = authData.date;
            const currentDate = this.getCurrentDate();
            
            // Verifica se foi autenticado hoje E se a senha foi inserida
            return storedDate === currentDate && authData.authenticated === true;
        }

        // Salva a autenticação com a data atual
        saveAuthentication() {
            const currentDate = this.getCurrentDate();
            const authData = {
                date: currentDate,
                authenticated: true,
                timestamp: new Date().getTime()
            };
            
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                storage.setItem(CONFIG.storageKey, JSON.stringify(authData));
                this.authenticationData = authData;
            } catch (e) {
                console.warn('Erro ao salvar dados de autenticação:', e);
                this.authenticationData = authData;
            }
        }

        // Mostra o overlay de bloqueio
        showOverlay() {
            this.overlay.style.display = 'flex';
            document.body.classList.add('access-protection-no-scroll');
            
            // Pequeno delay para garantir que o elemento está visível antes do foco
            setTimeout(() => {
                this.passwordInput.focus();
            }, 100);
        }

        // Remove o overlay com animação
        hideOverlay() {
            this.overlay.classList.add('fade-out');
            setTimeout(() => {
                this.overlay.style.display = 'none';
                document.body.classList.remove('access-protection-no-scroll');
                this.overlay.classList.remove('fade-out');
            }, 300);
        }

        // Mostra mensagem de erro
        showError() {
            this.errorMessageElement.textContent = CONFIG.errorMessage;
            this.errorMessageElement.classList.add('show');
            this.modal.classList.add('shake');
            
            setTimeout(() => {
                this.modal.classList.remove('shake');
            }, 500);
            
            setTimeout(() => {
                this.errorMessageElement.classList.remove('show');
            }, 3000);
        }

        // Valida a senha inserida
        validatePassword(password) {
            return password === CONFIG.correctPassword;
        }

        // ========================================
        // EVENT HANDLERS
        // ========================================

        // Handler do formulário de senha
        handlePasswordSubmit() {
            const enteredPassword = this.passwordInput.value;
            
            if (this.validatePassword(enteredPassword)) {
                // Senha correta
                this.saveAuthentication();
                this.passwordInput.value = '';
                this.hideOverlay();
            } else {
                // Senha incorreta
                this.showError();
                this.passwordInput.value = '';
                this.passwordInput.focus();
            }
        }

        // Verifica autenticação e mostra overlay se necessário
        checkAuthentication() {
            if (!this.isAuthenticatedToday()) {
                this.showOverlay();
            }
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        // Força a exibição do overlay (útil para testes ou reset)
        forceShowOverlay() {
            this.showOverlay();
        }

        // Remove a autenticação (força nova autenticação)
        clearAuthentication() {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                storage.removeItem(CONFIG.storageKey);
            } catch (e) {
                console.warn('Erro ao limpar dados de autenticação:', e);
            }
            this.authenticationData = null;
            this.checkAuthentication();
        }

        // Atualiza a configuração
        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
            this.setupElements(); // Atualiza os textos
        }

        // Remove completamente o sistema de proteção
        destroy() {
            // Remove overlay
            if (this.overlay) {
                this.overlay.remove();
            }
            
            // Remove estilos
            const styles = document.getElementById('access-protection-styles');
            if (styles) {
                styles.remove();
            }
            
            // Remove classe do body
            document.body.classList.remove('access-protection-no-scroll');
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================

    // Aguarda o DOM estar pronto
    function initLaunchMode() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.LaunchMode = new AccessProtection();
            });
        } else {
            window.LaunchMode = new AccessProtection();
        }
    }

    // Inicializa automaticamente
    initLaunchMode();

})();
