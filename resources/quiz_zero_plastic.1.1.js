/**
 * Product Recommendation Quiz —  / Biobone
 * Fluxo: Porte → Peso → Idade → Mordida → Saúde → Recomendação
 * Version: 1.0.0
 */

(function () {
    'use strict';

    // ======
    // DEFAULT CONFIG
    // ======
    const DEFAULT_CONFIG = {
        containerId: 'quiz-recomendacao',

        // Header text
        title: 'Encontre o Mordedor Ideal',
        subtitle: 'Responda 5 perguntas rápidas para descobrir o Biobone certo para o seu cão.',
        badgeLabel: '🦴 GUIA DE RECOMENDAÇÃO',

        // Scale legend
        scaleLabel: 'ESCALA DE DENSIDADE',
        scaleLevels: [
            { key: 'SOFT',   label: 'moderada',    description: 'Ideal para filhotes e sêniors',  color: '#52b788' },
            { key: 'MEDIUM', label: 'Forte',        description: 'Para adultos, uso diário',        color: '#2d6a4f' },
            { key: 'HARD',   label: 'Extra Forte',  description: 'Para mordedores intensos',        color: '#0d2118' }
        ],

        // Footer disclaimer
        disclaimer: 'Nota: As respostas são um ponto de partida. Sempre ajuste de acordo com a intensidade de mordida individual do seu cão, saúde dental e idade. Em caso de dúvida, comece com um nível mais macio e ajuste conforme necessário.',

        // Button labels
        buttons: {
            continue: 'Continuar →',
            back: '← Voltar',
            restart: 'Recomeçar',
            seeResult: 'Ver Minha Recomendação →',
            buy: 'Comprar'
        },

        // Search term mappings — must match words in your product titles
        durabilityTerms: {
            SOFT:   'moderada',
            MEDIUM: 'Forte',
            HARD:   'Extra Forte'
        },
        sizeTerms: {
            MINI:   'Ossinho / Peixinho',
            SMALL:  'Asterisco Pequeno',
            MEDIUM: 'Ossão',
            LARGE:  'Asterisco Grande',
            XLARGE: 'Ossão Gigante'
        },

        // Aliases used to filter _search results client-side by size.
        // Use single-word fragments only — multi-word phrases break when
        // product names contain other words between the parts (e.g. "Asterisco Forte Pequeno").
        sizeAliases: {
            MINI:   ['ossinho', 'peixinho', 'mini'],
            SMALL:  ['pequeno', 'pequena'],
            MEDIUM: ['ossao', 'ossão'],
            LARGE:  ['grande'],
            XLARGE: ['gigante']
        },

        // Max number of product cards to display
        resultsLimit: 8,

        // Result screen labels
        result: {
            headline:           'Recomendamos o Biobone',
            sizeLabel:          'Tamanho:',
            profileTitle:       'PERFIL DO SEU CÃO',
            porteLabel:         'Porte:',
            pesoLabel:          'Peso:',
            ageLabel:           'Idade:',
            chewStyleLabel:     'Estilo de Mordida:',
            healthLabel:        'Saúde:',
            boneSizeLabel:      'Modelo Indicado:',
            whyTitle:           'POR QUE',
            whyTitleSuffix:     '?',
            flavorTitle:        '🦴 SABOR RECOMENDADO',
            adjustTitle:        '🏷️ Regra de Ajuste Simples',
            adjustTooEasy:      'Muito fácil?',
            adjustTooEasyText:  'Se o bone desaparece muito rápido → tente um nível mais resistente.',
            adjustTooFirm:      'Muito firme?',
            adjustTooFirmText:  'Se seu cão perde o interesse ou parece desconfortável → tente um nível mais macio.',
            productsTitle:      'PRODUTOS RECOMENDADOS',
            productsNotFound:   'Nenhum produto encontrado para essa recomendação.',
            noImage:            'Sem imagem'
        },

        // Steps configuration
        // types: 'single-select' | 'multi-select' | 'weight-input'
        steps: [
            {
                id: 'porte',
                stepLabel: 'PORTE',
                title: 'Qual é o porte do seu cão?',
                description: 'O porte determina o tamanho ideal do mordedor.',
                type: 'single-select',
                options: [
                    { id: 'toy',      label: 'Miniatura / Toy',  description: 'Até ~10 kg — Ossinho, Peixinho',             emoji: '🐾' },
                    { id: 'pequeno',  label: 'Pequeno',           description: '7 a 15 kg — Asterisco Pequeno',              emoji: '🐕' },
                    { id: 'medio',    label: 'Médio',             description: '15 a 30 kg — Ossão, Asterisco Grande',       emoji: '🐕' },
                    { id: 'grande',   label: 'Grande',            description: '30 a 60 kg — Ossão Gigante',                 emoji: '🦮' }
                ]
            },
            {
                id: 'peso',
                stepLabel: 'PESO',
                title: 'Qual é o peso atual do seu cão?',
                description: 'Informe o peso em quilogramas para uma recomendação mais precisa.',
                type: 'weight-input',
                placeholder: 'Ex: 12',
                unit: 'kg',
                min: 0.5,
                max: 120
            },
            {
                id: 'age',
                stepLabel: 'IDADE',
                title: 'Quantos anos tem seu cão?',
                description: 'A idade afeta o desenvolvimento da mandíbula e a sensibilidade dental.',
                type: 'single-select',
                options: [
                    { id: 'puppy',  label: 'Menos de 1 ano',  description: 'Filhote',            emoji: '🐾', tag: 'Filhote' },
                    { id: 'young',  label: '1 a 4 anos',      description: 'Adulto jovem',       emoji: '🐕', tag: null },
                    { id: 'adult',  label: '5 a 7 anos',      description: 'Adulto maduro',      emoji: '🐕', tag: null },
                    { id: 'senior', label: '8 a 10 anos',     description: 'Adulto mais velho',  emoji: '🦴', tag: 'Sênior' },
                    { id: 'elder',  label: '11+ anos',        description: 'Anos dourados',      emoji: '🦴', tag: 'Sênior' }
                ]
            },
            {
                id: 'mordida',
                stepLabel: 'MORDIDA',
                title: 'Como seu cão morde?',
                description: 'Escolha o estilo que melhor descreve a mordida diária dele.',
                type: 'single-select',
                options: [
                    { id: 'gentle',   label: 'Mordedor Suave',    description: 'Mordiscada leve, perde o interesse rapidamente', emoji: '😌' },
                    { id: 'everyday', label: 'Mordedor moderada', description: 'Morde todo dia, pressão moderada',               emoji: '😊' },
                    { id: 'power',    label: 'Mordedor Intenso',  description: 'Destrói brinquedos, mastigação pesada',          emoji: '💪' }
                ]
            },
            {
                id: 'health',
                stepLabel: 'SAÚDE',
                title: 'Alguma consideração de saúde?',
                description: 'Selecione as que se aplicam — ou avance se nenhuma se aplica.',
                type: 'multi-select',
                options: [
                    { id: 'allergies', label: 'Propensão a Alergias',  description: 'Estômago sensível, reações na pele ou intolerâncias alimentares',           emoji: '🌿' },
                    { id: 'dental',    label: 'Sensibilidade Bucal',   description: 'Dentes frágeis, problemas gengivais ou trabalho dental recente',            emoji: '🦷' }
                ],
                infoBox: 'O Biobone  é 100% natural — sem nylon, borracha ou subprodutos. Para cães com alergias, recomendamos sabores Cana, Madeira ou Laranja. Sem alergias? O sabor Carne é irresistível!'
            }
        ],

        // Flavor recommendations
        flavors: {
            allergies: {
                name: 'Cana / Madeira / Laranja',
                description: 'Sabores naturais e inertes, livres de alérgenos comuns — seguros para cães com restrições alimentares severas e estômagos sensíveis.'
            },
            default: {
                name: 'Carne',
                description: 'O sabor Carne do Biobone  é a escolha favorita da maioria dos cães. Rico, natural e irresistível.'
            }
        },

        colors: {
            background:          '#f4f8f4',
            cardBackground:      '#ffffff',
            cardBorder:          '#d4e4d4',
            headerText:          '#0d2118',
            bodyText:            '#3a4a3a',
            softColor:           '#52b788',
            mediumColor:         '#2d6a4f',
            hardColor:           '#0d2118',
            selectedBorder:      '#2d6a4f',
            tagPuppy:            '#52b788',
            tagSenior:           '#2d6a4f',
            continueBtn:         '#2d6a4f',
            continueBtnText:     '#ffffff',
            continueBtnDisabled: '#b8cdb8',
            backBtn:             '#ffffff',
            backBtnBorder:       '#b8cdb8',
            backBtnText:         '#3a4a3a'
        }
    };

    // Merge default config with client config (if exists)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.QuizRecomendacaoConfig && typeof window.QuizRecomendacaoConfig === 'object') {
        Object.assign(CONFIG, window.QuizRecomendacaoConfig);

        if (window.QuizRecomendacaoConfig.colors && typeof window.QuizRecomendacaoConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.QuizRecomendacaoConfig.colors);
        }
        if (window.QuizRecomendacaoConfig.buttons && typeof window.QuizRecomendacaoConfig.buttons === 'object') {
            CONFIG.buttons = Object.assign({}, DEFAULT_CONFIG.buttons, window.QuizRecomendacaoConfig.buttons);
        }
        if (window.QuizRecomendacaoConfig.result && typeof window.QuizRecomendacaoConfig.result === 'object') {
            CONFIG.result = Object.assign({}, DEFAULT_CONFIG.result, window.QuizRecomendacaoConfig.result);
        }
        if (window.QuizRecomendacaoConfig.flavors && typeof window.QuizRecomendacaoConfig.flavors === 'object') {
            CONFIG.flavors = Object.assign({}, DEFAULT_CONFIG.flavors, window.QuizRecomendacaoConfig.flavors);
        }
        if (window.QuizRecomendacaoConfig.sizeAliases && typeof window.QuizRecomendacaoConfig.sizeAliases === 'object') {
            CONFIG.sizeAliases = Object.assign({}, DEFAULT_CONFIG.sizeAliases, window.QuizRecomendacaoConfig.sizeAliases);
        }
    }

    // ======
    // DO NOT EDIT BELOW THIS LINE
    // ======

    // ---
    // PESO → SIZES ARRAY
    // Returns ALL size keys valid for the given weight, per product spec:
    //   Ossinho/Peixinho  : até 10 kg
    //   Asterisco Pequeno : 7–10 kg
    //   Ossão             : 7–20 kg
    //   Asterisco Grande  : 20–30 kg
    //   Ossão Gigante     : 30–60 kg
    // ---
    function getSizesFromWeight(peso) {
        const kg = parseFloat(peso);
        if (isNaN(kg) || kg <= 0) return ['MEDIUM'];
        const sizes = [];
        if (kg <= 10)              sizes.push('MINI');   // ossinho/peixinho
        if (kg >= 7  && kg <= 10)  sizes.push('SMALL');  // asterisco pequeno
        if (kg >= 7  && kg <= 20)  sizes.push('MEDIUM'); // ossão
        if (kg >= 20 && kg <= 30)  sizes.push('LARGE');  // asterisco grande
        if (kg >= 30 && kg <= 60)  sizes.push('XLARGE'); // ossão gigante
        if (sizes.length === 0)    sizes.push('MEDIUM'); // fallback (>60kg)
        // deduplicate while preserving order
        return sizes.filter(function (v, i, a) { return a.indexOf(v) === i; });
    }

    // ---
    // DURABILITY SCALE HELPERS
    // ---
    const DURABILITY_ORDER = ['SOFT', 'MEDIUM', 'HARD'];

    function stepSofter(durability) {
        const idx = DURABILITY_ORDER.indexOf(durability);
        return DURABILITY_ORDER[Math.max(0, idx - 1)];
    }

    function stepHarder(durability) {
        const idx = DURABILITY_ORDER.indexOf(durability);
        return DURABILITY_ORDER[Math.min(DURABILITY_ORDER.length - 1, idx + 1)];
    }

    function getSizeLabel(sizeKey) {
        return CONFIG.sizeTerms[sizeKey] || sizeKey;
    }

    function getDurabilityLabel(durabilityKey) {
        return CONFIG.durabilityTerms[durabilityKey] || durabilityKey;
    }

    function getDurabilityColor(durabilityKey) {
        const level = CONFIG.scaleLevels.find(function (l) { return l.key === durabilityKey; });
        return level ? level.color : CONFIG.colors.mediumColor;
    }

    // ---
    // RECOMMENDATION CALCULATOR
    // ---
    function calculateRecommendation(answers) {
        // Sizes come from the peso entered by the user
        const sizes = getSizesFromWeight(answers.peso);
        const size = sizes[0]; // primary (smallest applicable) for display

        // Durability base comes from mordida
        let durability;
        if (answers.mordida === 'gentle') {
            durability = 'SOFT';
        } else if (answers.mordida === 'power') {
            durability = 'HARD';
        } else {
            durability = 'MEDIUM';
        }

        // Age modifier
        if (answers.age === 'puppy') {
            durability = stepSofter(durability);
        } else if (answers.age === 'senior' || answers.age === 'elder') {
            if (durability === 'HARD') durability = 'MEDIUM';
        }

        // Health modifiers
        const healthSelections = answers.health || [];
        if (healthSelections.includes('dental')) {
            durability = stepSofter(durability);
        }
        const hasAllergies = healthSelections.includes('allergies');

        // Build reasons list
        const reasons = [];

        const porteOption = (CONFIG.steps.find(function (s) { return s.id === 'porte'; }) || {}).options || [];
        const porteLabel = (porteOption.find(function (o) { return o.id === answers.porte; }) || {}).label || answers.porte;

        const sizesLabel = sizes.map(getSizeLabel).join(' / ');
        reasons.push('Peso ' + (answers.peso || '?') + ' kg — modelos indicados: ' + sizesLabel);

        if (answers.mordida === 'gentle') {
            reasons.push('Mordedores suaves se dão melhor com densidades mais macias');
        } else if (answers.mordida === 'power') {
            reasons.push('Mordedores intensos precisam de maior durabilidade para segurança e longevidade');
        } else {
            reasons.push('Mordida moderada → densidade equilibrada para uso diário');
        }

        if (answers.age === 'puppy') {
            reasons.push('Filhotes precisam de mordedores mais macios para os dentes em desenvolvimento');
        } else if (answers.age === 'senior' || answers.age === 'elder') {
            reasons.push('Cães sênior se beneficiam de opções mais macias para proteger os dentes');
        }

        if (healthSelections.includes('dental')) {
            reasons.push('Sensibilidade bucal indica uma opção mais macia (moderada)');
        }

        if (hasAllergies) {
            reasons.push('Para cães com alergias, recomendamos sabores Cana, Madeira ou Laranja — naturais e sem alérgenos comuns');
        }

        const flavor = hasAllergies ? CONFIG.flavors.allergies : CONFIG.flavors.default;

        return {
            durability: durability,
            sizes: sizes,   // array of all applicable size keys
            size: size,     // primary (first) for display
            flavor: flavor,
            reasons: reasons,
            porte: answers.porte,
            peso: answers.peso
        };
    }

    // ---
    // CSS STYLES
    // ---
    const CSS_STYLES = `
        <style id="quiz-recomendacao-styles">
            #quiz-recomendacao-wrapper {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                background: ${CONFIG.colors.background};
                min-height: 100%;
                padding: 24px 16px 48px;
                box-sizing: border-box;
                color: ${CONFIG.colors.bodyText};
            }
            #quiz-recomendacao-wrapper * {
                box-sizing: border-box;
            }
            .qr-header {
                text-align: center;
                margin-bottom: 24px;
            }
            .qr-badge {
                display: inline-block;
                background: ${CONFIG.colors.headerText};
                color: #fff;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 1px;
                padding: 6px 18px;
                border-radius: 20px;
                margin-bottom: 12px;
            }
            .qr-title {
                font-size: clamp(22px, 5vw, 34px);
                font-weight: 800;
                color: ${CONFIG.colors.headerText};
                margin: 0 0 8px;
            }
            .qr-subtitle {
                font-size: 15px;
                color: ${CONFIG.colors.bodyText};
                margin: 0;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            }
            .qr-stepper {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 28px;
                gap: 0 0.6rem;
            }
            .qr-step-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            .qr-step-circle {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #d0cdc7;
                color: #9a9690;
                font-weight: 700;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s, color 0.3s;
            }
            .qr-step-circle.active {
                background: ${CONFIG.colors.hardColor};
                color: #fff;
            }
            .qr-step-circle.done {
                background: ${CONFIG.colors.hardColor};
                color: #fff;
            }
            .qr-step-label {
                font-size: 8px;
                letter-spacing: 0.5px;
                font-weight: 600;
                text-transform: uppercase;
                color: #9a9690;
            }
            .qr-step-label.active, .qr-step-label.done {
                color: ${CONFIG.colors.hardColor};
            }
            .qr-step-connector {
                width: 32px;
                height: 2px;
                background: #d0cdc7;
                margin-bottom: 20px;
                transition: background 0.3s;
            }
            .qr-step-connector.done {
                background: ${CONFIG.colors.hardColor};
            }
            .qr-scale-bar-wrap {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 20px;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            .qr-scale-label {
                text-align: center;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1px;
                color: #9a9690;
                margin-bottom: 8px;
            }
            .qr-scale-gradient {
                height: 8px;
                border-radius: 4px;
                background: linear-gradient(to right, ${CONFIG.colors.softColor}, ${CONFIG.colors.mediumColor}, ${CONFIG.colors.hardColor});
                margin-bottom: 10px;
            }
            .qr-scale-legend {
                display: flex;
                justify-content: space-between;
            }
            .qr-scale-level {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .qr-scale-level:nth-child(2) { align-items: center; }
            .qr-scale-level:nth-child(3) { align-items: flex-end; }
            .qr-scale-level-name {
                font-size: 13px;
                font-weight: 700;
            }
            .qr-scale-level-desc {
                font-size: 11px;
                color: #9a9690;
            }
            .qr-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 16px;
                padding: 24px;
                max-width: 600px;
                margin: 0 auto 20px;
            }
            .qr-step-title {
                font-size: clamp(18px, 4vw, 26px);
                font-weight: 800;
                color: ${CONFIG.colors.headerText};
                margin: 0 0 6px;
            }
            .qr-step-desc {
                font-size: 13px;
                color: #7a7a7a;
                margin: 0 0 16px;
            }
            .qr-options-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .qr-option-card {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 16px;
                border: 1.5px solid ${CONFIG.colors.cardBorder};
                border-radius: 12px;
                cursor: pointer;
                transition: border-color 0.15s, background 0.15s;
                background: ${CONFIG.colors.cardBackground};
                position: relative;
            }
            .qr-option-card:hover { background: #f8f5ef; border-color: #c0b8a8; }
            .qr-option-card.selected { border-color: ${CONFIG.colors.selectedBorder}; background: #eaf7f5; }
            .qr-option-emoji { font-size: 24px; flex-shrink: 0; }
            .qr-option-content { flex: 1; }
            .qr-option-label { font-size: 15px; font-weight: 700; color: ${CONFIG.colors.headerText}; }
            .qr-option-desc { font-size: 12px; color: #7a7a7a; margin-top: 1px; }
            .qr-option-tag {
                font-size: 10px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 10px;
                background: #fdeee8;
                color: ${CONFIG.colors.hardColor};
                margin-left: auto;
                flex-shrink: 0;
            }
            .qr-option-checkbox {
                width: 20px;
                height: 20px;
                border: 2px solid ${CONFIG.colors.cardBorder};
                border-radius: 4px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: border-color 0.15s, background 0.15s;
            }
            .qr-option-card.selected .qr-option-checkbox {
                border-color: ${CONFIG.colors.softColor};
                background: ${CONFIG.colors.softColor};
            }
            .qr-option-checkbox-check {
                display: none;
                color: #fff;
                font-size: 12px;
                font-weight: 700;
                line-height: 1;
            }
            .qr-option-card.selected .qr-option-checkbox-check { display: block; }
            .qr-info-box {
                background: #eaf7f5;
                border: 1px solid #b2dfd9;
                border-radius: 10px;
                padding: 12px 14px;
                font-size: 12px;
                color: #264653;
                margin-top: 14px;
                line-height: 1.5;
            }

            /* Weight input step */
            .qr-weight-wrap {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            body .qr-weight-input {
                flex: 1;
                padding: 14px 18px;
                border: 1.5px solid ${CONFIG.colors.cardBorder};
                border-radius: 12px;
                font-size: 28px;
                font-weight: 700;
                color: ${CONFIG.colors.headerText};
                outline: none;
                background: #fff;
                transition: border-color 0.2s;
                text-align: center;
                -moz-appearance: textfield;
                height:auto;
            }
            .qr-weight-input::-webkit-outer-spin-button,
            .qr-weight-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            .qr-weight-input:focus { border-color: ${CONFIG.colors.softColor}; }
            .qr-weight-unit {
                font-size: 20px;
                font-weight: 700;
                color: #9a9690;
                flex-shrink: 0;
            }
            .qr-weight-hint {
                margin-top: 10px;
                font-size: 12px;
                color: #9a9690;
                text-align: center;
            }

            .qr-nav {
                display: flex;
                gap: 10px;
                margin-top: 20px;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            .qr-btn-back {
                padding: 12px 20px;
                border: 1.5px solid ${CONFIG.colors.backBtnBorder};
                border-radius: 10px;
                background: ${CONFIG.colors.backBtn};
                color: ${CONFIG.colors.backBtnText};
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s;
                white-space: nowrap;
            }
            .qr-btn-back:hover { background: #f0ece3; }
            .qr-btn-continue {
                flex: 1;
                padding: 14px 20px;
                border: none;
                border-radius: 10px;
                background: ${CONFIG.colors.continueBtn};
                color: ${CONFIG.colors.continueBtnText};
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                transition: background 0.15s, opacity 0.15s;
            }
            .qr-btn-continue:disabled {
                background: ${CONFIG.colors.continueBtnDisabled};
                cursor: not-allowed;
                opacity: 0.7;
            }
            .qr-btn-continue:not(:disabled):hover { filter: brightness(1.05); }
            .qr-disclaimer {
                max-width: 600px;
                margin: 20px auto 0;
                font-size: 11px;
                color: #9a9690;
                text-align: center;
                line-height: 1.5;
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 10px;
                padding: 12px;
                background: ${CONFIG.colors.cardBackground};
            }
            .qr-scale-bottom {
                max-width: 600px;
                margin: 16px auto 0;
                display: flex;
                justify-content: center;
                gap: 20px;
                flex-wrap: wrap;
            }
            .qr-scale-bottom-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
            }
            .qr-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .qr-dot.SOFT   { background: ${CONFIG.colors.softColor}; }
            .qr-dot.MEDIUM { background: ${CONFIG.colors.mediumColor}; }
            .qr-dot.HARD   { background: ${CONFIG.colors.hardColor}; }
            .qr-scale-bottom-item-label { font-weight: 700; }
            .qr-scale-bottom-item-desc { color: #9a9690; }

            /* Result screen */
            .qr-result-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 16px;
                padding: 28px 24px;
                max-width: 600px;
                margin: 0 auto 16px;
                text-align: center;
            }
            .qr-result-headline {
                font-size: clamp(20px, 4vw, 28px);
                font-weight: 800;
                color: ${CONFIG.colors.headerText};
                margin: 0 0 14px;
            }
            .qr-result-badges {
                display: flex;
                gap: 8px;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 8px;
            }
            .qr-result-durability-badge {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 18px;
                border-radius: 30px;
                font-size: 14px;
                font-weight: 800;
                color: #fff;
                letter-spacing: 0.5px;
            }
            .qr-result-size-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 18px;
                border-radius: 30px;
                font-size: 14px;
                font-weight: 700;
                background: ${CONFIG.colors.headerText};
                color: #fff;
            }
            .qr-result-weight-note {
                font-size: 12px;
                color: #9a9690;
                margin: 6px 0 0;
            }
            .qr-profile-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 14px;
                padding: 18px 20px;
                max-width: 600px;
                margin: 0 auto 14px;
            }
            .qr-profile-title {
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1px;
                color: #9a9690;
                margin-bottom: 12px;
            }
            .qr-profile-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px 20px;
            }
            .qr-profile-row { font-size: 13px; }
            .qr-profile-row-label { color: #9a9690; display: block; }
            .qr-profile-row-value { font-weight: 700; color: ${CONFIG.colors.headerText}; }
            .qr-why-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 14px;
                padding: 18px 20px;
                max-width: 600px;
                margin: 0 auto 14px;
            }
            .qr-why-title {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1px;
                color: #9a9690;
                margin-bottom: 12px;
            }
            .qr-why-title strong { color: ${CONFIG.colors.headerText}; font-size: 14px; }
            .qr-why-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .qr-why-list li {
                display: flex;
                gap: 8px;
                font-size: 13px;
                line-height: 1.45;
                color: ${CONFIG.colors.bodyText};
            }
            .qr-why-list li::before {
                content: '•';
                color: ${CONFIG.colors.hardColor};
                font-size: 16px;
                line-height: 1.2;
                flex-shrink: 0;
            }
            .qr-flavor-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 14px;
                padding: 18px 20px;
                max-width: 600px;
                margin: 0 auto 14px;
            }
            .qr-flavor-label {
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1px;
                color: #9a9690;
                margin-bottom: 6px;
            }
            .qr-flavor-name {
                font-size: 16px;
                font-weight: 700;
                color: ${CONFIG.colors.softColor};
                margin-bottom: 6px;
            }
            .qr-flavor-desc {
                font-size: 13px;
                color: ${CONFIG.colors.bodyText};
                line-height: 1.5;
            }
            .qr-adjust-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 14px;
                padding: 16px 20px;
                max-width: 600px;
                margin: 0 auto 14px;
            }
            .qr-adjust-title {
                font-size: 12px;
                font-weight: 700;
                color: #7a7a7a;
                margin-bottom: 8px;
            }
            .qr-adjust-rule {
                font-size: 13px;
                color: ${CONFIG.colors.bodyText};
                line-height: 1.5;
            }
            .qr-adjust-rule strong { color: ${CONFIG.colors.headerText}; }
            .qr-products-section {
                max-width: 600px;
                margin: 0 auto 20px;
            }
            .qr-products-title {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1px;
                color: #9a9690;
                margin-bottom: 14px;
            }
            .qr-products-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 12px;
            }
            .qr-product-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 12px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .qr-product-image {
                width: 100%;
                aspect-ratio: 1;
                object-fit: contain;
                background: #fff;
            }
            .qr-product-image-placeholder {
                width: 100%;
                aspect-ratio: 1;
                background: #f0ece3;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #c0b8a8;
                font-size: 12px;
            }
            .qr-product-info {
                padding: 10px;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .qr-product-name {
                font-size: 12px;
                font-weight: 600;
                color: ${CONFIG.colors.headerText};
                line-height: 1.4;
                text-transform: capitalize;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .qr-product-price {
                font-size: 16px;
                font-weight: 700;
                color: #02805b;
            }
            .qr-product-buy {
                display: block;
                text-align: center;
                background: #02805b;
                color: #fff;
                padding: 7px;
                border-radius: 7px;
                font-size: 12px;
                font-weight: 700;
                text-decoration: none;
                margin-top: auto;
                transition: filter 0.15s;
            }
            .qr-product-buy:hover { filter: brightness(1.1); }
            .qr-products-loading {
                text-align: center;
                padding: 20px;
                color: #9a9690;
                font-size: 14px;
            }
            .qr-products-empty {
                text-align: center;
                padding: 20px;
                color: #9a9690;
                font-size: 14px;
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 12px;
            }
            .qr-btn-restart {
                display: block;
                width: 100%;
                max-width: 600px;
                margin: 0 auto 20px;
                padding: 14px;
                background: ${CONFIG.colors.cardBackground};
                border: 1.5px solid ${CONFIG.colors.cardBorder};
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                color: ${CONFIG.colors.bodyText};
                cursor: pointer;
                text-align: center;
                transition: background 0.15s;
            }
            .qr-btn-restart:hover { background: #f0ece3; }

            @media (max-width: 480px) {
                .qr-card { padding: 18px 14px; }
                .qr-profile-grid { grid-template-columns: 1fr; }
                .qr-products-grid { grid-template-columns: repeat(2, 1fr); }
                .qr-step-connector { width: 20px; }
            }
        </style>
    `;

    // ---
    // MAIN CLASS
    // ---
    class ProductRecommendationQuiz {
        constructor() {
            this.container = null;
            this.wrapper = null;
            this.currentStep = 0;
            this.answers = {};
            this.recommendation = null;
        }

        init() {
            this.container = document.getElementById(CONFIG.containerId);
            if (!this.container) {
                console.warn('[QuizZeroPlastic] Container #' + CONFIG.containerId + ' not found.');
                return;
            }
            this.injectStyles();
            this.injectWrapper();
            this.render();
        }

        injectStyles() {
            if (!document.getElementById('quiz-recomendacao-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectWrapper() {
            this.container.innerHTML = '<div id="quiz-recomendacao-wrapper"></div>';
            this.wrapper = this.container.querySelector('#quiz-recomendacao-wrapper');
        }

        // -----
        // RENDER ORCHESTRATOR
        // -----
        render() {
            if (this.recommendation) {
                this._renderResultScreen();
            } else {
                this._renderStepScreen();
            }
        }

        // -----
        // STEP SCREEN
        // -----
        _renderStepScreen() {
            const step = CONFIG.steps[this.currentStep];
            const totalSteps = CONFIG.steps.length;
            const isLastStep = this.currentStep === totalSteps - 1;
            const currentAnswer = this.answers[step.id];

            // multi-select and weight-input on last step can proceed empty / with default
            const hasAnswer = isLastStep
                ? true
                : (step.type === 'weight-input'
                    ? (currentAnswer !== undefined && currentAnswer !== '' && Number(currentAnswer) > 0)
                    : !!currentAnswer);

            let stepContent = '';
            if (step.type === 'single-select') {
                stepContent = this._buildSingleSelect(step);
            } else if (step.type === 'multi-select') {
                stepContent = this._buildMultiSelect(step);
            } else if (step.type === 'weight-input') {
                stepContent = this._buildWeightInput(step);
            }

            const continueLabel = isLastStep ? CONFIG.buttons.seeResult : CONFIG.buttons.continue;

            this.wrapper.innerHTML = `
                ${this._buildHeader()}
                ${this._buildStepper(this.currentStep, totalSteps)}
                ${this._buildScaleBar()}
                <div class="qr-card">
                    <h2 class="qr-step-title">${step.title}</h2>
                    <p class="qr-step-desc">${step.description}</p>
                    ${stepContent}
                </div>
                <div class="qr-nav">
                    <button class="qr-btn-back" id="qr-btn-back">${CONFIG.buttons.back}</button>
                    <button class="qr-btn-continue" id="qr-btn-continue" ${hasAnswer ? '' : 'disabled'}>${continueLabel}</button>
                </div>
                ${this._buildDisclaimer()}
                ${this._buildScaleBottomLegend()}
            `;

            this._setupStepEvents(step);
        }

        _buildSingleSelect(step) {
            const selected = this.answers[step.id] || '';
            const items = step.options.map(function (opt) {
                const isSelected = opt.id === selected;
                const tag = opt.tag ? `<span class="qr-option-tag">${opt.tag}</span>` : '';
                return `
                    <div class="qr-option-card ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}">
                        <span class="qr-option-emoji">${opt.emoji || ''}</span>
                        <div class="qr-option-content">
                            <div class="qr-option-label">${opt.label}</div>
                            <div class="qr-option-desc">${opt.description}</div>
                        </div>
                        ${tag}
                    </div>
                `;
            }).join('');
            return `<div class="qr-options-list">${items}</div>`;
        }

        _buildMultiSelect(step) {
            const selected = this.answers[step.id] || [];
            const items = step.options.map(function (opt) {
                const isSelected = selected.includes(opt.id);
                return `
                    <div class="qr-option-card ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}">
                        <span class="qr-option-emoji">${opt.emoji || ''}</span>
                        <div class="qr-option-content">
                            <div class="qr-option-label">${opt.label}</div>
                            <div class="qr-option-desc">${opt.description}</div>
                        </div>
                        <span class="qr-option-checkbox"><span class="qr-option-checkbox-check">✓</span></span>
                    </div>
                `;
            }).join('');
            const infoBox = step.infoBox ? `<div class="qr-info-box">${step.infoBox}</div>` : '';
            return `<div class="qr-options-list">${items}</div>${infoBox}`;
        }

        _buildWeightInput(step) {
            const currentVal = this.answers[step.id] || '';
            const unit = step.unit || 'kg';
            const placeholder = step.placeholder || '0';
            return `
                <div class="qr-weight-wrap">
                    <input
                        type="number"
                        class="qr-weight-input"
                        id="qr-weight-input"
                        placeholder="${placeholder}"
                        value="${currentVal}"
                        min="${step.min || 0.1}"
                        max="${step.max || 200}"
                        step="0.1"
                    >
                    <span class="qr-weight-unit">${unit}</span>
                </div>
                <p class="qr-weight-hint">Digite o peso em ${unit} e pressione Continuar.</p>
            `;
        }

        _setupStepEvents(step) {
            const self = this;

            const btnBack = document.getElementById('qr-btn-back');
            if (btnBack) {
                if (this.currentStep === 0) {
                    btnBack.disabled = true;
                    btnBack.style.opacity = '0.4';
                    btnBack.style.cursor = 'not-allowed';
                } else {
                    btnBack.addEventListener('click', function () { self.goBack(); });
                }
            }

            const btnContinue = document.getElementById('qr-btn-continue');
            if (btnContinue) {
                btnContinue.addEventListener('click', function () { self.goForward(); });
            }

            if (step.type === 'single-select') {
                this._setupSingleSelectEvents(step);
            } else if (step.type === 'multi-select') {
                this._setupMultiSelectEvents(step);
            } else if (step.type === 'weight-input') {
                this._setupWeightInputEvents(step);
            }
        }

        _setupSingleSelectEvents(step) {
            const self = this;
            const btnContinue = document.getElementById('qr-btn-continue');
            const cards = document.querySelectorAll('.qr-option-card');

            cards.forEach(function (card) {
                card.addEventListener('click', function () {
                    const optionId = card.getAttribute('data-option-id');
                    self.answers[step.id] = optionId;

                    cards.forEach(function (c) { c.classList.remove('selected'); });
                    card.classList.add('selected');

                    if (btnContinue) btnContinue.disabled = false;
                });
            });
        }

        _setupMultiSelectEvents(step) {
            const self = this;
            if (!self.answers[step.id]) self.answers[step.id] = [];

            const cards = document.querySelectorAll('.qr-option-card');
            cards.forEach(function (card) {
                card.addEventListener('click', function () {
                    const optionId = card.getAttribute('data-option-id');
                    const selections = self.answers[step.id];
                    const idx = selections.indexOf(optionId);

                    if (idx === -1) {
                        selections.push(optionId);
                        card.classList.add('selected');
                    } else {
                        selections.splice(idx, 1);
                        card.classList.remove('selected');
                    }
                });
            });
        }

        _setupWeightInputEvents(step) {
            const self = this;
            const input = document.getElementById('qr-weight-input');
            const btnContinue = document.getElementById('qr-btn-continue');
            const min = step.min || 0.1;
            const max = step.max || 200;

            if (!input) return;

            // Restore previously-entered value and update button state
            if (self.answers[step.id]) {
                input.value = self.answers[step.id];
                if (btnContinue) btnContinue.disabled = false;
            }

            input.addEventListener('input', function () {
                const val = parseFloat(input.value);
                const valid = !isNaN(val) && val >= min && val <= max;
                self.answers[step.id] = valid ? val : undefined;
                if (btnContinue) btnContinue.disabled = !valid;
            });

            // Allow pressing Enter to advance
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    const val = parseFloat(input.value);
                    const valid = !isNaN(val) && val >= min && val <= max;
                    if (valid) self.goForward();
                }
            });

            // Focus the input for quick entry
            setTimeout(function () { input.focus(); }, 100);
        }

        // -----
        // RESULT SCREEN
        // -----
        _renderResultScreen() {
            const rec = this.recommendation;
            const durabilityColor = getDurabilityColor(rec.durability);
            const durabilityLabel = getDurabilityLabel(rec.durability);
            const sizeLabel = rec.sizes.map(getSizeLabel).join(' / ');
            const cfg = CONFIG.result;

            const reasonItems = rec.reasons.map(function (r) {
                return `<li>${r}</li>`;
            }).join('');

            // Resolve labels from steps for profile card
            const porteStep = CONFIG.steps.find(function (s) { return s.id === 'porte'; });
            const porteLabel = porteStep
                ? ((porteStep.options.find(function (o) { return o.id === rec.porte; }) || {}).label || rec.porte)
                : rec.porte;

            const ageStep = CONFIG.steps.find(function (s) { return s.id === 'age'; });
            const ageLabel = ageStep
                ? ((ageStep.options.find(function (o) { return o.id === this.answers.age; }, this) || {}).label || '')
                : '';

            const mordidaStep = CONFIG.steps.find(function (s) { return s.id === 'mordida'; });
            const mordidaLabel = mordidaStep
                ? ((mordidaStep.options.find(function (o) { return o.id === this.answers.mordida; }, this) || {}).label || '')
                : '';

            const healthIds = this.answers.health || [];
            const healthStep = CONFIG.steps.find(function (s) { return s.id === 'health'; });
            const healthLabel = healthIds.length === 0
                ? 'Nenhuma'
                : healthIds.map(function (id) {
                    const opt = healthStep && healthStep.options.find(function (o) { return o.id === id; });
                    return opt ? opt.label : id;
                }).join(', ');

            const pesoDisplay = rec.peso ? rec.peso + ' kg' : '—';

            this.wrapper.innerHTML = `
                ${this._buildHeader()}
                <div class="qr-result-card" style="display:none">
                    <h2 class="qr-result-headline">${cfg.headline}</h2>
                    <div class="qr-result-badges">
                        <span class="qr-result-durability-badge" style="background:${durabilityColor};">
                            <span class="qr-dot ${rec.durability}" style="background:#fff;opacity:0.7;"></span>
                            ${durabilityLabel.toUpperCase()}
                        </span>
                        <span class="qr-result-size-badge">
                            🏷️ ${cfg.sizeLabel} ${sizeLabel}
                        </span>
                    </div>
                </div>

                <div class="qr-profile-card">
                    <div class="qr-profile-title">${cfg.profileTitle}</div>
                    <div class="qr-profile-grid">
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.porteLabel}</span><span class="qr-profile-row-value">${porteLabel}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.pesoLabel}</span><span class="qr-profile-row-value">${pesoDisplay}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.ageLabel}</span><span class="qr-profile-row-value">${ageLabel}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.chewStyleLabel}</span><span class="qr-profile-row-value">${mordidaLabel}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.healthLabel}</span><span class="qr-profile-row-value">${healthLabel}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.boneSizeLabel}</span><span class="qr-profile-row-value">${sizeLabel}</span></div>
                    </div>
                </div>

                <div class="qr-why-card" style="display:none">
                    <div class="qr-why-title">${cfg.whyTitle} <strong>${durabilityLabel.toUpperCase()}${cfg.whyTitleSuffix}</strong></div>
                    <ul class="qr-why-list">${reasonItems}</ul>
                </div>

                <div class="qr-flavor-card">
                    <div class="qr-flavor-label">${cfg.flavorTitle}</div>
                    <div class="qr-flavor-name">${rec.flavor.name}</div>
                    <div class="qr-flavor-desc">${rec.flavor.description}</div>
                </div>

                <div class="qr-adjust-card">
                    <div class="qr-adjust-title">${cfg.adjustTitle}</div>
                    <div class="qr-adjust-rule">
                        <strong>${cfg.adjustTooEasy}</strong> ${cfg.adjustTooEasyText}<br>
                        <strong>${cfg.adjustTooFirm}</strong> ${cfg.adjustTooFirmText}
                    </div>
                </div>

                <div class="qr-products-section">
                    <div class="qr-products-title">${cfg.productsTitle}</div>
                    <div id="qr-products-container"><div class="qr-products-loading">Buscando produtos...</div></div>
                </div>

                <button class="qr-btn-restart" id="qr-btn-restart">${CONFIG.buttons.restart}</button>
                ${this._buildDisclaimer()}
            `;

            const self = this;
            const btnRestart = document.getElementById('qr-btn-restart');
            if (btnRestart) {
                btnRestart.addEventListener('click', function () { self.restart(); });
            }

            this._fetchProducts(rec.durability, rec.sizes);
        }

        _fetchProducts(durability, sizes) {
            // sizes is now always an array (e.g. ['MINI', 'SMALL', 'MEDIUM'])
            if (!Array.isArray(sizes)) sizes = [sizes];

            const durabilityTerm = CONFIG.durabilityTerms[durability] || durability;
            const fetchLimit = Math.max(CONFIG.resultsLimit * 5, 40);
            const query = encodeURIComponent(durabilityTerm);
            const url = 'https://www.biobonebrazil.com.br/_search?q=' + query + '&limit=' + fetchLimit;

            const container = document.getElementById('qr-products-container');
            if (!container) return;

            // Collect aliases from ALL applicable size keys
            let rawAliases = [];
            sizes.forEach(function (sKey) {
                const sAliases = (CONFIG.sizeAliases && CONFIG.sizeAliases[sKey]) || [CONFIG.sizeTerms[sKey] || sKey];
                rawAliases = rawAliases.concat(sAliases);
            });

            function normalize(str) {
                return str.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            }

            const normalizedAliases = rawAliases.map(normalize);

            // When searching "Forte", exclude "Extra Forte" (substring collision)
            const excludeTerm = (durability === 'MEDIUM')
                ? normalize(CONFIG.durabilityTerms['HARD'] || 'extra forte')
                : null;

            // Positive assertion: product name must contain the target durability term
            const requireTerm = normalize(durabilityTerm);

            console.group('[QuizZeroPlastic] _fetchProducts — durability:', durability, '| sizes:', sizes);
            console.log('URL:', url);
            console.log('requireTerm:', requireTerm, '| excludeTerm:', excludeTerm);
            console.log('normalizedAliases:', normalizedAliases);

            fetch(url)
                .then(function (response) {
                    if (!response.ok) throw new Error('Search request failed: ' + response.status);
                    return response.json();
                })
                .then(function (data) {
                    let allProducts = data.products || [];
                    console.log('1) Raw API products (' + allProducts.length + '):', allProducts.map(function(p){ return p.name; }));

                    // Exclude HARD products when searching MEDIUM durability
                    if (excludeTerm) {
                        allProducts = allProducts.filter(function (p) {
                            return !normalize(p.name).includes(excludeTerm);
                        });
                        console.log('2) After excludeTerm ("' + excludeTerm + '") filter (' + allProducts.length + '):', allProducts.map(function(p){ return p.name; }));
                    }

                    // Positive durability assertion
                    allProducts = allProducts.filter(function (p) {
                        return normalize(p.name).includes(requireTerm);
                    });
                    console.log('3) After requireTerm ("' + requireTerm + '") filter (' + allProducts.length + '):', allProducts.map(function(p){ return p.name; }));

                    // Filter by size aliases (union of all applicable sizes)
                    let filtered = allProducts.filter(function (p) {
                        const nameLower = normalize(p.name);
                        const matched = normalizedAliases.some(function (alias) {
                            return nameLower.includes(alias);
                        });
                        if (!matched) console.log('   [alias miss] "' + p.name + '" → none of', normalizedAliases, 'found in "' + nameLower + '"');
                        return matched;
                    });
                    console.log('4) After size alias filter (' + filtered.length + '):', filtered.map(function(p){ return p.name; }));

                    const products = filtered.slice(0, CONFIG.resultsLimit);
                    console.log('5) Final products to render (' + products.length + '):', products.map(function(p){ return p.name; }));
                    console.groupEnd();

                    if (products.length === 0) {
                        container.innerHTML = `<div class="qr-products-empty">${CONFIG.result.productsNotFound}</div>`;
                        return;
                    }
                    container.innerHTML = `<div class="qr-products-grid">${products.map(function (p) {
                        return ProductRecommendationQuiz._buildProductCard(p);
                    }).join('')}</div>`;
                })
                .catch(function (err) {
                    console.error('[QuizZeroPlastic] _fetchProducts error:', err);
                    console.groupEnd();
                    container.innerHTML = `<div class="qr-products-empty">${CONFIG.result.productsNotFound}</div>`;
                });
        }

        static _buildProductCard(product) {
            const imageBaseUrl = 'https://cdn.awsli.com.br';
            const imgPath = product.preview_images && product.preview_images[0]
                ? imageBaseUrl + product.preview_images[0]
                : null;
            const price = product.price && product.price.selling
                ? 'R$ ' + product.price.selling.toFixed(2).replace('.', ',')
                : '';
            const imageTag = imgPath
                ? `<img class="qr-product-image" src="${imgPath}" alt="${product.name}" loading="lazy">`
                : `<div class="qr-product-image-placeholder">${CONFIG.result.noImage}</div>`;

            return `
                <div class="qr-product-card">
                    ${imageTag}
                    <div class="qr-product-info">
                        <div class="qr-product-name">${product.name}</div>
                        ${price ? `<div class="qr-product-price">${price}</div>` : ''}
                        <a class="qr-product-buy" href="${product.url}?utm_source=quiz_zero_plastic" target="_blank" rel="noopener">${CONFIG.buttons.buy}</a>
                    </div>
                </div>
            `;
        }

        // -----
        // NAVIGATION
        // -----
        goForward() {
            const step = CONFIG.steps[this.currentStep];
            const isLastStep = this.currentStep === CONFIG.steps.length - 1;

            if (isLastStep) {
                this.recommendation = calculateRecommendation(this.answers);
                this.render();
                this._scrollToTop();
                return;
            }

            if (step.type === 'multi-select') {
                if (!this.answers[step.id]) this.answers[step.id] = [];
            }

            this.currentStep++;
            this.render();
            this._scrollToTop();
        }

        goBack() {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.render();
                this._scrollToTop();
            }
        }

        restart() {
            this.currentStep = 0;
            this.answers = {};
            this.recommendation = null;
            this.render();
            this._scrollToTop();
        }

        _scrollToTop() {
            if (this.container) {
                this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // -----
        // SHARED UI BUILDERS
        // -----
        _buildHeader() {
            return `
                <div class="qr-header">
                    ${CONFIG.badgeLabel ? `<div class="qr-badge">${CONFIG.badgeLabel}</div>` : ''}
                    <h1 class="qr-title">${CONFIG.title}</h1>
                    <p class="qr-subtitle">${CONFIG.subtitle}</p>
                </div>
            `;
        }

        _buildStepper(currentIndex, total) {
            const items = CONFIG.steps.map(function (step, i) {
                const isDone = i < currentIndex;
                const isActive = i === currentIndex;
                const circleClass = isDone ? 'done' : (isActive ? 'active' : '');
                const labelClass = isDone || isActive ? (isDone ? 'done' : 'active') : '';
                const circleContent = isDone ? '✓' : (i + 1);
                const connector = i < total - 1
                    ? `<div class="qr-step-connector ${isDone ? 'done' : ''}"></div>`
                    : '';
                return `
                    <div class="qr-step-item">
                        <div class="qr-step-circle ${circleClass}">${circleContent}</div>
                        <div class="qr-step-label ${labelClass}">${step.stepLabel || step.id.toUpperCase()}</div>
                    </div>
                    ${connector}
                `;
            }).join('');
            return `<div class="qr-stepper">${items}</div>`;
        }

        _buildScaleBar() {
            const levels = CONFIG.scaleLevels.map(function (level) {
                return `
                    <div class="qr-scale-level">
                        <span class="qr-scale-level-name" style="color:${level.color};">● ${level.label}</span>
                        <span class="qr-scale-level-desc">${level.description}</span>
                    </div>
                `;
            }).join('');
            return `
                <div class="qr-scale-bar-wrap">
                    <div class="qr-scale-label">${CONFIG.scaleLabel}</div>
                    <div class="qr-scale-gradient"></div>
                    <div class="qr-scale-legend">${levels}</div>
                </div>
            `;
        }

        _buildDisclaimer() {
            return `<div class="qr-disclaimer">${CONFIG.disclaimer}</div>`;
        }

        _buildScaleBottomLegend() {
            const items = CONFIG.scaleLevels.map(function (level) {
                return `
                    <div class="qr-scale-bottom-item">
                        <span class="qr-dot ${level.key}"></span>
                        <span><strong class="qr-scale-bottom-item-label">${level.label}</strong> <span class="qr-scale-bottom-item-desc">· ${level.description}</span></span>
                    </div>
                `;
            }).join('');
            return `<div class="qr-scale-bottom">${items}</div>`;
        }

        destroy() {
            if (this.container) this.container.innerHTML = '';
            const styleEl = document.getElementById('quiz-recomendacao-styles');
            if (styleEl) styleEl.remove();
        }
    }

    // ---
    // AUTO-INIT
    // ---
    function initQuizZeroPlastic() {
        const instance = new ProductRecommendationQuiz();
        instance.init();
        window.QuizRecomendacao = instance;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuizZeroPlastic);
    } else {
        initQuizZeroPlastic();
    }

})();
