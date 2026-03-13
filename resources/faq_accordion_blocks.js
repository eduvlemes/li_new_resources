/**
 * FAQ Accordion - Seção de perguntas frequentes com accordion animado
 * Exibe perguntas e respostas em layout de duas colunas com toggle suave
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.FaqAccordionConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,

        // Onde inserir a seção na página
        insertSelector: 'body',
        insertMethod: 'beforeend', // 'beforeend' | 'afterbegin' | 'beforebegin' | 'afterend'

        // Coluna esquerda
        title: 'Perguntas frequentes',
        titleDot: true,              // Exibe o ponto colorido ao lado do título
        description: 'Ainda tem dúvidas? Listamos as perguntas mais frequentes que recebemos. Caso tenha mais alguma dúvida, não hesite em entrar em contato conosco.',

        // Comportamento do accordion
        allowMultipleOpen: false,    // true = permite múltiplos itens abertos ao mesmo tempo
        openFirstItem: false,        // true = abre o primeiro item automaticamente
        animationDuration: 320,      // Duração da animação em ms

        // Itens do FAQ
        items: [
            {
                question: 'Vocês fazem marmitas personalizadas de acordo com a Dieta?',
                answer: 'Sim! Trabalhamos com diversas opções de cardápio adaptadas para diferentes dietas. Entre em contato conosco e informe suas restrições alimentares para que possamos montar o plano ideal para você.'
            },
            {
                question: 'Qual forma de Pagamento vocês aceitam?',
                answer: 'Aceitamos cartão de crédito, débito, Pix e boleto bancário. Parcelamos em até 6x sem juros no cartão de crédito.'
            },
            {
                question: 'Entrega de final de semana?',
                answer: 'Sim, realizamos entregas de segunda a sábado. Para domingo, consulte disponibilidade na sua região.'
            },
            {
                question: 'Em quanto tempo entrega?',
                answer: 'O prazo de entrega é de até 2 horas após a confirmação do pedido, dentro da nossa área de cobertura. Pedidos realizados até as 10h chegam no período da tarde.'
            },
            {
                question: 'Vocês trabalham com pronta entrega?',
                answer: 'Trabalhamos tanto com pedidos antecipados (recomendado para garantir seu cardápio preferido) quanto com pronta entrega, sujeita à disponibilidade do dia.'
            },
            {
                question: 'Pode agendar o horário e dia de entrega?',
                answer: 'Sim! Você pode agendar a entrega no horário e dia que preferir. Basta informar no momento do pedido ou entrar em contato com nossa equipe.'
            }
        ],

        // Cores
        colors: {
            sectionBackground: '#ffffff',
            titleColor: '#0c2928',
            dotColor: '#208d58',
            descriptionColor: '#333333',
            itemBorderColor: '#208d58',
            questionColor: '#0c2928',
            answerColor: '#333333',
            buttonBackground: '#208d58',
            buttonIcon: '#ffffff',
            buttonHoverBackground: '#0c2928'
        }
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.FaqAccordionConfig && typeof window.FaqAccordionConfig === 'object') {
        Object.assign(CONFIG, window.FaqAccordionConfig);

        if (window.FaqAccordionConfig.colors && typeof window.FaqAccordionConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.FaqAccordionConfig.colors);
        }

        if (Array.isArray(window.FaqAccordionConfig.items)) {
            CONFIG.items = window.FaqAccordionConfig.items;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    const CSS_STYLES = `
        <style id="faq-accordion-styles">
            .faq-accordion-section {
                background: ${CONFIG.colors.sectionBackground};
                padding: 60px 40px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                box-sizing: border-box;
            }

            .faq-accordion-section *,
            .faq-accordion-section *::before,
            .faq-accordion-section *::after {
                box-sizing: border-box;
            }

            .faq-accordion-inner {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                gap: 60px;
                align-items: flex-start;
            }

            /* Coluna esquerda */
            .faq-accordion-left {
                flex: 0 0 340px;
                max-width: 340px;
            }

            .faq-accordion-title {
                font-size: 2rem;
                font-weight: 700;
                color: ${CONFIG.colors.titleColor};
                line-height: 1.2;
                margin: 0 0 20px 0;
            }

            .faq-accordion-title-dot {
                display: inline-block;
                width: 10px;
                height: 10px;
                background: ${CONFIG.colors.dotColor};
                border-radius: 50%;
                margin-left: 4px;
                vertical-align: middle;
                position: relative;
                top: -3px;
            }

            .faq-accordion-description {
                font-size: 0.95rem;
                color: ${CONFIG.colors.descriptionColor};
                line-height: 1.7;
                margin: 0;
            }

            /* Coluna direita */
            .faq-accordion-right {
                flex: 1;
                min-width: 0;
            }

            /* Itens */
            .faq-accordion-item {
                border: 1.5px solid ${CONFIG.colors.itemBorderColor};
                border-radius: 50px;
                margin-bottom: 12px;
                overflow: hidden;
                transition: border-color 0.25s ease, border-radius 0.32s ease;
            }

            .faq-accordion-item.faq-open {
                border-radius: 20px;
            }

            .faq-accordion-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 5px 5px 5px 15px;
                cursor: pointer;
                gap: 16px;
                background: transparent;
                border: none;
                width: 100%;
                text-align: left;
                -webkit-tap-highlight-color: transparent;
            }

            .faq-accordion-question {
                font-size: 0.95rem;
                font-weight: 500;
                color: ${CONFIG.colors.questionColor};
                line-height: 1.4;
                flex: 1;
            }

            /* Botão + */
            .faq-accordion-btn {
                flex-shrink: 0;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: ${CONFIG.colors.buttonBackground};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.25s ease, transform 0.32s ease;
            }

            .faq-accordion-btn svg {
                display: block;
                transition: transform 0.32s ease;
            }

            .faq-accordion-item.faq-open .faq-accordion-btn {
                background: ${CONFIG.colors.buttonHoverBackground};
            }

            .faq-accordion-item.faq-open .faq-accordion-btn svg {
                transform: rotate(45deg);
            }

            /* Corpo expansível */
            .faq-accordion-body {
                max-height: 0;
                overflow: hidden;
                transition: max-height ${CONFIG.animationDuration}ms ease, padding ${CONFIG.animationDuration}ms ease;
                padding: 0 28px;
            }

            .faq-accordion-item.faq-open .faq-accordion-body {
                padding: 0 28px 20px 28px;
            }

            .faq-accordion-answer {
                font-size: 0.9rem;
                color: ${CONFIG.colors.answerColor};
                line-height: 1.7;
                margin: 0;
            }

            /* Responsivo */
            @media (max-width: 768px) {
                .faq-accordion-section {
                    padding: 40px 20px;
                }

                .faq-accordion-inner {
                    flex-direction: column;
                    gap: 32px;
                }

                .faq-accordion-left {
                    flex: none;
                    max-width: 100%;
                }

                .faq-accordion-title {
                    font-size: 1.7rem;
                }
            }

            @media (max-width: 480px) {
                .faq-accordion-header {
                    padding: 14px 14px 14px 20px;
                }

                .faq-accordion-body,
                .faq-accordion-item.faq-open .faq-accordion-body {
                    padding-left: 20px;
                    padding-right: 20px;
                }
            }
        </style>
    `;

    function buildItemsHTML() {
        return CONFIG.items.map((item, index) => `
            <div class="faq-accordion-item" id="faq-accordion-item-${index}" role="listitem">
                <button
                    class="faq-accordion-header"
                    aria-expanded="false"
                    aria-controls="faq-accordion-body-${index}"
                    id="faq-accordion-header-${index}"
                >
                    <span class="faq-accordion-question">${item.question}</span>
                    <span class="faq-accordion-btn" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="7" y1="1" x2="7" y2="13" stroke="${CONFIG.colors.buttonIcon}" stroke-width="2" stroke-linecap="round"/>
                            <line x1="1" y1="7" x2="13" y2="7" stroke="${CONFIG.colors.buttonIcon}" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </span>
                </button>
                <div
                    class="faq-accordion-body"
                    id="faq-accordion-body-${index}"
                    role="region"
                    aria-labelledby="faq-accordion-header-${index}"
                >
                    <p class="faq-accordion-answer">${item.answer}</p>
                </div>
            </div>
        `).join('');
    }

    function buildHTML() {
        

        const descriptionHTML = CONFIG.description
            ? `<p class="faq-accordion-description">${CONFIG.description}</p>`
            : '';

        return `
            <section id="faq-accordion-section" class="faq-accordion-section" aria-label="Perguntas Frequentes">
                <div class="faq-accordion-inner">
                    <div class="faq-accordion-left">
                        <h2 class="faq-accordion-title">${CONFIG.title}</h2>
                        ${descriptionHTML}
                    </div>
                    <div class="faq-accordion-right" role="list">
                        ${buildItemsHTML()}
                    </div>
                </div>
            </section>
        `;
    }

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class FaqAccordion {
        constructor() {
            this.items = [];
            this.init();
        }

        init() {
            if (!CONFIG.active) return;
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();

            if (CONFIG.openFirstItem && this.items.length > 0) {
                this.open(0);
            }
        }

        injectStyles() {
            if (!document.getElementById('faq-accordion-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById('faq-accordion-section');
            if (existing) existing.remove();

            const target = document.querySelector(CONFIG.insertSelector) || document.body;
            target.insertAdjacentHTML(CONFIG.insertMethod, buildHTML());
        }

        setupElements() {
            this.section = document.getElementById('faq-accordion-section');
            this.items = Array.from(
                this.section.querySelectorAll('.faq-accordion-item')
            );
        }

        setupEventListeners() {
            this.items.forEach((item, index) => {
                const header = item.querySelector('.faq-accordion-header');
                header.addEventListener('click', () => this.toggle(index));

                // Acessibilidade: suporte a teclado
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle(index);
                    }
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = this.items[index + 1];
                        if (next) next.querySelector('.faq-accordion-header').focus();
                    }
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = this.items[index - 1];
                        if (prev) prev.querySelector('.faq-accordion-header').focus();
                    }
                });
            });
        }

        open(index) {
            const item = this.items[index];
            if (!item) return;

            const body = item.querySelector('.faq-accordion-body');
            const header = item.querySelector('.faq-accordion-header');

            item.classList.add('faq-open');
            header.setAttribute('aria-expanded', 'true');

            // Calcula a altura real para animar de 0 → altura
            body.style.maxHeight = body.scrollHeight + 'px';
        }

        close(index) {
            const item = this.items[index];
            if (!item) return;

            const body = item.querySelector('.faq-accordion-body');
            const header = item.querySelector('.faq-accordion-header');

            item.classList.remove('faq-open');
            header.setAttribute('aria-expanded', 'false');
            body.style.maxHeight = '0';
        }

        toggle(index) {
            const item = this.items[index];
            if (!item) return;

            const isOpen = item.classList.contains('faq-open');

            if (!CONFIG.allowMultipleOpen) {
                this.items.forEach((_, i) => {
                    if (i !== index) this.close(i);
                });
            }

            isOpen ? this.close(index) : this.open(index);
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Abre um item pelo índice (0-based)
         * @param {number} index
         */
        openItem(index) {
            this.open(index);
        }

        /**
         * Fecha um item pelo índice (0-based)
         * @param {number} index
         */
        closeItem(index) {
            this.close(index);
        }

        /**
         * Fecha todos os itens
         */
        closeAll() {
            this.items.forEach((_, i) => this.close(i));
        }

        /**
         * Atualiza a configuração e reinicializa
         * @param {Object} newConfig
         */
        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
            this.reinit();
        }

        /**
         * Remove completamente o plugin do DOM
         */
        destroy() {
            if (this.section) this.section.remove();

            const styles = document.getElementById('faq-accordion-styles');
            if (styles) styles.remove();
        }

        /**
         * Reinicializa o plugin
         */
        reinit() {
            this.destroy();
            this.init();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initFaqAccordion() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.FaqAccordion = new FaqAccordion();
            });
        } else {
            window.FaqAccordion = new FaqAccordion();
        }
    }

    initFaqAccordion();

})();
