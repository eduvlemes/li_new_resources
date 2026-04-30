/**
 * Product Recommendation Quiz - Multi-step configurable quiz for product suggestions
 * Version: 1.0.0
 */

(function () {
    'use strict';

    // ======
    // DEFAULT CONFIG
    // ======
    // The client can define window.QuizRecomendacaoConfig before loading this script
    // to override these settings
    const DEFAULT_CONFIG = {
        containerId: 'quiz-recomendacao',

        // Header text
        title: 'Encontre o Mordedor Ideal',
        subtitle: 'Responda 4 perguntas rápidas para descobrir o BioBone certo para o seu cão.',
        badgeLabel: '🦴 GUIA DE RECOMENDAÇÃO',

        // Scale legend
        scaleLabel: 'ESCALA DE DENSIDADE',
        scaleLevels: [
            { key: 'SOFT',   label: 'Moderada',   description: 'Ideal para filhotes e sêniors', color: '#52b788' },
            { key: 'MEDIUM', label: 'Forte',       description: 'Para adultos, uso diário',       color: '#2d6a4f' },
            { key: 'HARD',   label: 'Extra Forte', description: 'Para mordedores intensos',       color: '#333333' }
        ],

        // Footer disclaimer
        disclaimer: 'Nota: A raça é um ponto de partida. Sempre ajuste de acordo com a intensidade de mordida individual do seu cão, saúde dental e idade. Os valores de força de mordida (PSI) são médias por raça baseadas em pesquisas veterinárias.',

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
            SOFT:   'Moderada',
            MEDIUM: 'Forte',
            HARD:   'Extra Forte'
        },
        sizeTerms: {
            MINI:   'Mini',
            SMALL:  'Pequeno',
            MEDIUM: 'Médio',
            LARGE:  'Grande'
        },

        // Aliases used to filter _search results client-side by size
        // Each array contains substrings to match against product names (case-insensitive, accent-folded)
        sizeAliases: {
            MINI:   ['mini'],
            SMALL:  ['pequeno', 'pequena'],
            MEDIUM: ['médio', 'média', 'medio', 'media', 'grande', 'ossão', 'ossao'],
            LARGE:  ['grande', 'gigante', 'ossão', 'ossao']
        },

        // Max number of product cards to display
        resultsLimit: 8,

        // Result screen labels
        result: {
            headline:           'Recomendamos o BioBone',
            sizeLabel:          'Tamanho:',
            sizeWeightNote:     'Para cães acima de 23 kg',
            profileTitle:       'PERFIL DO SEU CÃO',
            breedLabel:         'Raça:',
            ageLabel:           'Idade:',
            chewStyleLabel:     'Estilo de Mordida:',
            healthLabel:        'Saúde:',
            boneSizeLabel:      'Tamanho do Bone:',
            avgWeightLabel:     'Peso Médio:',
            jawStrengthLabel:   'Força de Mordida',
            psiLow:             'Baixa',
            psiModerate:        'Moderada',
            psiHigh:            'Alta',
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

        // Steps configuration — each step has: id, title, description, type, options
        // types: 'searchable-list' | 'single-select' | 'multi-select'
        steps: [
            {
                id: 'breed',
                stepLabel: 'RAÇA',
                title: 'Qual é a raça do seu cão?',
                description: 'Mais de 200 raças disponíveis. Opções de raças mistas no final da lista.',
                type: 'searchable-list',
                searchPlaceholder: 'Digite para buscar raças...',
                options: null // auto-populated from BREED_DATA
            },
            {
                id: 'age',
                stepLabel: 'IDADE',
                title: 'Quantos anos tem seu cão?',
                description: 'A idade afeta o desenvolvimento da mandíbula e a sensibilidade dental.',
                type: 'single-select',
                options: [
                    { id: 'puppy',  label: 'Menos de 1 ano',  description: 'Filhote',       emoji: '🐾', tag: 'Filhote' },
                    { id: 'young',  label: '1 a 4 anos',      description: 'Adulto jovem',  emoji: '🐕', tag: null },
                    { id: 'adult',  label: '5 a 7 anos',      description: 'Adulto maduro', emoji: '🐕', tag: 'Sênior (raças gigantes 5+ anos)' },
                    { id: 'senior', label: '8 a 10 anos',     description: 'Adulto mais velho', emoji: '🦴', tag: 'Sênior' },
                    { id: 'elder',  label: '11+ anos',        description: 'Anos dourados', emoji: '🦴', tag: 'Sênior' }
                ]
            },
            {
                id: 'chewStyle',
                stepLabel: 'MORDIDA',
                title: 'Como seu cão morde?',
                description: 'Escolha o estilo que melhor descreve a mordida diária dele.',
                type: 'single-select',
                options: [
                    { id: 'gentle',    label: 'Mordedor Suave',     description: 'Mordiscada leve, perde o interesse rapidamente', emoji: '😌' },
                    { id: 'everyday',  label: 'Mordedor Moderado',  description: 'Morde todo dia, pressão moderada',               emoji: '😊' },
                    { id: 'power',     label: 'Mordedor Intenso',   description: 'Destrói brinquedos, mastigação pesada',          emoji: '💪' }
                ]
            },
            {
                id: 'health',
                stepLabel: 'SAÚDE',
                title: 'Alguma consideração de saúde?',
                description: 'Selecione as que se aplicam — ou avance se nenhuma se aplica.',
                type: 'multi-select',
                options: [
                    { id: 'allergies', label: 'Propensão a Alergias',    description: 'Estômago sensível, reações na pele ou intolerâncias alimentares', emoji: '🌿' },
                    { id: 'dental',    label: 'Sensibilidade Dental',    description: 'Dentes quebrados/desgastados, problemas gengivais, trabalho dental recente', emoji: '🦷' }
                ],
                infoBox: 'Boa notícia: o BioBone é 100% natural — sem nylon, borracha ou subprodutos animais. Se seu cão tem alergias, recomendaremos o sabor Cana ou Laranja. Sem alergias? O sabor Carne e Peixe é uma ótima escolha!'
            }
        ],

        // Flavor recommendations
        flavors: {
            allergies: {
                name: 'Cana / Madeira / Laranja',
                description: 'Os sabores Cana, Madeira e Laranja são feitos à base de ingredientes naturais, livres de alérgenos comuns e irresistíveis para cães sensíveis.'
            },
            default: {
                name: 'Carne / Peixe',
                description: 'Os sabores Carne e Peixe são a escolha favorita para a maioria dos cães. Ricos, naturais e irresistíveis.'
            }
        },

        // Size thresholds in lbs
        sizeThresholds: {
            mini:   6,   // < 6 lbs → MINI
            small:  13,  // 6–12 lbs → SMALL
            medium: 50   // 13–49 lbs → MEDIUM; 50+ lbs → LARGE
        },

        // Senior age thresholds by weight in lbs (used for age hint in breed step)
        seniorThresholds: {
            giant:  5,  // 90+ lbs: senior at 5 yrs
            large:  6,  // 50–89 lbs: senior at 6 yrs
            medium: 8,  // 20–49 lbs: senior at 8 yrs
            small:  10  // under 20 lbs: senior at 10 yrs
        },

        colors: {
            background:          '#f4f8f4',
            cardBackground:      '#ffffff',
            cardBorder:          '#d4e4d4',
            headerText:          '#333333',
            bodyText:            '#3a4a3a',
            softColor:           '#52b788',
            mediumColor:         '#2d6a4f',
            hardColor:           '#333333',
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
    // BREED DATA
    // ---
    const BREED_DATA = {
        "Buldogue Francês":                         {psi:180,avgWeight:24,defaultDurability:"MEDIUM"},
        "Labrador Retriever":                       {psi:230,avgWeight:70,defaultDurability:"MEDIUM"},
        "Golden Retriever":                         {psi:190,avgWeight:68,defaultDurability:"MEDIUM"},
        "Pastor Alemão":                            {psi:238,avgWeight:75,defaultDurability:"HARD"},
        "Poodle (Padrão)":                          {psi:180,avgWeight:55,defaultDurability:"MEDIUM"},
        "Poodle (Miniatura/Toy)":                   {psi:100,avgWeight:12,defaultDurability:"SOFT"},
        "Goldendoodle (Mini, abaixo de 16 kg)":     {psi:120,avgWeight:25,defaultDurability:"MEDIUM"},
        "Goldendoodle (Médio, 16–25 kg)":           {psi:170,avgWeight:45,defaultDurability:"MEDIUM"},
        "Goldendoodle (Padrão, 25+ kg)":            {psi:200,avgWeight:65,defaultDurability:"MEDIUM"},
        "Labradoodle (Mini, abaixo de 16 kg)":      {psi:130,avgWeight:25,defaultDurability:"MEDIUM"},
        "Labradoodle (Médio, 16–25 kg)":            {psi:180,avgWeight:45,defaultDurability:"MEDIUM"},
        "Labradoodle (Padrão, 25+ kg)":             {psi:215,avgWeight:65,defaultDurability:"MEDIUM"},
        "Bernedoodle (Mini, abaixo de 16 kg)":      {psi:120,avgWeight:28,defaultDurability:"MEDIUM"},
        "Bernedoodle (Padrão, 25+ kg)":             {psi:200,avgWeight:75,defaultDurability:"MEDIUM"},
        "Aussiedoodle (Mini, abaixo de 16 kg)":     {psi:130,avgWeight:25,defaultDurability:"MEDIUM"},
        "Aussiedoodle (Padrão, 16+ kg)":            {psi:195,avgWeight:50,defaultDurability:"MEDIUM"},
        "Cockapoo":                                 {psi:130,avgWeight:18,defaultDurability:"MEDIUM"},
        "Cavapoo":                                  {psi:90, avgWeight:14,defaultDurability:"SOFT"},
        "Sheepadoodle (Padrão, 25+ kg)":            {psi:200,avgWeight:70,defaultDurability:"MEDIUM"},
        "Schnoodle (Mini, abaixo de 9 kg)":         {psi:100,avgWeight:14,defaultDurability:"MEDIUM"},
        "Schnoodle (Padrão, 9+ kg)":                {psi:160,avgWeight:35,defaultDurability:"MEDIUM"},
        "Maltipoo":                                 {psi:65, avgWeight:9, defaultDurability:"SOFT"},
        "Yorkipoo":                                 {psi:70, avgWeight:8, defaultDurability:"SOFT"},
        "Shih-Poo":                                 {psi:75, avgWeight:12,defaultDurability:"SOFT"},
        "Pomapoo":                                  {psi:60, avgWeight:8, defaultDurability:"SOFT"},
        "Whoodle":                                  {psi:155,avgWeight:35,defaultDurability:"MEDIUM"},
        "Irish Doodle":                             {psi:185,avgWeight:55,defaultDurability:"MEDIUM"},
        "Pomsky":                                   {psi:130,avgWeight:25,defaultDurability:"MEDIUM"},
        "Puggle":                                   {psi:140,avgWeight:22,defaultDurability:"MEDIUM"},
        "Chiweenie":                                {psi:90, avgWeight:9, defaultDurability:"SOFT"},
        "Mix Doodle (Pequeno, abaixo de 11 kg)":    {psi:100,avgWeight:18,defaultDurability:"SOFT"},
        "Mix Doodle (Médio, 11–25 kg)":             {psi:165,avgWeight:40,defaultDurability:"MEDIUM"},
        "Mix Doodle (Grande, 25+ kg)":              {psi:205,avgWeight:65,defaultDurability:"MEDIUM"},
        "Dachshund":                                {psi:120,avgWeight:18,defaultDurability:"MEDIUM"},
        "Beagle":                                   {psi:160,avgWeight:25,defaultDurability:"MEDIUM"},
        "Rottweiler":                               {psi:328,avgWeight:105,defaultDurability:"HARD"},
        "Buldogue Inglês":                          {psi:210,avgWeight:48,defaultDurability:"MEDIUM"},
        "Braco Alemão de Pelo Curto":               {psi:200,avgWeight:58,defaultDurability:"MEDIUM"},
        "Yorkshire Terrier":                        {psi:70, avgWeight:7, defaultDurability:"SOFT"},
        "Pastor Australiano":                       {psi:220,avgWeight:52,defaultDurability:"HARD"},
        "Cane Corso":                               {psi:700,avgWeight:105,defaultDurability:"HARD"},
        "Cavalier King Charles Spaniel":            {psi:80, avgWeight:15,defaultDurability:"SOFT"},
        "Corgi Galês de Pembroke":                  {psi:170,avgWeight:28,defaultDurability:"MEDIUM"},
        "Doberman":                                 {psi:245,avgWeight:85,defaultDurability:"HARD"},
        "Boxer":                                    {psi:230,avgWeight:65,defaultDurability:"HARD"},
        "Schnauzer Miniatura":                      {psi:120,avgWeight:15,defaultDurability:"MEDIUM"},
        "Bernese Mountain Dog":                     {psi:200,avgWeight:95,defaultDurability:"MEDIUM"},
        "Shih Tzu":                                 {psi:75, avgWeight:12,defaultDurability:"SOFT"},
        "Great Dane":                               {psi:238,avgWeight:140,defaultDurability:"MEDIUM"},
        "Pomerânia":                                {psi:60, avgWeight:5, defaultDurability:"SOFT"},
        "Boston Terrier":                           {psi:150,avgWeight:18,defaultDurability:"MEDIUM"},
        "Pastor Americano Miniatura":               {psi:190,avgWeight:32,defaultDurability:"HARD"},
        "Havanese":                                 {psi:75, avgWeight:10,defaultDurability:"SOFT"},
        "Husky Siberiano":                          {psi:320,avgWeight:50,defaultDurability:"HARD"},
        "Chihuahua":                                {psi:55, avgWeight:5, defaultDurability:"SOFT"},
        "Springer Spaniel Inglês":                  {psi:170,avgWeight:48,defaultDurability:"MEDIUM"},
        "Shetland Sheepdog":                        {psi:130,avgWeight:22,defaultDurability:"MEDIUM"},
        "Border Collie":                            {psi:200,avgWeight:38,defaultDurability:"MEDIUM"},
        "Brittany":                                 {psi:170,avgWeight:38,defaultDurability:"MEDIUM"},
        "Cocker Spaniel":                           {psi:145,avgWeight:28,defaultDurability:"MEDIUM"},
        "Malinois Belga":                           {psi:195,avgWeight:62,defaultDurability:"HARD"},
        "Basset Hound":                             {psi:150,avgWeight:55,defaultDurability:"MEDIUM"},
        "Vizsla":                                   {psi:180,avgWeight:52,defaultDurability:"MEDIUM"},
        "Cocker Spaniel Inglês":                    {psi:145,avgWeight:30,defaultDurability:"MEDIUM"},
        "Maltês":                                   {psi:60, avgWeight:6, defaultDurability:"SOFT"},
        "Pug":                                      {psi:140,avgWeight:16,defaultDurability:"MEDIUM"},
        "Collie":                                   {psi:165,avgWeight:62,defaultDurability:"MEDIUM"},
        "Mastiff":                                  {psi:552,avgWeight:180,defaultDurability:"HARD"},
        "West Highland White Terrier":              {psi:120,avgWeight:17,defaultDurability:"MEDIUM"},
        "Shiba Inu":                                {psi:200,avgWeight:22,defaultDurability:"HARD"},
        "Rhodesian Ridgeback":                      {psi:250,avgWeight:80,defaultDurability:"HARD"},
        "Papillon":                                 {psi:60, avgWeight:8, defaultDurability:"SOFT"},
        "Cão de Água Português":                    {psi:210,avgWeight:50,defaultDurability:"HARD"},
        "Bichon Frisé":                             {psi:75, avgWeight:13,defaultDurability:"SOFT"},
        "Newfoundland":                             {psi:240,avgWeight:130,defaultDurability:"MEDIUM"},
        "Dálmata":                                  {psi:200,avgWeight:52,defaultDurability:"MEDIUM"},
        "Australian Cattle Dog":                    {psi:220,avgWeight:40,defaultDurability:"HARD"},
        "Whippet":                                  {psi:100,avgWeight:32,defaultDurability:"MEDIUM"},
        "Weimaraner":                               {psi:220,avgWeight:72,defaultDurability:"HARD"},
        "Bullmastiff":                              {psi:450,avgWeight:120,defaultDurability:"HARD"},
        "Chesapeake Bay Retriever":                 {psi:220,avgWeight:70,defaultDurability:"MEDIUM"},
        "Akita":                                    {psi:400,avgWeight:100,defaultDurability:"HARD"},
        "São Bernardo":                             {psi:260,avgWeight:155,defaultDurability:"MEDIUM"},
        "Bloodhound":                               {psi:200,avgWeight:90,defaultDurability:"MEDIUM"},
        "Soft Coated Wheaten Terrier":              {psi:160,avgWeight:37,defaultDurability:"MEDIUM"},
        "Scottish Terrier":                         {psi:130,avgWeight:20,defaultDurability:"MEDIUM"},
        "Malamute do Alasca":                       {psi:320,avgWeight:82,defaultDurability:"HARD"},
        "Samoieda":                                 {psi:210,avgWeight:50,defaultDurability:"MEDIUM"},
        "Airedale Terrier":                         {psi:200,avgWeight:55,defaultDurability:"HARD"},
        "Bull Terrier":                             {psi:270,avgWeight:58,defaultDurability:"HARD"},
        "Shar-Pei":                                 {psi:180,avgWeight:52,defaultDurability:"MEDIUM"},
        "Braco Alemão de Pelo Duro":                {psi:210,avgWeight:65,defaultDurability:"MEDIUM"},
        "Grande Pirineus":                          {psi:240,avgWeight:100,defaultDurability:"MEDIUM"},
        "Dogue de Bordeaux":                        {psi:556,avgWeight:120,defaultDurability:"HARD"},
        "Corgi Galês de Cardigan":                  {psi:170,avgWeight:30,defaultDurability:"MEDIUM"},
        "Cairn Terrier":                            {psi:110,avgWeight:14,defaultDurability:"MEDIUM"},
        "Pinscher Miniatura":                       {psi:80, avgWeight:9, defaultDurability:"SOFT"},
        "Lhasa Apso":                               {psi:85, avgWeight:14,defaultDurability:"SOFT"},
        "Old English Sheepdog":                     {psi:200,avgWeight:72,defaultDurability:"MEDIUM"},
        "Galgo Italiano":                           {psi:55, avgWeight:9, defaultDurability:"SOFT"},
        "Greater Swiss Mountain Dog":               {psi:250,avgWeight:115,defaultDurability:"HARD"},
        "Chow Chow":                                {psi:220,avgWeight:55,defaultDurability:"HARD"},
        "Irish Wolfhound":                          {psi:230,avgWeight:130,defaultDurability:"MEDIUM"},
        "Irish Setter":                             {psi:195,avgWeight:65,defaultDurability:"MEDIUM"},
        "Schnauzer Gigante":                        {psi:250,avgWeight:75,defaultDurability:"HARD"},
        "Crestado Chinês":                          {psi:50, avgWeight:9, defaultDurability:"SOFT"},
        "Staffordshire Bull Terrier":               {psi:270,avgWeight:32,defaultDurability:"HARD"},
        "Coton de Tulear":                          {psi:70, avgWeight:12,defaultDurability:"SOFT"},
        "Russell Terrier":                          {psi:130,avgWeight:14,defaultDurability:"MEDIUM"},
        "Nova Scotia Duck Tolling Retriever":       {psi:185,avgWeight:42,defaultDurability:"MEDIUM"},
        "Bouvier des Flandres":                     {psi:240,avgWeight:88,defaultDurability:"HARD"},
        "American Staffordshire Terrier":           {psi:270,avgWeight:58,defaultDurability:"HARD"},
        "Rat Terrier":                              {psi:100,avgWeight:18,defaultDurability:"MEDIUM"},
        "Basenji":                                  {psi:140,avgWeight:23,defaultDurability:"MEDIUM"},
        "Border Terrier":                           {psi:120,avgWeight:13,defaultDurability:"MEDIUM"},
        "Schnauzer Padrão":                         {psi:180,avgWeight:40,defaultDurability:"MEDIUM"},
        "Cão Pastor da Anatólia":                   {psi:743,avgWeight:125,defaultDurability:"HARD"},
        "Flat-Coated Retriever":                    {psi:190,avgWeight:65,defaultDurability:"MEDIUM"},
        "Pekingese":                                {psi:75, avgWeight:10,defaultDurability:"SOFT"},
        "Leonberger":                               {psi:250,avgWeight:130,defaultDurability:"MEDIUM"},
        "English Setter":                           {psi:180,avgWeight:62,defaultDurability:"MEDIUM"},
        "Keeshond":                                 {psi:130,avgWeight:38,defaultDurability:"MEDIUM"},
        "Beauceron":                                {psi:230,avgWeight:85,defaultDurability:"HARD"},
        "Lagotto Romagnolo":                        {psi:150,avgWeight:30,defaultDurability:"MEDIUM"},
        "Boykin Spaniel":                           {psi:165,avgWeight:35,defaultDurability:"MEDIUM"},
        "Wire Fox Terrier":                         {psi:120,avgWeight:17,defaultDurability:"MEDIUM"},
        "Mastim Napolitano":                        {psi:500,avgWeight:140,defaultDurability:"HARD"},
        "Borzoi":                                   {psi:160,avgWeight:80,defaultDurability:"MEDIUM"},
        "Japanese Chin":                            {psi:55, avgWeight:8, defaultDurability:"SOFT"},
        "Schipperke":                               {psi:100,avgWeight:13,defaultDurability:"MEDIUM"},
        "Tervueren Belga":                          {psi:195,avgWeight:58,defaultDurability:"HARD"},
        "Welsh Terrier":                            {psi:120,avgWeight:20,defaultDurability:"MEDIUM"},
        "Norwich Terrier":                          {psi:100,avgWeight:12,defaultDurability:"MEDIUM"},
        "Spinone Italiano":                         {psi:175,avgWeight:75,defaultDurability:"MEDIUM"},
        "Bull Terrier Miniatura":                   {psi:200,avgWeight:28,defaultDurability:"HARD"},
        "Toy Fox Terrier":                          {psi:60, avgWeight:6, defaultDurability:"SOFT"},
        "Silky Terrier":                            {psi:70, avgWeight:10,defaultDurability:"SOFT"},
        "Afghan Hound":                             {psi:160,avgWeight:55,defaultDurability:"MEDIUM"},
        "Pointer":                                  {psi:195,avgWeight:58,defaultDurability:"MEDIUM"},
        "Manchester Terrier":                       {psi:110,avgWeight:15,defaultDurability:"MEDIUM"},
        "Gordon Setter":                            {psi:190,avgWeight:65,defaultDurability:"MEDIUM"},
        "Irish Terrier":                            {psi:130,avgWeight:27,defaultDurability:"MEDIUM"},
        "Parson Russell Terrier":                   {psi:130,avgWeight:15,defaultDurability:"MEDIUM"},
        "Tibetan Spaniel":                          {psi:65, avgWeight:12,defaultDurability:"SOFT"},
        "Tibetan Terrier":                          {psi:120,avgWeight:25,defaultDurability:"MEDIUM"},
        "Norwegian Elkhound":                       {psi:190,avgWeight:50,defaultDurability:"MEDIUM"},
        "Brussels Griffon":                         {psi:65, avgWeight:9, defaultDurability:"SOFT"},
        "Mudi":                                     {psi:175,avgWeight:28,defaultDurability:"MEDIUM"},
        "Bracco Italiano":                          {psi:195,avgWeight:70,defaultDurability:"MEDIUM"},
        "Pinscher Alemão":                          {psi:170,avgWeight:35,defaultDurability:"MEDIUM"},
        "Bedlington Terrier":                       {psi:130,avgWeight:20,defaultDurability:"MEDIUM"},
        "Kerry Blue Terrier":                       {psi:160,avgWeight:35,defaultDurability:"MEDIUM"},
        "Black Russian Terrier":                    {psi:280,avgWeight:110,defaultDurability:"HARD"},
        "Boerboel":                                 {psi:450,avgWeight:170,defaultDurability:"HARD"},
        "American Eskimo Dog":                      {psi:110,avgWeight:22,defaultDurability:"MEDIUM"},
        "English Toy Spaniel":                      {psi:60, avgWeight:10,defaultDurability:"SOFT"},
        "American Hairless Terrier":                {psi:85, avgWeight:14,defaultDurability:"SOFT"},
        "Xoloitzcuintli":                           {psi:120,avgWeight:30,defaultDurability:"MEDIUM"},
        "Pastor Belga":                             {psi:195,avgWeight:60,defaultDurability:"HARD"},
        "Norfolk Terrier":                          {psi:90, avgWeight:12,defaultDurability:"SOFT"},
        "Saluki":                                   {psi:140,avgWeight:50,defaultDurability:"MEDIUM"},
        "Black and Tan Coonhound":                  {psi:200,avgWeight:72,defaultDurability:"MEDIUM"},
        "Mastim Tibetano":                          {psi:450,avgWeight:120,defaultDurability:"HARD"},
        "Smooth Fox Terrier":                       {psi:120,avgWeight:17,defaultDurability:"MEDIUM"},
        "Treeing Walker Coonhound":                 {psi:195,avgWeight:60,defaultDurability:"MEDIUM"},
        "Australian Terrier":                       {psi:100,avgWeight:16,defaultDurability:"MEDIUM"},
        "Redbone Coonhound":                        {psi:195,avgWeight:60,defaultDurability:"MEDIUM"},
        "Clumber Spaniel":                          {psi:160,avgWeight:70,defaultDurability:"MEDIUM"},
        "Berger Picard":                            {psi:195,avgWeight:60,defaultDurability:"MEDIUM"},
        "Wirehaired Vizsla":                        {psi:185,avgWeight:55,defaultDurability:"MEDIUM"},
        "Field Spaniel":                            {psi:150,avgWeight:40,defaultDurability:"MEDIUM"},
        "Bluetick Coonhound":                       {psi:195,avgWeight:65,defaultDurability:"MEDIUM"},
        "Bearded Collie":                           {psi:160,avgWeight:48,defaultDurability:"MEDIUM"},
        "Welsh Springer Spaniel":                   {psi:160,avgWeight:42,defaultDurability:"MEDIUM"},
        "Galgo":                                    {psi:150,avgWeight:68,defaultDurability:"MEDIUM"},
        "Ibizan Hound":                             {psi:140,avgWeight:48,defaultDurability:"MEDIUM"},
        "Plott Hound":                              {psi:195,avgWeight:55,defaultDurability:"MEDIUM"},
        "Sealyham Terrier":                         {psi:110,avgWeight:23,defaultDurability:"MEDIUM"},
        "Dandie Dinmont Terrier":                   {psi:100,avgWeight:22,defaultDurability:"MEDIUM"},
        "Lakeland Terrier":                         {psi:120,avgWeight:17,defaultDurability:"MEDIUM"},
        "Affenpinscher":                            {psi:55, avgWeight:8, defaultDurability:"SOFT"},
        "Pharaoh Hound":                            {psi:150,avgWeight:48,defaultDurability:"MEDIUM"},
        "Komondor":                                 {psi:280,avgWeight:100,defaultDurability:"HARD"},
        "Kuvasz":                                   {psi:260,avgWeight:100,defaultDurability:"HARD"},
        "Glen of Imaal Terrier":                    {psi:130,avgWeight:35,defaultDurability:"MEDIUM"},
        "Briard":                                   {psi:210,avgWeight:75,defaultDurability:"MEDIUM"},
        "Irish Water Spaniel":                      {psi:180,avgWeight:58,defaultDurability:"MEDIUM"},
        "Finnish Lapphund":                         {psi:150,avgWeight:38,defaultDurability:"MEDIUM"},
        "Curly-Coated Retriever":                   {psi:200,avgWeight:75,defaultDurability:"MEDIUM"},
        "Norwegian Buhund":                         {psi:150,avgWeight:35,defaultDurability:"MEDIUM"},
        "American Water Spaniel":                   {psi:160,avgWeight:38,defaultDurability:"MEDIUM"},
        "Lowchen":                                  {psi:65, avgWeight:12,defaultDurability:"SOFT"},
        "Swedish Vallhund":                         {psi:150,avgWeight:27,defaultDurability:"MEDIUM"},
        "Polish Lowland Sheepdog":                  {psi:170,avgWeight:40,defaultDurability:"MEDIUM"},
        "Canaan Dog":                               {psi:170,avgWeight:45,defaultDurability:"MEDIUM"},
        "Skye Terrier":                             {psi:110,avgWeight:38,defaultDurability:"MEDIUM"},
        "Pyrenean Shepherd":                        {psi:140,avgWeight:22,defaultDurability:"MEDIUM"},
        "Otterhound":                               {psi:200,avgWeight:100,defaultDurability:"MEDIUM"},
        "Finnish Spitz":                            {psi:130,avgWeight:28,defaultDurability:"MEDIUM"},
        "Cesky Terrier":                            {psi:100,avgWeight:20,defaultDurability:"MEDIUM"},
        "American Foxhound":                        {psi:180,avgWeight:65,defaultDurability:"MEDIUM"},
        "English Foxhound":                         {psi:180,avgWeight:65,defaultDurability:"MEDIUM"},
        "Chinook":                                  {psi:200,avgWeight:65,defaultDurability:"MEDIUM"},
        "Lancashire Heeler":                        {psi:120,avgWeight:13,defaultDurability:"MEDIUM"},
        "Harrier":                                  {psi:170,avgWeight:50,defaultDurability:"MEDIUM"},
        "Icelandic Sheepdog":                       {psi:140,avgWeight:28,defaultDurability:"MEDIUM"},
        "Petit Basset Griffon Vendeen":             {psi:130,avgWeight:33,defaultDurability:"MEDIUM"},
        "Spanish Water Dog":                        {psi:175,avgWeight:40,defaultDurability:"MEDIUM"},
        "Irish Red and White Setter":               {psi:185,avgWeight:58,defaultDurability:"MEDIUM"},
        "Entlebucher Mountain Dog":                 {psi:185,avgWeight:55,defaultDurability:"MEDIUM"},
        "Scottish Deerhound":                       {psi:210,avgWeight:95,defaultDurability:"MEDIUM"},
        "Nederlandse Kooikerhondje":                {psi:130,avgWeight:25,defaultDurability:"MEDIUM"},
        "Pumi":                                     {psi:140,avgWeight:27,defaultDurability:"MEDIUM"},
        "American Pit Bull Terrier":                {psi:240,avgWeight:52,defaultDurability:"HARD"},
        "Pit Bull Mix (Pequeno-Médio, abaixo de 23 kg)":{psi:200,avgWeight:38,defaultDurability:"HARD"},
        "Pit Bull Mix (Médio-Grande, 23+ kg)":      {psi:260,avgWeight:62,defaultDurability:"HARD"},
        "Portuguese Podengo Pequeno":               {psi:90, avgWeight:12,defaultDurability:"SOFT"},
        "Sloughi":                                  {psi:140,avgWeight:48,defaultDurability:"MEDIUM"},
        "Bergamasco Sheepdog":                      {psi:180,avgWeight:70,defaultDurability:"MEDIUM"},
        "Cirneco dell'Etna":                        {psi:110,avgWeight:22,defaultDurability:"MEDIUM"},
        "Sussex Spaniel":                           {psi:150,avgWeight:40,defaultDurability:"MEDIUM"},
        "American English Coonhound":               {psi:190,avgWeight:55,defaultDurability:"MEDIUM"},
        "Pulik":                                    {psi:150,avgWeight:30,defaultDurability:"MEDIUM"},
        "SRD / Vira-lata (Pequeno, abaixo de 9 kg)":{psi:100,avgWeight:14,defaultDurability:"SOFT"},
        "SRD / Vira-lata (Médio, 9–25 kg)":        {psi:180,avgWeight:38,defaultDurability:"MEDIUM"},
        "SRD / Vira-lata (Grande, 25+ kg)":         {psi:235,avgWeight:70,defaultDurability:"MEDIUM"},
        "Outra Raça (Pequeno)":                     {psi:90, avgWeight:14,defaultDurability:"SOFT"},
        "Outra Raça (Médio)":                       {psi:170,avgWeight:38,defaultDurability:"MEDIUM"},
        "Outra Raça (Grande)":                      {psi:220,avgWeight:70,defaultDurability:"MEDIUM"}
    };

    // ---
    // BREED → DOG CEO API SLUG MAP
    // API: https://dog.ceo/api/breed/{slug}/images/random
    // null = no match available (image will be silently skipped)
    // ---
    const BREED_DOG_CEO_MAP = {
        "Affenpinscher":                                    "affenpinscher",
        "Afghan Hound":                                     "hound/afghan",
        "Airedale Terrier":                                 "terrier/airedale",
        "Akita":                                            "akita",
        "American Pit Bull Terrier":                        "terrier/american",
        "American Staffordshire Terrier":                   "terrier/staffordshire",
        "Australian Cattle Dog":                            "cattledog/australian",
        "Aussiedoodle (Mini, abaixo de 16 kg)":             "australian/shepherd",
        "Aussiedoodle (Padrão, 16+ kg)":                    "australian/shepherd",
        "Basenji":                                          "basenji",
        "Basset Hound":                                     "hound/basset",
        "Beagle":                                           "beagle",
        "Bearded Collie":                                   "collie",
        "Bernese Mountain Dog":                             "mountain/bernese",
        "Bernedoodle (Mini, abaixo de 16 kg)":              "mountain/bernese",
        "Bernedoodle (Padrão, 25+ kg)":                     "mountain/bernese",
        "Bichon Frisé":                                     "frise/bichon",
        "Bloodhound":                                       "hound/blood",
        "Boerboel":                                         "mastiff/bull",
        "Border Collie":                                    "collie/border",
        "Border Terrier":                                   "terrier/border",
        "Borzoi":                                           "borzoi",
        "Boston Terrier":                                   "terrier/boston",
        "Bouvier des Flandres":                             "bouvier",
        "Boxer":                                            "boxer",
        "Braco Alemão de Pelo Curto":                       "pointer/german",
        "Braco Alemão de Pelo Duro":                        "pointer/german",
        "Bracco Italiano":                                  "pointer/german",
        "Briard":                                           "briard",
        "Brittany":                                         "spaniel/brittany",
        "Buldogue Francês":                                 "bulldog/french",
        "Buldogue Inglês":                                  "bulldog/english",
        "Bull Terrier":                                     "terrier/bull",
        "Bull Terrier Miniatura":                           "terrier/bull",
        "Bullmastiff":                                      "mastiff/bull",
        "Cairn Terrier":                                    "terrier/cairn",
        "Cane Corso":                                       "mastiff/bull",
        "Cavalier King Charles Spaniel":                    "spaniel/blenheim",
        "Cavapoo":                                          "spaniel/cocker",
        "Chihuahua":                                        "chihuahua",
        "Chiweenie":                                        "chihuahua",
        "Chow Chow":                                        "chow",
        "Clumber Spaniel":                                  "spaniel/cocker",
        "Cockapoo":                                         "spaniel/cocker",
        "Cocker Spaniel":                                   "spaniel/cocker",
        "Cocker Spaniel Inglês":                            "spaniel/cocker",
        "Collie":                                           "collie",
        "Corgi Galês de Cardigan":                          "corgi/cardigan",
        "Corgi Galês de Pembroke":                          "pembroke",
        "Coton de Tulear":                                  "frise/bichon",
        "Crestado Chinês":                                  "mexicanhairless",
        "Curly-Coated Retriever":                           "retriever/curly",
        "Dachshund":                                        "dachshund",
        "Dálmata":                                          "dalmatian",
        "Doberman":                                         "doberman",
        "Dogue de Bordeaux":                                "mastiff/bull",
        "Entlebucher Mountain Dog":                         "mountain/bernese",
        "Flat-Coated Retriever":                            "retriever/flatcoated",
        "Galgo":                                            "greyhound/italian",
        "Galgo Italiano":                                   "greyhound/italian",
        "Golden Retriever":                                 "retriever/golden",
        "Goldendoodle (Mini, abaixo de 16 kg)":             "retriever/golden",
        "Goldendoodle (Médio, 16–25 kg)":                   "retriever/golden",
        "Goldendoodle (Padrão, 25+ kg)":                    "retriever/golden",
        "Grande Pirineus":                                  "pyrenees",
        "Great Dane":                                       "dane/great",
        "Greater Swiss Mountain Dog":                       "mountain/greater",
        "Havanese":                                         "frise/bichon",
        "Husky Siberiano":                                  "husky",
        "Irish Doodle":                                     "setter/irish",
        "Irish Setter":                                     "setter/irish",
        "Irish Terrier":                                    "terrier/irish",
        "Irish Water Spaniel":                              "spaniel/irish",
        "Irish Wolfhound":                                  "wolfhound/irish",
        "Keeshond":                                         "keeshond",
        "Kerry Blue Terrier":                               "terrier/kerryblue",
        "Komondor":                                         "komondor",
        "Kuvasz":                                           "kuvasz",
        "Labrador Retriever":                               "labrador",
        "Labradoodle (Mini, abaixo de 16 kg)":              "labrador",
        "Labradoodle (Médio, 16–25 kg)":                    "labrador",
        "Labradoodle (Padrão, 25+ kg)":                     "labrador",
        "Lakeland Terrier":                                 "terrier/lakeland",
        "Leonberger":                                       "leonberg",
        "Lhasa Apso":                                       "lhasa",
        "Malamute do Alasca":                               "malamute",
        "Malinois Belga":                                   "malinois",
        "Maltês":                                           "maltese",
        "Maltipoo":                                         "maltese",
        "Mastiff":                                          "mastiff/english",
        "Mastim Napolitano":                                "mastiff/english",
        "Mastim Tibetano":                                  "tibetan/mastiff",
        "Mix Doodle (Pequeno, abaixo de 11 kg)":            "mix",
        "Mix Doodle (Médio, 11–25 kg)":                     "mix",
        "Mix Doodle (Grande, 25+ kg)":                      "mix",
        "Newfoundland":                                     "newfoundland",
        "Norfolk Terrier":                                  "terrier/norfolk",
        "Norwegian Elkhound":                               "elkhound/norwegian",
        "Norwich Terrier":                                  "terrier/norwich",
        "Old English Sheepdog":                             "sheepdog/english",
        "Otterhound":                                       "otterhound",
        "Papillon":                                         "papillon",
        "Pastor Alemão":                                    "germanshepherd",
        "Pastor Americano Miniatura":                       "australian/shepherd",
        "Pastor Australiano":                               "australian/shepherd",
        "Pastor Belga":                                     "malinois",
        "Pekingese":                                        "pekinese",
        "Pinscher Alemão":                                  "doberman",
        "Pinscher Miniatura":                               "pinscher/miniature",
        "Pit Bull Mix (Pequeno-Médio, abaixo de 23 kg)":    "terrier/american",
        "Pit Bull Mix (Médio-Grande, 23+ kg)":              "terrier/american",
        "Pointer":                                          "pointer/german",
        "Pomapoo":                                          "pomeranian",
        "Pomerânia":                                        "pomeranian",
        "Pomsky":                                           "pomeranian",
        "Poodle (Miniatura/Toy)":                           "poodle/miniature",
        "Poodle (Padrão)":                                  "poodle/standard",
        "Puggle":                                           "pug",
        "Pug":                                              "pug",
        "Rhodesian Ridgeback":                              "ridgeback/rhodesian",
        "Rottweiler":                                       "rottweiler",
        "Russell Terrier":                                  "terrier/russell",
        "Saluki":                                           "saluki",
        "Samoieda":                                         "samoyed",
        "São Bernardo":                                     "stbernard",
        "Schipperke":                                       "schipperke",
        "Schnauzer Gigante":                                "schnauzer/giant",
        "Schnauzer Miniatura":                              "schnauzer/miniature",
        "Schnauzer Padrão":                                 "schnauzer/standard",
        "Schnoodle (Mini, abaixo de 9 kg)":                 "schnauzer/miniature",
        "Schnoodle (Padrão, 9+ kg)":                        "schnauzer/miniature",
        "Scottish Deerhound":                               "deerhound/scottish",
        "Scottish Terrier":                                 "terrier/scottish",
        "Shar-Pei":                                         "chow",
        "Sheepadoodle (Padrão, 25+ kg)":                    "sheepdog/english",
        "Shetland Sheepdog":                                "sheepdog/shetland",
        "Shiba Inu":                                        "shiba",
        "Shih Tzu":                                         "shihtzu",
        "Shih-Poo":                                         "shihtzu",
        "Silky Terrier":                                    "terrier/silky",
        "Soft Coated Wheaten Terrier":                      "terrier/wheaten",
        "Springer Spaniel Inglês":                          "springer/english",
        "SRD / Vira-lata (Grande, 25+ kg)":                 "mix",
        "SRD / Vira-lata (Médio, 9–25 kg)":                 "mix",
        "SRD / Vira-lata (Pequeno, abaixo de 9 kg)":        "mix",
        "Staffordshire Bull Terrier":                       "terrier/staffordshire",
        "Tervueren Belga":                                  "tervuren",
        "Vizsla":                                           "vizsla",
        "Weimaraner":                                       "weimaraner",
        "Welsh Springer Spaniel":                           "spaniel/welsh",
        "West Highland White Terrier":                      "terrier/westhighland",
        "Whippet":                                          "whippet",
        "Whoodle":                                          "terrier/wheaten",
        "Yorkshire Terrier":                                "terrier/yorkshire",
        "Yorkipoo":                                         "terrier/yorkshire"
    };

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

    function getSizeFromWeight(weight) {
        if (weight < CONFIG.sizeThresholds.mini)   return 'MINI';
        if (weight < CONFIG.sizeThresholds.small)  return 'SMALL';
        if (weight < CONFIG.sizeThresholds.medium) return 'MEDIUM';
        return 'LARGE';
    }

    function getSeniorAge(weight) {
        if (weight >= 90) return CONFIG.seniorThresholds.giant;
        if (weight >= 50) return CONFIG.seniorThresholds.large;
        if (weight >= 20) return CONFIG.seniorThresholds.medium;
        return CONFIG.seniorThresholds.small;
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
        const breedData = BREED_DATA[answers.breed];
        if (!breedData) return null;

        let durability = breedData.defaultDurability;

        // Age modifier
        if (answers.age === 'puppy') {
            durability = stepSofter(durability);
        } else if (answers.age === 'senior' || answers.age === 'elder') {
            if (durability === 'HARD') durability = 'MEDIUM';
        }

        // Chew style override
        if (answers.chewStyle === 'gentle') {
            durability = 'SOFT';
        } else if (answers.chewStyle === 'power') {
            durability = stepHarder(durability);
        }

        // Health modifiers
        const healthSelections = answers.health || [];
        if (healthSelections.includes('dental')) {
            durability = stepSofter(durability);
        }
        const hasAllergies = healthSelections.includes('allergies');

        const size = getSizeFromWeight(breedData.avgWeight);

        // Build reasons list
        const reasons = [];
        const durabilityLabel = getDurabilityLabel(durability);

        reasons.push(answers.breed + ' tem força de mordida de aproximadamente ~' + breedData.psi + ' PSI');

        if (answers.age === 'puppy') {
            reasons.push('Filhotes precisam de mordedores mais macios para os dentes em desenvolvimento');
        } else if (answers.age === 'senior' || answers.age === 'elder') {
            reasons.push('Cães sênior se beneficiam de opções mais macias para proteger os dentes');
        }

        if (answers.chewStyle === 'gentle') {
            reasons.push('Mordedores suaves se dão melhor com opções macias');
        } else if (answers.chewStyle === 'power') {
            reasons.push('Mordedores intensos precisam de maior durabilidade para segurança e longevidade');
        }

        if (healthSelections.includes('dental')) {
            reasons.push('Sensibilidade dental indica uma opção mais macia');
        }

        if (hasAllergies) {
            reasons.push('Para cães com alergias, recomendamos o sabor Cana ou Laranja — à base de ingredientes naturais, sem alérgenos comuns');
        }

        const flavor = hasAllergies ? CONFIG.flavors.allergies : CONFIG.flavors.default;

        return {
            durability: durability,
            size: size,
            flavor: flavor,
            reasons: reasons,
            breedData: breedData,
            breedName: answers.breed
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
                gap: 0;
                margin-bottom: 28px;
                gap:0 1rem;
            }
            .qr-step-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            .qr-step-circle {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #d0cdc7;
                color: #9a9690;
                font-weight: 700;
                font-size: 14px;
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
                font-size: 9px;
                letter-spacing: 0.5px;
                font-weight: 600;
                text-transform: uppercase;
                color: #9a9690;
            }
            .qr-step-label.active, .qr-step-label.done {
                color: ${CONFIG.colors.hardColor};
            }
            .qr-step-connector {
                width: 48px;
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
            .qr-scale-level:nth-child(2) {
                align-items: center;
            }
            .qr-scale-level:nth-child(3) {
                align-items: flex-end;
            }
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
            .qr-breed-hint {
                background: ${CONFIG.colors.headerText};
                color: #fff;
                border-radius: 8px;
                padding: 8px 14px;
                font-size: 12px;
                margin-bottom: 14px;
            }
            .qr-breed-hint strong { color: #f5d98b; }
            .qr-search-input {
                width: 100%;
                padding: 12px 16px;
                border: 1.5px solid ${CONFIG.colors.cardBorder};
                border-radius: 10px;
                font-size: 14px;
                outline: none;
                margin-bottom: 12px;
                transition: border-color 0.2s;
                background: #fff;
                color: ${CONFIG.colors.bodyText};
            }
            .qr-search-input:focus {
                border-color: ${CONFIG.colors.softColor};
            }
            .qr-breed-list {
                max-height: 280px;
                overflow-y: auto;
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 10px;
            }
            .qr-breed-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-bottom: 1px solid ${CONFIG.colors.cardBorder};
                cursor: pointer;
                transition: background 0.15s;
            }
            .qr-breed-item:last-child { border-bottom: none; }
            .qr-breed-item:hover { background: #f8f5ef; }
            .qr-breed-item.selected { background: #eaf7f5; border-left: 3px solid ${CONFIG.colors.softColor}; }
            .qr-breed-name { font-size: 14px; font-weight: 500; color: ${CONFIG.colors.headerText}; }
            .qr-breed-psi { font-size: 12px; color: #9a9690; margin-right: 8px; }
            .qr-breed-badge {
                padding: 3px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                color: #fff;
            }
            .qr-breed-badge.SOFT   { background: ${CONFIG.colors.softColor}; }
            .qr-breed-badge.MEDIUM { background: ${CONFIG.colors.mediumColor}; }
            .qr-breed-badge.HARD   { background: ${CONFIG.colors.hardColor}; }
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
            .qr-result-icon {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                margin: 0 auto 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
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
                margin-bottom: 14px;
            }
            .qr-profile-row {
                font-size: 13px;
            }
            .qr-profile-row-label {
                color: #9a9690;
                display: block;
            }
            .qr-profile-row-value {
                font-weight: 700;
                color: ${CONFIG.colors.headerText};
            }
            .qr-psi-bar-wrap {
                margin-top: 10px;
            }
            .qr-psi-label-row {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #9a9690;
                margin-bottom: 4px;
            }
            .qr-psi-label-row span:nth-child(2) {
                font-weight: 700;
                color: ${CONFIG.colors.headerText};
                font-size: 14px;
            }
            .qr-psi-track {
                height: 8px;
                background: #e8e4de;
                border-radius: 4px;
                overflow: hidden;
            }
            .qr-psi-fill {
                height: 100%;
                border-radius: 4px;
                background: ${CONFIG.colors.softColor};
                transition: width 0.6s ease;
            }
            .qr-psi-extremes {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #9a9690;
                margin-top: 3px;
            }
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

            /* Breed photo widget */
            #qr-breed-photo-wrap {
                margin-bottom: 12px;
                min-height: 0;
            }
            .qr-breed-photo-card {
                display: flex;
                align-items: center;
                gap: 14px;
                background: #eaf7f5;
                border: 1px solid #b2dfd9;
                border-radius: 10px;
                padding: 10px 14px;
                animation: qr-photo-fadein 0.3s ease;
            }
            @keyframes qr-photo-fadein {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .qr-breed-photo-img {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                object-fit: cover;
                flex-shrink: 0;
                border: 2px solid ${CONFIG.colors.softColor};
                background: #f0ece3;
            }
            .qr-breed-photo-info { flex: 1; overflow: hidden; }
            .qr-breed-photo-name {
                font-size: 13px;
                font-weight: 700;
                color: ${CONFIG.colors.headerText};
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .qr-breed-photo-sub {
                font-size: 11px;
                color: #7a7a7a;
                margin-top: 2px;
            }
            .qr-breed-photo-loading {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: #9a9690;
                padding: 6px 2px;
            }

            @media (max-width: 480px) {
                .qr-card { padding: 18px 14px; }
                .qr-profile-grid { grid-template-columns: 1fr; }
                .qr-products-grid { grid-template-columns: repeat(2, 1fr); }
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
            this._boundHandlers = {};

            // Populate breed options for the searchable-list step
            CONFIG.steps.forEach(function (step) {
                if (step.type === 'searchable-list' && step.id === 'breed') {
                    step.options = Object.keys(BREED_DATA).sort(function (a, b) {
                        return a.localeCompare(b, 'pt-BR');
                    });
                }
            });
        }

        init() {
            this.container = document.getElementById(CONFIG.containerId);
            if (!this.container) {
                console.warn('[QuizRecomendacao] Container #' + CONFIG.containerId + ' not found.');
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
            const hasAnswer = isLastStep
                ? true // multi-select: no selection = skipping is valid
                : !!currentAnswer;

            let stepHint = '';
            if (step.id === 'age' && this.answers.breed) {
                const breedData = BREED_DATA[this.answers.breed];
                if (breedData) {
                    const seniorAge = getSeniorAge(breedData.avgWeight);
                    stepHint = `
                        <div class="qr-breed-hint">
                            <strong>${this.answers.breed}</strong> (~${Math.round(breedData.avgWeight * 0.453)} kg, raça de porte ${this._getSizeLabel(breedData.avgWeight)}) — considerado sênior por volta dos ${seniorAge} anos
                        </div>
                    `;
                }
            }

            let stepContent = '';
            if (step.type === 'searchable-list') {
                stepContent = this._buildSearchableList(step);
            } else if (step.type === 'single-select') {
                stepContent = this._buildSingleSelect(step);
            } else if (step.type === 'multi-select') {
                stepContent = this._buildMultiSelect(step);
            }

            const continueLabel = isLastStep ? CONFIG.buttons.seeResult : CONFIG.buttons.continue;

            this.wrapper.innerHTML = `
                ${this._buildHeader()}
                ${this._buildStepper(this.currentStep, totalSteps)}
                ${this._buildScaleBar()}
                <div class="qr-card">
                    <h2 class="qr-step-title">${step.title}</h2>
                    <p class="qr-step-desc">${step.description}</p>
                    ${stepHint}
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

        _buildSearchableList(step) {
            const selected = this.answers[step.id] || '';
            const breeds = step.options || [];

            const rows = breeds.map(function (breedName) {
                const data = BREED_DATA[breedName];
                if (!data) return '';
                const isSelected = breedName === selected;
                const durabilityLabel = getDurabilityLabel(data.defaultDurability);
                return `
                    <div class="qr-breed-item ${isSelected ? 'selected' : ''}" data-breed="${breedName.replace(/"/g, '&quot;')}">
                        <span class="qr-breed-name">${breedName}</span>
                        <span>
                            <span class="qr-breed-psi">~${data.psi} PSI</span>
                            <span class="qr-breed-badge ${data.defaultDurability}">${durabilityLabel.toUpperCase()}</span>
                        </span>
                    </div>
                `;
            }).join('');

            return `
                <input type="text" class="qr-search-input" id="qr-breed-search" placeholder="${step.searchPlaceholder}" value="">
                <div id="qr-breed-photo-wrap"></div>
                <div class="qr-breed-list" id="qr-breed-list">${rows}</div>
            `;
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

        _setupStepEvents(step) {
            const self = this;

            // Back button
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

            // Continue button
            const btnContinue = document.getElementById('qr-btn-continue');
            if (btnContinue) {
                btnContinue.addEventListener('click', function () { self.goForward(); });
            }

            // Step-type specific events
            if (step.type === 'searchable-list') {
                this._setupSearchableListEvents(step);
            } else if (step.type === 'single-select') {
                this._setupSingleSelectEvents(step);
            } else if (step.type === 'multi-select') {
                this._setupMultiSelectEvents(step);
            }
        }

        _setupSearchableListEvents(step) {
            const self = this;
            const searchInput = document.getElementById('qr-breed-search');
            const list = document.getElementById('qr-breed-list');
            const btnContinue = document.getElementById('qr-btn-continue');

            if (searchInput) {
                searchInput.addEventListener('input', function () {
                    const query = searchInput.value.toLowerCase().trim();
                    const items = list.querySelectorAll('.qr-breed-item');
                    items.forEach(function (item) {
                        const name = item.getAttribute('data-breed').toLowerCase();
                        item.style.display = name.includes(query) ? '' : 'none';
                    });
                });
            }

            if (list) {
                list.addEventListener('click', function (e) {
                    const item = e.target.closest('.qr-breed-item');
                    if (!item) return;
                    const breedName = item.getAttribute('data-breed');
                    self.answers[step.id] = breedName;

                    list.querySelectorAll('.qr-breed-item').forEach(function (el) {
                        el.classList.remove('selected');
                    });
                    item.classList.add('selected');

                    if (btnContinue) btnContinue.disabled = false;
                    self._showBreedPhoto(breedName);
                });

                // Scroll to selected item
                const selected = list.querySelector('.qr-breed-item.selected');
                if (selected) {
                    setTimeout(function () {
                        selected.scrollIntoView({ block: 'nearest' });
                    }, 50);
                }

                // Show photo for pre-existing selection (e.g. user went back)
                if (self.answers[step.id]) {
                    self._showBreedPhoto(self.answers[step.id]);
                }
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

        // -----
        // BREED PHOTO
        // -----
        _showBreedPhoto(breedName) {
            const wrap = document.getElementById('qr-breed-photo-wrap');
            if (!wrap) return;

            const slug = BREED_DOG_CEO_MAP[breedName];
            if (!slug) {
                wrap.innerHTML = '';
                return;
            }

            const breedData = BREED_DATA[breedName] || {};
            const durabilityLabel = getDurabilityLabel(breedData.defaultDurability || '');
            const weightKg = breedData.avgWeight ? Math.round(breedData.avgWeight * 0.453) + ' kg' : '';

            wrap.innerHTML = '<div class="qr-breed-photo-loading"><span>🔍</span> Buscando foto...</div>';

            fetch('https://dog.ceo/api/breed/' + slug + '/images/random')
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.status === 'success' && data.message) {
                        wrap.innerHTML = `
                            <div class="qr-breed-photo-card">
                                <img class="qr-breed-photo-img" src="${data.message}" alt="${breedName}" loading="lazy">
                                <div class="qr-breed-photo-info">
                                    <div class="qr-breed-photo-name">${breedName}</div>
                                    <div class="qr-breed-photo-sub">${weightKg ? '~' + weightKg : ''}${weightKg && durabilityLabel ? ' · ' : ''}${durabilityLabel ? durabilityLabel : ''}</div>
                                </div>
                            </div>
                        `;
                    } else {
                        wrap.innerHTML = '';
                    }
                })
                .catch(function () { wrap.innerHTML = ''; });
        }

        // -----
        // RESULT SCREEN
        // -----
        _renderResultScreen() {
            const rec = this.recommendation;
            const durabilityColor = getDurabilityColor(rec.durability);
            const durabilityLabel = getDurabilityLabel(rec.durability);
            const sizeLabel = getSizeLabel(rec.size);
            const cfg = CONFIG.result;

            // PSI bar: scale 0–800 max
            const psiPercent = Math.min(100, Math.round((rec.breedData.psi / 800) * 100));

            const reasonItems = rec.reasons.map(function (r) {
                return `<li>${r}</li>`;
            }).join('');

            const ageOption = CONFIG.steps.find(function (s) { return s.id === 'age'; });
            const ageLabel = ageOption
                ? (ageOption.options.find(function (o) { return o.id === this.answers.age; }, this) || {}).label || ''
                : '';
            const chewOption = CONFIG.steps.find(function (s) { return s.id === 'chewStyle'; });
            const chewLabel = chewOption
                ? (chewOption.options.find(function (o) { return o.id === this.answers.chewStyle; }, this) || {}).label || ''
                : '';
            const healthIds = this.answers.health || [];
            const healthStep = CONFIG.steps.find(function (s) { return s.id === 'health'; });
            const healthLabel = healthIds.length === 0
                ? 'Nenhuma'
                : healthIds.map(function (id) {
                    const opt = healthStep && healthStep.options.find(function (o) { return o.id === id; });
                    return opt ? opt.label : id;
                }).join(', ');

            const weightKg = Math.round(rec.breedData.avgWeight * 0.453);

            this.wrapper.innerHTML = `
                ${this._buildHeader()}
                <div class="qr-result-card">
                    
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
                    <p class="qr-result-weight-note">Para cães de até ~${weightKg} kg</p>
                </div>

                <div class="qr-profile-card">
                    <div class="qr-profile-title">${cfg.profileTitle}</div>
                    <div class="qr-profile-grid">
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.breedLabel}</span><span class="qr-profile-row-value">${rec.breedName}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.ageLabel}</span><span class="qr-profile-row-value">${ageLabel}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.chewStyleLabel}</span><span class="qr-profile-row-value">${chewLabel}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.boneSizeLabel}</span><span class="qr-profile-row-value">${sizeLabel}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.healthLabel}</span><span class="qr-profile-row-value">${healthLabel}</span></div>
                        <div class="qr-profile-row"><span class="qr-profile-row-label">${cfg.avgWeightLabel}</span><span class="qr-profile-row-value">~${weightKg} kg</span></div>
                    </div>
                    <div class="qr-psi-bar-wrap">
                        <div class="qr-psi-label-row">
                            <span>${cfg.jawStrengthLabel}</span>
                            <span>${rec.breedData.psi} PSI</span>
                        </div>
                        <div class="qr-psi-track">
                            <div class="qr-psi-fill" style="width:${psiPercent}%; background:${durabilityColor};"></div>
                        </div>
                        <div class="qr-psi-extremes"><span>${cfg.psiLow}</span><span>${cfg.psiModerate}</span><span>${cfg.psiHigh}</span></div>
                    </div>
                </div>

                <div class="qr-why-card">
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

            this._fetchProducts(rec.durability, rec.size);
        }

        _fetchProducts(durability, size) {
            const durabilityTerm = CONFIG.durabilityTerms[durability] || durability;
            // Fetch a larger pool so client-side size filtering has enough candidates
            const fetchLimit = Math.max(CONFIG.resultsLimit * 5, 40);
            const query = encodeURIComponent(durabilityTerm);
            const url = 'https://www.biobonebrazil.com.br/_search?q=' + query + '&limit=' + fetchLimit;

            const container = document.getElementById('qr-products-container');
            if (!container) return;

            // Resolve size aliases for client-side filtering
            const aliases = (CONFIG.sizeAliases && CONFIG.sizeAliases[size])
                ? CONFIG.sizeAliases[size]
                : [CONFIG.sizeTerms[size] || size];

            function normalize(str) {
                return str.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            }

            const normalizedAliases = aliases.map(normalize);

            // When searching for MEDIUM ("Forte"), exclude "Extra Forte" products
            // because "forte" is a substring of "extra forte" in the API results
            const excludeTerm = (durability === 'MEDIUM') ? normalize(CONFIG.durabilityTerms['HARD'] || 'extra forte') : null;

            fetch(url)
                .then(function (response) {
                    if (!response.ok) throw new Error('Search request failed');
                    return response.json();
                })
                .then(function (data) {
                    let allProducts = data.products || [];

                    // Exclude higher-durability products when searching for a lower tier
                    if (excludeTerm) {
                        allProducts = allProducts.filter(function (p) {
                            return !normalize(p.name).includes(excludeTerm);
                        });
                    }

                    // Filter by size aliases
                    const filtered = allProducts.filter(function (p) {
                        const nameLower = normalize(p.name);
                        return normalizedAliases.some(function (alias) {
                            return nameLower.includes(alias);
                        });
                    });

                    const products = filtered.slice(0, CONFIG.resultsLimit);

                    if (products.length === 0) {
                        container.innerHTML = `<div class="qr-products-empty">${CONFIG.result.productsNotFound}</div>`;
                        return;
                    }
                    container.innerHTML = `<div class="qr-products-grid">${products.map(function (p) {
                        return ProductRecommendationQuiz._buildProductCard(p);
                    }).join('')}</div>`;
                })
                .catch(function () {
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
                        <a class="qr-product-buy" href="${product.url}?utm_search=tipo_mordida" target="_blank" rel="noopener">${CONFIG.buttons.buy}</a>
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
                    <div class="qr-badge">${CONFIG.badgeLabel}</div>
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

        _getSizeLabel(weightLbs) {
            if (weightLbs < 20) return 'pequeno';
            if (weightLbs < 50) return 'médio';
            if (weightLbs < 90) return 'grande';
            return 'gigante';
        }

        // -----
        // PUBLIC API
        // -----
        destroy() {
            if (this.container) {
                this.container.innerHTML = '';
            }
            const styleEl = document.getElementById('quiz-recomendacao-styles');
            if (styleEl) styleEl.remove();
        }

        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
        }
    }

    // ---
    // AUTO-INIT
    // ---
    function initQuizRecomendacao() {
        const instance = new ProductRecommendationQuiz();
        instance.init();
        window.QuizRecomendacao = instance;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuizRecomendacao);
    } else {
        initQuizRecomendacao();
    }

})();
