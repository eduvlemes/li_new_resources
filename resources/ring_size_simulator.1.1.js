/**
 * Ring Size Simulator - Simulador de tamanho de anel com calibragem por cartao.
 */

(function () {
    'use strict';

    // ======
    // CONFIGURACAO PADRAO
    // ======
    // O cliente pode definir window.RingSizeSimulatorConfig antes de carregar este script
    // para sobrescrever estas configuracoes.
    const DEFAULT_CONFIG = {
        active: true,
        buttonText: 'Guia de Medidas',

        // Onde o botao sera inserido.
        // Ex.: '.principal .acoes-produto'
        buttonMountSelector: '',
        // append | prepend | before | after
        buttonInsertMode: 'append',

        // Gatilho para decidir se o plugin deve ser exibido nesta pagina.
        // Pode ser boolean, function() => boolean ou string JS.
        // Exemplo de string: "$('.nome-produto').text().includes('Anel')"
        triggerCondition: true,

        // Quando true, abre o modal assim que o botao for montado.
        openOnInit: false,

        // Ajustes de montagem quando o alvo demora para existir no DOM.
        mountRetries: 20,
        mountRetryDelayMs: 250,

        // Calibragem por cartao fisico.
        referenceCard: {
            widthMm: 85.6,
            heightMm: 53.9,
            defaultScalePercent: 100,
            minScalePercent: 60,
            maxScalePercent: 150,
            baseGuideHeightPx: 220
        },

        // Faixa e precisao da medicao do diametro interno do anel.
        measurement: {
            minDiameterMm: 12.0,
            maxDiameterMm: 25.0,
            defaultDiameterMm: 19.0,
            stepMm: 0.1
        },

        // Tabela padrao de aro BR por diametro interno em mm.
        brSizeTable: [
            { aro: 9, diameterMm: 15.6 },
            { aro: 10, diameterMm: 15.9 },
            { aro: 11, diameterMm: 16.2 },
            { aro: 12, diameterMm: 16.5 },
            { aro: 13, diameterMm: 16.9 },
            { aro: 14, diameterMm: 17.2 },
            { aro: 15, diameterMm: 17.5 },
            { aro: 16, diameterMm: 17.8 },
            { aro: 17, diameterMm: 18.1 },
            { aro: 18, diameterMm: 18.5 },
            { aro: 19, diameterMm: 18.8 },
            { aro: 20, diameterMm: 19.1 },
            { aro: 21, diameterMm: 19.4 },
            { aro: 22, diameterMm: 19.7 },
            { aro: 23, diameterMm: 20.0 },
            { aro: 24, diameterMm: 20.4 },
            { aro: 25, diameterMm: 20.7 },
            { aro: 26, diameterMm: 21.0 },
            { aro: 27, diameterMm: 21.3 },
            { aro: 28, diameterMm: 21.6 },
            { aro: 29, diameterMm: 21.9 },
            { aro: 30, diameterMm: 22.2 }
        ],

        texts: {
            modalTitle: 'Como medir seu anel',
            step1Title: 'Calibragem',
            step1Description: 'Posicione um cartao fisico horizontalmente e ajuste o desenho ate igualar a altura do seu cartao.',
            scaleLabel: 'Ajuste a altura do cartao guia',
            step1Button: 'Descobrir o tamanho',
            step2Title: 'Medicao do aro',
            step2Description: 'Posicione o anel no circulo e ajuste ate que a seta encoste na borda interna.',
            diameterLabel: 'Ajuste do diametro interno',
            closeLabel: '',
            backLabel: 'Voltar para calibragem',
            resultPrefix: 'Resultado aproximado',
            approximateLabel: 'Aro BR',
            helperPrecision: 'Use este resultado como aproximado. A precisao depende da calibragem manual.'
        },

        colors: {
            overlay: 'rgba(0, 0, 0, 0.45)',
            panelBg: '#efefef',
            panelText: '#171717',
            panelMuted: '#5f5f5f',
            primary: '#d59a7c',
            primaryHover: '#c18263',
            lineGuide: '#3f8557',
            ringAreaBg: '#dea37e',
            ringStroke: '#1f2937',
            buttonText: '#111111',
            border: '#cfcfcf'
        },

        zIndex: 999999,

        onResult: null
    };

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function deepMerge(base, override) {
        const output = Object.assign({}, base);
        if (!isPlainObject(override)) return output;

        Object.keys(override).forEach((key) => {
            const baseValue = output[key];
            const overrideValue = override[key];

            if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
                output[key] = deepMerge(baseValue, overrideValue);
            } else {
                output[key] = overrideValue;
            }
        });

        return output;
    }

    const CONFIG = deepMerge(DEFAULT_CONFIG, window.RingSizeSimulatorConfig || {});

    // ======
    // NAO ALTERAR DAQUI PRA BAIXO
    // ======

    const CSS_STYLES = `
        <style id="ring-simulator-styles">
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap');

            .ring-simulator-open {
                overflow: hidden;
            }

            .ring-simulator-overlay {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                z-index: ${CONFIG.zIndex};
                background: #e9feff;
                display: none;
            }
            .ring-simulator-overlay.is-open {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ring-simulator-modal {
                width: 100vw;
                height: 100vh;
                background: transparent;
                color: #232323;
                box-sizing: border-box;
                overflow: auto;
                padding: 0;
                font-family: 'Poppins', Arial, sans-serif;
                display: flex;
                flex-direction: column;
                
                align-items: stretch;
            }

            .ring-simulator-wrap {
                max-width: 90%;
                width:800px;
                margin: 48px auto;
                background: #fff;
                border-radius: 0;
                border: 1px solid #e0d6ce;
                padding: 60px;
                position: relative;
                box-sizing: border-box;
                box-shadow: none;
            }

            .ring-simulator-topbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 32px;
                position: relative;
            }

            .ring-simulator-title {
                margin: 0;
                font-family: 'Poppins', serif;
                font-size: 22px;
                font-weight: 700;
                line-height: 1.1;
                color: #232323;
                text-transform: uppercase;
            }

            .ring-simulator-close {
                position: fixed;
                top: 32px;
                right: 32px;
                z-index: ${CONFIG.zIndex + 1};
                border: none;
                background: transparent;
                color: #232323;
                border-radius: 0;
                padding: 8px;
                font-size: 25.6px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.18s, color 0.18s;
            }
            .ring-simulator-close:hover {
                background: #e0d6ce;
                color: #111;
            }

            .ring-simulator-trigger-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 12px 28px;
                border: 1px solid #232323;
                border-radius: 0;
                background: #fff;
                color: #232323;
                font-size: 16px;
                font-family: 'Poppins', Arial, sans-serif;
                font-weight: 700;
                text-transform: uppercase;
                cursor: pointer;
                transition: background 0.2s, color 0.2s, border 0.2s;
            }
            .ring-simulator-trigger-btn:hover {
                background: #232323;
                color: #fff;
                border-color: #232323;
            }

            .ring-simulator-orientations {
                margin-bottom: 32px;
            }
            .ring-simulator-orientations p {
                font-size: 14px;
                margin-bottom: 10px;
                font-family: 'Poppins', Arial, sans-serif;
            }
            .ring-simulator-orientations strong {
                font-weight: 600;
                font-family: 'Poppins', Arial, sans-serif;
            }
            .ring-simulator-orientations ul {
                margin: 6px 0 0 18px;
                padding: 0;
                font-size: 16px;
                font-family: 'Poppins', Arial, sans-serif;
            }
            .ring-simulator-orientations li {
                margin-bottom: 2px;
            }
            .ring-simulator-orientations span[style*="color:#3f8557"] {
                color: #3f8557 !important;
                font-weight: 600;
            }

            .ring-simulator-orientations .calib {
                font-family: 'Poppins', Arial, sans-serif;
                font-weight: 600;
                color: #232323;
            }

            .ring-simulator-step {
                display: none;
                position: relative;
            }
            .ring-simulator-step.is-active {
                display: block;
            }
            .ring-simulator-step h2 {
                font-family: 'Poppins', serif;
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 10px;
                color: #232323;
                letter-spacing: 0.04em;
                text-transform: uppercase;
            }
            .ring-simulator-step p {
                margin: 0 0 16px;
                font-size: 14px;
                line-height: 1.5;
                color: #444;
                max-width: 900px;
                font-family: 'Poppins', Arial, sans-serif;
            }
            .ring-simulator-step .muted {
                color: #888;
                font-size: 14px;
                font-style: italic;
            }

            .ring-simulator-control-label {
                display: block;
                margin: 0 28px 0 10px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                font-size: 14px;
                font-weight: 600;
                color: #888;
                font-family: 'Poppins', Arial, sans-serif;
            }

            .ring-simulator-slider-row {
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 420px;
                margin-bottom: 18px;
            }
            .ring-simulator-slider-sign {
                font-size: 24px;
                font-weight: 700;
                line-height: 1;
                color: #bbb;
            }
            .ring-simulator-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                background: transparent;
                height: 18px;
                cursor: pointer;
            }
            .ring-simulator-slider::-webkit-slider-runnable-track {
                height: 4px;
                border-radius: 0;
                background: #e0d6ce;
            }
            .ring-simulator-slider::-moz-range-track {
                height: 4px;
                border-radius: 0;
                background: #e0d6ce;
            }
            .ring-simulator-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: #232323;
                border: 2px solid #fff;
                margin-top: -9px;
                transition: background 0.2s, border 0.2s;
            }
            .ring-simulator-slider:focus::-webkit-slider-thumb {
                background: #444;
                border: 2px solid #232323;
            }
            .ring-simulator-slider::-moz-range-thumb {
                width: 22px;
                height: 22px;
                border-radius: 0;
                background: #232323;
                border: 2px solid #fff;
                transition: background 0.2s, border 0.2s;
            }
            .ring-simulator-slider:focus::-moz-range-thumb {
                background: #444;
                border: 2px solid #232323;
            }

            .ring-simulator-calibration-area {
                width: 260px;
                margin: 8px 0 24px;
                background: #f7ede7;
                border-radius: 0;
                border: 1px solid #e0d6ce;
                padding: 12px 0 12px 0;
            }
            .ring-simulator-guide-top,
            .ring-simulator-guide-bottom {
                height: 3px;
                width: 100%;
            }
            .ring-simulator-guide-top {
                background: #3f8557;
            }
            .ring-simulator-guide-bottom {
                background: #bbb;
            }
            .ring-simulator-card-guide {
                width: 100%;
                border-radius: 0;
                background: #e0d6ce;
                position: relative;
                overflow: hidden;
            }
            .ring-simulator-card-guide::before {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                top: 24%;
                height: 20%;
                background: #bbb;
            }
            .ring-simulator-card-guide::after {
                content: '';
                position: absolute;
                left: 8%;
                width: 56%;
                top: 46%;
                height: 16%;
                background: #f7ede7;
            }

            .ring-simulator-action {
                margin-top: 18px;
                padding: 14px 32px;
                min-width: 180px;
                border: 0;
                border-radius: 0;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                font-size: 1rem;
                font-family: 'Poppins', Arial, sans-serif;
                font-weight: 700;
                background: #232323;
                color: #fff;
                cursor: pointer;
                transition: background 0.2s, color 0.2s;
            }
            .ring-simulator-action:hover {
                background: #444;
                color: #fff;
            }

            .ring-simulator-measure-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 32px;
                align-items: center;
                margin-top: 18px;
            }
            .ring-simulator-ring-stage {
                width: 180px;
                height: 180px;
                background: #f7ede7;
                border-radius: 0;
                border: 1px solid #e0d6ce;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom:1.5rem
            }
            .ring-simulator-ring {
                border-radius: 50%;
                border: 3px solid #232323;
                background: transparent;
                box-sizing: border-box;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ring-simulator-aro-label {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Poppins', Arial, sans-serif;
                font-size: 16px;
                font-weight: 600;
                color: #232323;
                pointer-events: none;
                user-select: none;
                padding: 2px 10px;
                border-radius: 16px;
                white-space: nowrap;
            }
            .ring-simulator-ring::before,
            .ring-simulator-ring::after {
                content: '';
                position: absolute;
                top: 50%;
                width: 14px;
                border-top: 2px solid #3f8557;
                transform: translateY(-50%);
            }
            .ring-simulator-ring::before {
                right: 100%;
            }
            .ring-simulator-ring::after {
                left: 100%;
            }

            .ring-simulator-result {
                margin-top: 18px;
                font-size: 17px;
                font-family: 'Poppins', Arial, sans-serif;
                font-weight: 700;
                color: #232323;
                margin-bottom:1rem
            }
            .ring-simulator-result small {
                display: block;
                margin-top: 5px;
                font-size: 15px;
                font-weight: 400;
                color: #888;
            }

            .ring-simulator-footer {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            .ring-simulator-secondary {
                border: 1px solid #e0d6ce;
                background: #fff;
                color: #232323;
                border-radius: 0;
                font-size: 1rem;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                padding: 11px 16px;
                font-family: 'Poppins', Arial, sans-serif;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.18s, color 0.18s;
            }
            .ring-simulator-secondary:hover {
                background: #f7ede7;
                color: #111;
            }

            @media (max-width: 700px) {
                .ring-simulator-wrap {
                    padding: 0 0 0 0;
                    border-radius: 0;
                }
                .ring-simulator-modal {
                    padding: 0;
                }
                .ring-simulator-title {
                    font-size: 19px;
                }
                .ring-simulator-step h2 {
                    font-size: 16px;
                }
                .ring-simulator-step p {
                    font-size: 15px;
                }
                .ring-simulator-control-label {
                    font-size: 13px;
                }
                .ring-simulator-measure-grid {
                    grid-template-columns: 1fr;
                    gap: 14px;
                }
                .ring-simulator-ring-stage {
                    width: 120px;
                    height: 120px;
                    
                }
            }
        </style>
    `;

    const HTML_TEMPLATE = `
        <div id="ring-simulator-overlay" class="ring-simulator-overlay" aria-hidden="true">
            <button type="button" class="ring-simulator-close" id="ring-simulator-close" aria-label="Fechar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M6 6L18 18M18 6L6 18" stroke="#232323" stroke-width="2.2" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="ring-simulator-modal" role="dialog" aria-modal="true" aria-labelledby="ring-simulator-title">
                <div class="ring-simulator-wrap">
                    <div class="ring-simulator-topbar">
                        <h1 id="ring-simulator-title" class="ring-simulator-title">${CONFIG.texts.modalTitle}</h1>
                    </div>
                    <section id="ring-simulator-step-1" class="ring-simulator-step is-active" aria-label="Calibragem">
                    <p style="font-size:14px;margin-bottom:10px;">Descubra o aro de um anel, seguindo as instruções a seguir.</p>
                        <div style="font-size:12px;margin-bottom:10px;">
                            <strong>Você vai precisar de:</strong>
                            <ul style="margin: 6px 0 0 18px; padding: 0;">
                                <li>Um anel com o tamanho desejado;</li>
                                <li>Cartão de crédito ou semelhante (com as mesmas dimensões 85,6 x 53,9 mm );</li>
                            </ul>
                        </div>
                        <div style="font-size:12px;margin-bottom:10px;">
                            <strong>Calibragem</strong><br />
                            Posicione o seu cartão de crédito na horizontal, encostando seu topo na <span style="color:#3f8557;font-weight:600">linha verde</span>.<br /><br />
                            <span style="font-weight:600;">Ajuste o desenho do cartão guia abaixo até que ele tenha a mesma altura do seu cartão.</span> O cartão pode passar a largura da tela do seu dispositivo, desde que a sua <strong>altura</strong> esteja encaixada entre as guias de medida.
                        </div>
                        <h2 style="margin-top:2rem">${CONFIG.texts.step1Title}</h2>
                        <p>${CONFIG.texts.step1Description}</p>

                        <label class="ring-simulator-control-label" for="ring-simulator-scale">${CONFIG.texts.scaleLabel}</label>
                        <div class="ring-simulator-slider-row">
                            <span class="ring-simulator-slider-sign" aria-hidden="true">-</span>
                            <input
                                id="ring-simulator-scale"
                                class="ring-simulator-slider"
                                type="range"
                                min="${CONFIG.referenceCard.minScalePercent}"
                                max="${CONFIG.referenceCard.maxScalePercent}"
                                step="1"
                                value="${CONFIG.referenceCard.defaultScalePercent}"
                                aria-label="Escala do cartao guia"
                            />
                            <span class="ring-simulator-slider-sign" aria-hidden="true">+</span>
                        </div>

                        <div class="ring-simulator-calibration-area">
                            <div class="ring-simulator-guide-top"></div>
                            <div id="ring-simulator-card-guide" class="ring-simulator-card-guide"></div>
                            <div class="ring-simulator-guide-bottom"></div>
                        </div>

                        <button id="ring-simulator-next" type="button" class="ring-simulator-action">${CONFIG.texts.step1Button}</button>
                    </section>

                    <section id="ring-simulator-step-2" class="ring-simulator-step" aria-label="Medicao do aro">
                        <h2>${CONFIG.texts.step2Title}</h2>
                        <p>${CONFIG.texts.step2Description}</p>

                        <div class="ring-simulator-measure-grid">
                            <div>
                                <label class="ring-simulator-control-label" for="ring-simulator-diameter">${CONFIG.texts.diameterLabel}</label>
                                <div class="ring-simulator-slider-row">
                                    <span class="ring-simulator-slider-sign" aria-hidden="true">-</span>
                                    <input
                                        id="ring-simulator-diameter"
                                        class="ring-simulator-slider"
                                        type="range"
                                        min="${CONFIG.measurement.minDiameterMm}"
                                        max="${CONFIG.measurement.maxDiameterMm}"
                                        step="${CONFIG.measurement.stepMm}"
                                        value="${CONFIG.measurement.defaultDiameterMm}"
                                        aria-label="Diametro interno do anel"
                                    />
                                    <span class="ring-simulator-slider-sign" aria-hidden="true">+</span>
                                </div>
                                <div class="ring-simulator-ring-stage" aria-hidden="true">
                                    <div id="ring-simulator-ring" class="ring-simulator-ring">
                                        <span id="ring-simulator-aro-label" class="ring-simulator-aro-label"></span>
                                    </div>
                                </div>
                                <div class="ring-simulator-result" id="ring-simulator-result" style="display:none"></div>
                                <p class="muted" id="ring-simulator-helper">${CONFIG.texts.helperPrecision}</p>
                                <div class="ring-simulator-footer">
                                    <button id="ring-simulator-back" type="button" class="ring-simulator-secondary">${CONFIG.texts.backLabel}</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `;

    class RingSizeSimulator {
        constructor() {
            this.currentStep = 1;
            this.scalePercent = Number(CONFIG.referenceCard.defaultScalePercent);
            this.pixelsPerMm = 0;
            this.diameterMm = Number(CONFIG.measurement.defaultDiameterMm);
            this.result = null;
            this.mountAttempts = 0;
            this.init();
        }

        init() {
            if (!CONFIG.active || !this.shouldActivate()) {
                return;
            }

            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.updateCalibrationVisual();
            this.updateMeasurementVisual();
            this.setupEventListeners();
            this.mountTriggerButtonWithRetry();
        }

        shouldActivate() {
            const cond = CONFIG.triggerCondition;

            if (typeof cond === 'boolean') {
                return cond;
            }

            if (typeof cond === 'function') {
                try {
                    return !!cond();
                } catch (e) {
                    console.warn('[RingSizeSimulator] Erro no trigger function:', e);
                    return false;
                }
            }

            if (typeof cond === 'string' && cond.trim()) {
                try {
                    return !!new Function('return (' + cond + ')')(); // eslint-disable-line no-new-func
                } catch (e) {
                    console.warn('[RingSizeSimulator] Erro no triggerCondition:', cond, e);
                    return false;
                }
            }

            return false;
        }

        injectStyles() {
            if (!document.getElementById('ring-simulator-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById('ring-simulator-overlay');
            if (existing) {
                existing.remove();
            }
            document.body.insertAdjacentHTML('beforeend', HTML_TEMPLATE);
        }

        setupElements() {
            this.overlay = document.getElementById('ring-simulator-overlay');
            this.step1 = document.getElementById('ring-simulator-step-1');
            this.step2 = document.getElementById('ring-simulator-step-2');
            this.closeButton = document.getElementById('ring-simulator-close');
            this.nextButton = document.getElementById('ring-simulator-next');
            this.backButton = document.getElementById('ring-simulator-back');
            this.scaleInput = document.getElementById('ring-simulator-scale');
            this.cardGuide = document.getElementById('ring-simulator-card-guide');
            this.diameterInput = document.getElementById('ring-simulator-diameter');
            this.ring = document.getElementById('ring-simulator-ring');
            this.resultEl = document.getElementById('ring-simulator-result');
        }

        mountTriggerButtonWithRetry() {
            if (this.triggerButton) {
                return;
            }

            const mountSelector = CONFIG.buttonMountSelector;
            const mountTarget = mountSelector ? document.querySelector(mountSelector) : null;

            if (mountTarget || !mountSelector) {
                this.insertTriggerButton(mountTarget || document.body);
                if (CONFIG.openOnInit) {
                    this.open();
                }
                return;
            }

            this.mountAttempts += 1;

            if (this.mountAttempts < Number(CONFIG.mountRetries)) {
                setTimeout(() => {
                    this.mountTriggerButtonWithRetry();
                }, Number(CONFIG.mountRetryDelayMs));
            }
        }

        insertTriggerButton(mountTarget) {
            const existing = document.getElementById('ring-simulator-trigger-btn');
            if (existing) {
                existing.remove();
            }

            this.triggerButton = document.createElement('button');
            this.triggerButton.type = 'button';
            this.triggerButton.id = 'ring-simulator-trigger-btn';
            this.triggerButton.className = 'ring-simulator-trigger-btn';
            this.triggerButton.textContent = CONFIG.buttonText;

            const mode = String(CONFIG.buttonInsertMode || 'append').toLowerCase();

            if (mode === 'prepend') {
                mountTarget.insertAdjacentElement('afterbegin', this.triggerButton);
            } else if (mode === 'before') {
                mountTarget.insertAdjacentElement('beforebegin', this.triggerButton);
            } else if (mode === 'after') {
                mountTarget.insertAdjacentElement('afterend', this.triggerButton);
            } else {
                mountTarget.insertAdjacentElement('beforeend', this.triggerButton);
            }

            this.triggerButton.addEventListener('click', () => this.open());
        }

        setupEventListeners() {
            this.closeButton.addEventListener('click', () => this.close());
            this.nextButton.addEventListener('click', () => this.goToStep(2));
            this.backButton.addEventListener('click', () => this.goToStep(1));

            this.scaleInput.addEventListener('input', (event) => {
                this.scalePercent = Number(event.target.value);
                this.updateCalibrationVisual();
                this.updateMeasurementVisual();
            });

            this.diameterInput.addEventListener('input', (event) => {
                this.diameterMm = Number(event.target.value);
                this.updateMeasurementVisual();
            });

            this.overlay.addEventListener('click', (event) => {
                if (event.target === this.overlay) {
                    this.close();
                }
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && this.overlay.classList.contains('is-open')) {
                    this.close();
                }
            });
        }

        updateCalibrationVisual() {
            const baseHeightPx = Number(CONFIG.referenceCard.baseGuideHeightPx);
            const ratio = Number(CONFIG.referenceCard.widthMm) / Number(CONFIG.referenceCard.heightMm);
            const currentHeight = baseHeightPx * (this.scalePercent / 100);
            const currentWidth = currentHeight * ratio;

            this.cardGuide.style.height = currentHeight.toFixed(1) + 'px';
            this.cardGuide.style.width = currentWidth.toFixed(1) + 'px';

            this.pixelsPerMm = currentHeight / Number(CONFIG.referenceCard.heightMm);
        }

        updateMeasurementVisual() {
            const pxPerMm = this.pixelsPerMm || (Number(CONFIG.referenceCard.baseGuideHeightPx) / Number(CONFIG.referenceCard.heightMm));
            const diameterPx = Math.max(10, this.diameterMm * pxPerMm);

            this.ring.style.width = diameterPx.toFixed(1) + 'px';
            this.ring.style.height = diameterPx.toFixed(1) + 'px';

            const nearest = this.findNearestBrSize(this.diameterMm);
            this.result = {
                aroBr: nearest ? nearest.aro : null,
                diameterMm: Number(this.diameterMm.toFixed(1))
            };

            // Exibe "Aro {número}" centralizado dentro do círculo
            const aroLabel = document.getElementById('ring-simulator-aro-label');
            if (aroLabel) {
                aroLabel.textContent = this.result.aroBr !== null ? `Aro ${this.result.aroBr}` : '';
            }

            // Remove resultado fora do círculo
            if (this.resultEl) {
                this.resultEl.innerHTML = '';
            }

            if (typeof CONFIG.onResult === 'function') {
                CONFIG.onResult(Object.assign({}, this.result));
            }
        }

        findNearestBrSize(diameterMm) {
            if (!Array.isArray(CONFIG.brSizeTable) || !CONFIG.brSizeTable.length) {
                return null;
            }

            let nearest = CONFIG.brSizeTable[0];
            let smallestDiff = Math.abs(diameterMm - nearest.diameterMm);

            CONFIG.brSizeTable.forEach((item) => {
                const diff = Math.abs(diameterMm - item.diameterMm);
                if (diff < smallestDiff) {
                    smallestDiff = diff;
                    nearest = item;
                }
            });

            return nearest;
        }

        goToStep(step) {
            this.currentStep = step === 2 ? 2 : 1;

            if (this.currentStep === 1) {
                this.step1.classList.add('is-active');
                this.step2.classList.remove('is-active');
            } else {
                this.step1.classList.remove('is-active');
                this.step2.classList.add('is-active');
            }
        }

        open() {
            this.overlay.classList.add('is-open');
            this.overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('ring-simulator-open');
        }

        close() {
            this.overlay.classList.remove('is-open');
            this.overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('ring-simulator-open');
        }

        // ========================================
        // API PUBLICA
        // ========================================

        getResult() {
            return this.result ? Object.assign({}, this.result) : null;
        }

        reset() {
            this.scalePercent = Number(CONFIG.referenceCard.defaultScalePercent);
            this.diameterMm = Number(CONFIG.measurement.defaultDiameterMm);
            this.scaleInput.value = String(this.scalePercent);
            this.diameterInput.value = String(this.diameterMm);
            this.goToStep(1);
            this.updateCalibrationVisual();
            this.updateMeasurementVisual();
        }

        destroy() {
            this.close();

            const overlay = document.getElementById('ring-simulator-overlay');
            if (overlay) {
                overlay.remove();
            }

            const triggerButton = document.getElementById('ring-simulator-trigger-btn');
            if (triggerButton) {
                triggerButton.remove();
            }

            const styles = document.getElementById('ring-simulator-styles');
            if (styles) {
                styles.remove();
            }
        }

        reinit() {
            this.destroy();
            this.init();
        }
    }

    // ========================================
    // INICIALIZACAO AUTOMATICA
    // ========================================

    function initRingSizeSimulator() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.RingSizeSimulator = new RingSizeSimulator();
            });
        } else {
            window.RingSizeSimulator = new RingSizeSimulator();
        }
    }

    initRingSizeSimulator();
})();
