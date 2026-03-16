/**
 * Instagram Feed Plugin - Exibe o feed do Instagram via Behold.so
 *
 * COMO USAR:
 * 1. Acesse behold.so e crie uma conta gratuita
 * 2. Conecte sua conta do Instagram em "Instagram Accounts"
 * 3. Crie um Feed em "Feeds" e copie a "Feed URL"
 *    (ex: https://feeds.behold.so/eyjMtcyMwcoUEs9vJdNB)
 * 4. Cole a URL em CONFIG.feedUrl abaixo
 *
 * Vantagens do Behold vs Basic Display API:
 * - Sem tokens que expiram
 * - URLs de imagem estáveis (CDN próprio do Behold, não expiram)
 * - Dados de perfil completos incluídos (bio, foto, seguidores)
 * - Uma única requisição HTTP
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.InstagramFeedConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {

        // ----------------------------------------
        // FONTE DE DADOS
        // 'behold'    → usa feedUrl (Behold.so CDN, sem token expirando)
        // 'instagram' → usa accessToken (API Graph do Instagram, token de 60 dias)
        // ----------------------------------------
        dataSource: 'behold',

        // URL do feed gerado no Behold.so (usado quando dataSource === 'behold')
        // Ex: 'https://feeds.behold.so/eyjMtcyMwcoUEs9vJdNB'
        feedUrl: '',

        // Token de acesso do Instagram (usado quando dataSource === 'instagram')
        // Obtenha em: https://developers.facebook.com/tools/explorer/
        // ATENÇÃO: token exposto no front-end — restrinja o domínio no painel do app.
        // Long-Lived Token dura 60 dias; implemente refresh server-side para uso contínuo.
        accessToken: '',

        // Onde inserir a seção na página
        insertSelector: 'body',
        insertMethod: 'beforeend', // 'beforeend' | 'afterbegin' | 'beforebegin' | 'afterend'

        // ----------------------------------------
        // CABEÇALHO DE PERFIL
        // Os dados vêm automaticamente da API (bio, foto, seguidores, website).
        // Aqui você define apenas opções de exibição e sobreposições.
        // ----------------------------------------
        showHeader: true,

        profile: {
            // Sobrescreve o nome de exibição (se vazio, usa o username do Instagram)
            displayName: '',

            // Exibe contadores de publicações, seguidores e seguindo
            showStats: true,
            postsLabel:     'publicações',
            followersLabel: 'seguidores',
            followingLabel: 'seguindo',
        },

        // Botão de seguir (link para o perfil no Instagram)
        followButtonText: 'Seguir',
        followButtonUrl:  '', // ex: 'https://www.instagram.com/seuperfil'

        // ----------------------------------------
        // GRID DE POSTS
        // ----------------------------------------
        columns: {
            desktop: 4,  // >= 1024px
            tablet:  3,  // >= 600px
            mobile:  2,  // < 600px
        },
        gap: '3px',

        // Tamanho das imagens no grid: 'small' | 'medium' | 'large' | 'full'
        imageSize: 'medium',

        // Tamanho da imagem no lightbox: 'medium' | 'large' | 'full'
        lightboxImageSize: 'large',

        // Ícone de vídeo sobre posts de vídeo
        showVideoIcon: true,

        // Ícone de carrossel sobre posts de álbum
        showCarouselIcon: true,

        // Overlay com ícones ao passar o mouse
        showHoverOverlay: true,

        // ----------------------------------------
        // LIGHTBOX
        // ----------------------------------------
        showLightbox: true,
        lightboxLinkText: 'Ver no Instagram',

        // ----------------------------------------
        // TEXTOS DE ESTADO
        // ----------------------------------------
        loadingText: 'Carregando feed...',
        errorText:   'Não foi possível carregar o feed do Instagram.',
        emptyText:   'Nenhuma publicação encontrada.',

        // ----------------------------------------
        // CORES
        // ----------------------------------------
        colors: {
            sectionBackground:  'transparent',
            headerText:         '#262626',
            headerSubText:      '#737373',
            statsText:          '#262626',
            followButton:       '#0095f6',
            followButtonText:   '#ffffff',
            gridBackground:     'transparent',
            postOverlay:        'rgba(0, 0, 0, 0.5)',
            postOverlayText:    '#ffffff',
            lightboxOverlay:    'rgba(0, 0, 0, 0.85)',
            lightboxBackground: '#ffffff',
            lightboxText:       '#262626',
            lightboxSubText:    '#737373',
            lightboxLink:       '#0095f6',
            closeButton:        '#ffffff',
            iconColor:          '#ffffff',
            loadingText:        '#737373',
            errorText:          '#ed4956',
            avatarBorder:       '#dbdbdb',
        },
    };

    // ----------------------------------------
    // Merge de configurações
    // ----------------------------------------
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.InstagramFeedConfig && typeof window.InstagramFeedConfig === 'object') {
        Object.assign(CONFIG, window.InstagramFeedConfig);

        if (window.InstagramFeedConfig.colors && typeof window.InstagramFeedConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.InstagramFeedConfig.colors);
        }
        if (window.InstagramFeedConfig.columns && typeof window.InstagramFeedConfig.columns === 'object') {
            CONFIG.columns = Object.assign({}, DEFAULT_CONFIG.columns, window.InstagramFeedConfig.columns);
        }
        if (window.InstagramFeedConfig.profile && typeof window.InstagramFeedConfig.profile === 'object') {
            CONFIG.profile = Object.assign({}, DEFAULT_CONFIG.profile, window.InstagramFeedConfig.profile);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    const SECTION_ID  = 'ig-feed-section';
    const LIGHTBOX_ID = 'ig-feed-lightbox';
    const STYLES_ID   = 'ig-feed-styles';

    // ----------------------------------------
    // CSS
    // ----------------------------------------
    const CSS_STYLES = `
        <style id="${STYLES_ID}">

            /* ---- SECTION ---- */
            #${SECTION_ID} {
                background: ${CONFIG.colors.sectionBackground};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
            }

            .ig-feed-inner {
                max-width: 935px;
                margin: 0 auto;
                padding: 30px 16px;
            }

            /* ---- HEADER ---- */
            .ig-feed-header {
                display: flex;
                align-items: center;
                gap: 20px;
                justify-content:center;
                margin-bottom: 32px;
            }

            /* Avatar com anel gradiente Instagram */
            .ig-feed-avatar-wrap {
                flex-shrink: 0;
                width: 72px;
                height: 72px;
                border-radius: 50%;
                padding: 3px;
                background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
                display: flex;
            }

            .ig-feed-avatar-inner {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                overflow: hidden;
                background: ${CONFIG.colors.sectionBackground};
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2px;
            }

            .ig-feed-avatar-inner img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                border-radius: 50%;
            }

            .ig-feed-avatar-initials {
                font-size: 22px;
                font-weight: 300;
                color: ${CONFIG.colors.headerSubText};
            }

            .ig-feed-profile-info {
                flex: 0 0 auto;
                min-width: 0;
            }

            .ig-feed-profile-top {
                display: flex;
                align-items: center;
                gap: 24px;
                flex-wrap: wrap;
                margin-bottom: 10px;
                width:fit-content;
            }

            /* Bloco nome + handle */
            .ig-feed-name-block {
                display: flex;
                flex-direction: column;
                gap: 2px;
                min-width: 0;
            }

            .ig-feed-username {
                font-size: 16px;
                font-weight: 700;
                color: ${CONFIG.colors.headerText};
                margin: 0;
                word-break: break-word;
                line-height: 1.2;
            }

            .ig-feed-handle {
                font-size: 13px;
                color: ${CONFIG.colors.headerSubText};
                font-weight: 400;
            }

            .ig-feed-follow-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 18px;
                background: ${CONFIG.colors.followButton};
                color: ${CONFIG.colors.followButtonText};
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                white-space: nowrap;
                transition: opacity 0.2s;
                margin-left: auto;
            }

            .ig-feed-follow-btn:hover {
                opacity: 0.85;
            }

            /* Stats empilhados (número + label) */
            .ig-feed-stats {
                display: flex;
                gap: 32px;
            }

            .ig-feed-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                white-space: nowrap;
            }

            .ig-feed-stat strong {
                font-size: 16px;
                font-weight: 600;
                color: ${CONFIG.colors.headerText};
                line-height: 1.2;
            }

            .ig-feed-stat-label {
                font-size: 12px;
                color: ${CONFIG.colors.headerSubText};
                font-weight: 400;
            }

            /* Bio */
            .ig-feed-bio {
                font-size: 14px;
                color: ${CONFIG.colors.headerText};
                line-height: 1.6;
                margin: 0 0 6px;
                word-break: break-word;
                white-space: pre-wrap;
            }

            .ig-feed-website {
                font-size: 14px;
                font-weight: 600;
                color: ${CONFIG.colors.lightboxLink};
                text-decoration: none;
            }

            .ig-feed-website:hover {
                text-decoration: underline;
            }

            /* ---- GRID ---- */
            .ig-feed-grid {
                display: grid;
                grid-template-columns: repeat(${CONFIG.columns.desktop}, 1fr);
                gap: ${CONFIG.gap};
                background: ${CONFIG.colors.gridBackground};
            }

            @media (max-width: 1023px) {
                .ig-feed-grid {
                    grid-template-columns: repeat(${CONFIG.columns.tablet}, 1fr);
                }
            }

            @media (max-width: 599px) {
                .ig-feed-grid {
                    grid-template-columns: repeat(${CONFIG.columns.mobile}, 1fr);
                }
                .ig-feed-header {
                    gap: 14px;
                    margin-bottom: 24px;
                }
                .ig-feed-avatar-wrap {
                    width: 52px;
                    height: 52px;
                }
                .ig-feed-avatar-initials {
                    font-size: 16px;
                }
                .ig-feed-username {
                    font-size: 14px;
                }
                .ig-feed-stats {
                    gap: 16px;
                }
                .ig-feed-stat strong {
                    font-size: 14px;
                }
                .ig-feed-profile-top {
                    gap: 16px;
                }
            }

            /* ---- POST CARD ---- */
            .ig-feed-post {
                position: relative;
                aspect-ratio: 1 / 1;
                overflow: hidden;
                display: block;
                background: #efefef;
                cursor: pointer;
            }

            .ig-feed-post img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                transition: transform 0.3s ease;
            }

            .ig-feed-post:hover img {
                transform: scale(1.04);
            }

            /* Ícone de tipo de mídia (vídeo / carrossel) */
            .ig-feed-type-icon {
                position: absolute;
                top: 8px;
                right: 8px;
                color: ${CONFIG.colors.iconColor};
                pointer-events: none;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
                line-height: 0;
            }

            /* Hover overlay */
            .ig-feed-post-overlay {
                position: absolute;
                inset: 0;
                background: ${CONFIG.colors.postOverlay};
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 24px;
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
            }

            .ig-feed-post:hover .ig-feed-post-overlay {
                opacity: 1;
            }

            .ig-feed-overlay-stat {
                display: flex;
                align-items: center;
                gap: 6px;
                color: ${CONFIG.colors.postOverlayText};
                font-size: 16px;
                font-weight: 600;
            }

            /* Loading / Error */
            .ig-feed-status {
                text-align: center;
                padding: 48px 0;
                font-size: 15px;
            }

            .ig-feed-status.loading {
                color: ${CONFIG.colors.loadingText};
            }

            .ig-feed-status.error {
                color: ${CONFIG.colors.errorText};
            }

            /* ---- LIGHTBOX ---- */
            #${LIGHTBOX_ID} {
                position: fixed;
                inset: 0;
                z-index: 999999;
                background: ${CONFIG.colors.lightboxOverlay};
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.25s ease, visibility 0.25s ease;
            }

            #${LIGHTBOX_ID}.ig-lb-open {
                opacity: 1;
                visibility: visible;
            }

            .ig-lb-content {
                display: flex;
                max-width: 960px;
                width: 100%;
                max-height: 90vh;
                background: ${CONFIG.colors.lightboxBackground};
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }

            .ig-lb-media {
                flex: 0 0 auto;
                width: 60%;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                max-height: 90vh;
                position: relative;
                overflow: hidden;
            }

            .ig-lb-media img {
                width: 100%;
                height: 100%;
                max-height: 90vh;
                object-fit: contain;
                display: block;
            }

            .ig-lb-details {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 20px 16px;
                overflow-y: auto;
                max-height: 90vh;
                min-width: 0;
            }

            .ig-lb-author {
                display: flex;
                align-items: center;
                gap: 12px;
                padding-bottom: 14px;
                border-bottom: 1px solid #efefef;
                margin-bottom: 14px;
                font-size: 14px;
                font-weight: 600;
                color: ${CONFIG.colors.lightboxText};
            }

            .ig-lb-author-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                overflow: hidden;
                flex-shrink: 0;
                background: #efefef;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid ${CONFIG.colors.avatarBorder};
            }

            .ig-lb-author-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .ig-lb-author-initials {
                font-size: 12px;
                color: ${CONFIG.colors.headerSubText};
                font-weight: 600;
            }

            .ig-lb-caption {
                font-size: 14px;
                line-height: 1.6;
                color: ${CONFIG.colors.lightboxText};
                white-space: pre-wrap;
                word-break: break-word;
                flex: 1;
            }

            .ig-lb-caption-empty {
                font-size: 14px;
                color: ${CONFIG.colors.lightboxSubText};
                font-style: italic;
            }

            .ig-lb-footer {
                margin-top: 16px;
                padding-top: 14px;
                border-top: 1px solid #efefef;
            }

            .ig-lb-timestamp {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.03em;
                color: ${CONFIG.colors.lightboxSubText};
                margin-bottom: 8px;
            }

            .ig-lb-link {
                display: inline-block;
                font-size: 14px;
                font-weight: 600;
                color: ${CONFIG.colors.lightboxLink};
                text-decoration: none;
            }

            .ig-lb-link:hover {
                text-decoration: underline;
            }

            /* Close button */
            .ig-lb-close {
                position: fixed;
                top: 16px;
                right: 20px;
                color: ${CONFIG.colors.closeButton};
                background: none;
                border: none;
                font-size: 32px;
                line-height: 1;
                cursor: pointer;
                z-index: 1000000;
                padding: 4px 8px;
                filter: drop-shadow(0 1px 4px rgba(0,0,0,0.6));
                transition: opacity 0.2s;
            }

            .ig-lb-close:hover {
                opacity: 0.75;
            }

            @media (max-width: 700px) {
                .ig-lb-content {
                    flex-direction: column;
                    max-height: 95vh;
                }
                .ig-lb-media {
                    width: 100%;
                    max-height: 55vw;
                }
                .ig-lb-media img {
                    max-height: 55vw;
                }
                .ig-lb-details {
                    max-height: none;
                    padding: 12px;
                }
            }

            /* ---- Carrossel no lightbox ---- */
            .ig-lb-carousel-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.45);
                color: #fff;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 2;
                transition: background 0.2s;
                font-size: 22px;
                line-height: 1;
                padding: 0;
                flex-shrink: 0;
            }
            .ig-lb-carousel-btn:hover { background: rgba(0,0,0,0.72); }
            .ig-lb-carousel-prev { left: 8px; }
            .ig-lb-carousel-next { right: 8px; }

            .ig-lb-carousel-dots {
                position: absolute;
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 5px;
                z-index: 2;
            }
            .ig-lb-carousel-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(255,255,255,0.45);
                transition: background 0.2s;
                cursor: pointer;
            }
            .ig-lb-carousel-dot.active { background: #fff; }

        </style>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class InstagramFeed {

        constructor() {
            this._feedData        = null;
            this._lightboxEl      = null;
            this._lightboxItem    = null;
            this._carouselSlides  = [];
            this._carouselIndex   = 0;
            this._boundKeydown    = this._onKeydown.bind(this);
            this.init();
        }

        init() {
            this._injectStyles();
            this._render();
            this._setupLightbox();
            this._loadData();
        }

        // ----------------------------------------
        // Injeção de estilos
        // ----------------------------------------
        _injectStyles() {
            if (!document.getElementById(STYLES_ID)) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        // ----------------------------------------
        // Esqueleto inicial
        // ----------------------------------------
        _render() {
            const existing = document.getElementById(SECTION_ID);
            if (existing) existing.remove();

            const headerHTML = CONFIG.showHeader ? `<div id="ig-feed-header" class="ig-feed-header"></div>` : '';

            const html = `
                <section id="${SECTION_ID}" aria-label="Feed do Instagram">
                    <div class="ig-feed-inner">
                        ${headerHTML}
                        <div id="ig-feed-grid" class="ig-feed-grid">
                            <div class="ig-feed-status loading" style="grid-column:1/-1">${this._esc(CONFIG.loadingText)}</div>
                        </div>
                    </div>
                </section>
            `;

            const target = document.querySelector(CONFIG.insertSelector) || document.body;
            target.insertAdjacentHTML(CONFIG.insertMethod, html);
        }

        // ----------------------------------------
        // Lightbox
        // ----------------------------------------
        _setupLightbox() {
            if (!CONFIG.showLightbox) return;

            const existing = document.getElementById(LIGHTBOX_ID);
            if (existing) existing.remove();

            const lbHTML = `
                <div id="${LIGHTBOX_ID}" role="dialog" aria-modal="true" aria-label="Post do Instagram">
                    <button class="ig-lb-close" aria-label="Fechar">&#10005;</button>
                    <div class="ig-lb-content">
                        <div class="ig-lb-media" id="ig-lb-media"></div>
                        <div class="ig-lb-details">
                            <div class="ig-lb-author" id="ig-lb-author"></div>
                            <div id="ig-lb-caption"></div>
                            <div class="ig-lb-footer">
                                <p class="ig-lb-timestamp" id="ig-lb-timestamp"></p>
                                <a class="ig-lb-link" id="ig-lb-link" target="_blank" rel="noopener noreferrer">${this._esc(CONFIG.lightboxLinkText)}</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', lbHTML);
            this._lightboxEl = document.getElementById(LIGHTBOX_ID);

            // Close button
            this._lightboxEl.querySelector('.ig-lb-close').addEventListener('click', () => this.closeLightbox());

            // Click on backdrop
            this._lightboxEl.addEventListener('click', (e) => {
                if (e.target === this._lightboxEl) this.closeLightbox();
            });
        }

        // ----------------------------------------
        // Carregamento de dados via Behold
        // ----------------------------------------
        _loadData() {
            if (CONFIG.dataSource === 'instagram') {
                this._loadDataFromInstagram();
                return;
            }

            if (!CONFIG.feedUrl) {
                this._showError('feedUrl não configurado. Defina CONFIG.feedUrl com a URL do seu feed no Behold.so.');
                return;
            }

            fetch(CONFIG.feedUrl)
                .then((r) => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                })
                .then((data) => {
                    this._feedData = data;
                    if (CONFIG.showHeader) this._buildHeader(data);
                    this._buildGrid(data.posts || []);
                })
                .catch((err) => {
                    console.error('[InstagramFeed]', err);
                    this._showError(CONFIG.errorText);
                });
        }

        // ----------------------------------------
        // Carregamento via API Graph do Instagram
        // ----------------------------------------
        _loadDataFromInstagram() {
            const token = CONFIG.accessToken;
            if (!token) {
                this._showError('accessToken não configurado. Defina CONFIG.accessToken com seu token de acesso do Instagram.');
                return;
            }

            const base         = 'https://graph.instagram.com';
            const profileFields = 'id,username,profile_picture_url,followers_count,follows_count,media_count';
            const mediaFields   = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}';

            const profileUrl = `${base}/me?fields=${profileFields}&access_token=${encodeURIComponent(token)}`;
            const mediaUrl   = `${base}/me/media?fields=${mediaFields}&limit=50&access_token=${encodeURIComponent(token)}`;

            Promise.all([
                fetch(profileUrl).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
                fetch(mediaUrl).then((r)   => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
            ])
            .then(([profile, media]) => {
                const data = this._normalizeInstagramData(profile, media);
                this._feedData = data;
                if (CONFIG.showHeader) this._buildHeader(data);
                this._buildGrid(data.posts || []);
            })
            .catch((err) => {
                console.error('[InstagramFeed]', err);
                this._showError(CONFIG.errorText);
            });
        }

        // Normaliza a resposta da API do Instagram para o formato interno (compatível com Behold)
        _normalizeInstagramData(profile, media) {
            const posts = (media.data || []).map((item) => {
                const isVideo    = item.media_type === 'VIDEO';
                const isCarousel = item.media_type === 'CAROUSEL_ALBUM';

                let children;
                if (isCarousel && item.children?.data?.length) {
                    children = item.children.data.map((c) => {
                        const cIsVideo  = c.media_type === 'VIDEO';
                        const cThumbUrl = cIsVideo
                            ? (c.thumbnail_url || c.media_url || '')
                            : (c.media_url || '');
                        return {
                            id:        c.id,
                            mediaType: c.media_type,
                            mediaUrl:  c.media_url || '',
                            sizes: {
                                small:  { mediaUrl: cThumbUrl },
                                medium: { mediaUrl: cThumbUrl },
                                large:  { mediaUrl: cThumbUrl },
                                full:   { mediaUrl: cThumbUrl },
                            },
                        };
                    });
                }

                // Thumbnail para o grid: carrossel → 1.º filho; vídeo → thumbnail_url; imagem → media_url
                let thumbUrl;
                if (isCarousel && children?.length) {
                    thumbUrl = children[0].sizes.medium.mediaUrl;
                } else if (isVideo) {
                    thumbUrl = item.thumbnail_url || '';
                } else {
                    thumbUrl = item.media_url || '';
                }

                const sizes = {
                    small:  { mediaUrl: thumbUrl },
                    medium: { mediaUrl: thumbUrl },
                    large:  { mediaUrl: thumbUrl },
                    full:   { mediaUrl: thumbUrl },
                };

                return {
                    id:            item.id,
                    mediaType:     item.media_type,
                    mediaUrl:      item.media_url   || '',
                    caption:       item.caption     || '',
                    prunedCaption: (item.caption || '').replace(/#\S+/g, '').trim(),
                    permalink:     item.permalink   || '',
                    timestamp:     item.timestamp   || '',
                    sizes,
                    children,
                };
            });

            return {
                username:          profile.username            || '',
                profilePictureUrl: profile.profile_picture_url || '',
                followersCount:    profile.followers_count     ?? null,
                followsCount:      profile.follows_count       ?? null,
                posts,
            };
        }

        // ----------------------------------------
        // Header de perfil
        // ----------------------------------------
        _buildHeader(data) {
            const headerEl = document.getElementById('ig-feed-header');
            if (!headerEl) return;

            const p           = CONFIG.profile;
            const username    = data.username          || '';
            const displayName = p.displayName          || username;
            const bio         = ''//data.biography         || '';
            const website     = ''//data.website           || '';
            const avatarUrl   = data.profilePictureUrl || '';
            const posts       = (data.posts || []).length;
            const followers   = data.followersCount;
            const following   = data.followsCount;
            const initials    = this._getInitials(displayName);

            // Avatar (envolto em .ig-feed-avatar-inner para o anel gradiente)
            let avatarContent = '';
            if (avatarUrl) {
                avatarContent = `<img src="${this._esc(avatarUrl)}" alt="${this._esc(displayName)}" loading="lazy"
                                      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                                 <span class="ig-feed-avatar-initials" style="display:none">${initials}</span>`;
            } else {
                avatarContent = `<span class="ig-feed-avatar-initials">${initials}</span>`;
            }

            // Handle @username
            const handleHTML = username
                ? `<span class="ig-feed-handle">@${this._esc(username)}</span>`
                : '';

            // Stats empilhados (número + label)
            let statsHTML = '';
            if (p.showStats) {
                statsHTML = `<div class="ig-feed-stats">
                    
                    ${followers != null ? `<span class="ig-feed-stat">
                        <strong>${this._numFmt(followers)}</strong>
                        <span class="ig-feed-stat-label">${this._esc(p.followersLabel)}</span>
                    </span>` : ''}
                    ${following != null ? `<span class="ig-feed-stat">
                        <strong>${this._numFmt(following)}</strong>
                        <span class="ig-feed-stat-label">${this._esc(p.followingLabel)}</span>
                    </span>` : ''}
                </div>`;
            }

            // Bio
            const bioHTML = bio ? `<p class="ig-feed-bio">${this._esc(bio)}</p>` : '';

            // Website
            let websiteHTML = '';
            if (website) {
                const label = website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
                websiteHTML = `<a class="ig-feed-website" href="${this._esc(website)}" target="_blank" rel="noopener noreferrer">${this._esc(label)}</a>`;
            }

            // Botão Seguir com ícone do Instagram
            const igIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;
            const followBtn = CONFIG.followButtonUrl
                ? `<a class="ig-feed-follow-btn" href="${this._esc(CONFIG.followButtonUrl)}" target="_blank" rel="noopener noreferrer">${igIcon}${this._esc(CONFIG.followButtonText)}</a>`
                : '';

            headerEl.innerHTML = `
                <div class="ig-feed-avatar-wrap">
                    <div class="ig-feed-avatar-inner">${avatarContent}</div>
                </div>
                <div class="ig-feed-profile-info">
                    <div class="ig-feed-profile-top">
                        <div class="ig-feed-name-block">
                            <h2 class="ig-feed-username">${this._esc(displayName)}</h2>
                            ${handleHTML}
                        </div>
                        ${statsHTML}
                        ${followBtn}
                    </div>
                    ${bioHTML}
                    ${websiteHTML}
                </div>
            `;
        }

        // ----------------------------------------
        // Grid de posts
        // ----------------------------------------
        _buildGrid(posts) {
            const gridEl = document.getElementById('ig-feed-grid');
            if (!gridEl) return;

            if (!posts || posts.length === 0) {
                gridEl.innerHTML = `<div class="ig-feed-status" style="grid-column:1/-1">${this._esc(CONFIG.emptyText)}</div>`;
                return;
            }

            gridEl.innerHTML = posts.map((item) => this._buildPostCard(item)).join('');

            if (CONFIG.showLightbox) {
                gridEl.querySelectorAll('.ig-feed-post').forEach((el) => {
                    const id = el.dataset.postId;
                    el.addEventListener('click', () => {
                        const item = (this._feedData?.posts || []).find((m) => m.id === id);
                        if (item) this.openLightbox(item);
                    });
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            el.click();
                        }
                    });
                });
            }
        }

        _buildPostCard(item) {
            const isVideo    = item.mediaType === 'VIDEO';
            const isCarousel = item.mediaType === 'CAROUSEL_ALBUM';

            // Para vídeos, sizes contém thumbnails estáticos do CDN do Behold.
            // item.mediaUrl raiz é o stream de vídeo — não serve como <img>.
            // Quando missingVideoThumbnail === true o Behold não tem thumbnail; exibimos placeholder.
            let thumb = '';
            if (isVideo) {
                thumb = item.sizes?.[CONFIG.imageSize]?.mediaUrl
                     || item.sizes?.medium?.mediaUrl
                     || item.sizes?.small?.mediaUrl
                     || '';   // vazio → placeholder via onerror
            } else {
                thumb = item.sizes?.[CONFIG.imageSize]?.mediaUrl
                     || item.sizes?.medium?.mediaUrl
                     || item.mediaUrl
                     || '';
            }

            const safeCaption = this._esc((item.caption || '').slice(0, 120));
            const label = safeCaption || (isVideo ? 'Vídeo' : isCarousel ? 'Carrossel' : 'Foto');

            // Ícone de tipo de mídia
            let typeIcon = '';
            if (isVideo && CONFIG.showVideoIcon) {
                typeIcon = `<span class="ig-feed-type-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 6.5l14 5.5-14 5.5V6.5z"/>
                    </svg>
                </span>`;
            } else if (isCarousel && CONFIG.showCarouselIcon) {
                typeIcon = `<span class="ig-feed-type-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="7" width="15" height="15" rx="2"></rect>
                        <path d="M17 2h3a2 2 0 0 1 2 2v11"></path>
                    </svg>
                </span>`;
            }

            const overlayHTML = CONFIG.showHoverOverlay ? `
                <div class="ig-feed-post-overlay" aria-hidden="true">
                    <span class="ig-feed-overlay-stat">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </span>
                    <span class="ig-feed-overlay-stat">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </span>
                </div>` : '';

            const interactive = CONFIG.showLightbox;

            return `
                <div class="ig-feed-post"
                     role="${interactive ? 'button' : 'img'}"
                     tabindex="${interactive ? '0' : '-1'}"
                     data-post-id="${this._esc(item.id)}"
                     aria-label="${label} — Instagram"
                     ${interactive ? '' : 'style="cursor:default"'}>
                    <img src="${this._esc(thumb)}"
                         alt="${safeCaption}"
                         loading="lazy"
                         onerror="this.closest('.ig-feed-post').style.background='#efefef'">
                    ${typeIcon}
                    ${overlayHTML}
                </div>
            `;
        }

        // ----------------------------------------
        // Lightbox
        // ----------------------------------------
        openLightbox(item) {
            if (!CONFIG.showLightbox || !this._lightboxEl) return;

            const data = this._feedData || {};

            // Montar array de slides (carrossel tem children, demais têm slide único)
            const isCarousel = item.mediaType === 'CAROUSEL_ALBUM';
            const children   = isCarousel && item.children?.length ? item.children : [item];
            this._carouselSlides = children.map((c) => {
                if (c.mediaType === 'VIDEO') {
                    return { type: 'video', src: c.mediaUrl || '' };
                }
                return {
                    type: 'image',
                    src: c.sizes?.[CONFIG.lightboxImageSize]?.mediaUrl
                      || c.sizes?.large?.mediaUrl
                      || c.sizes?.medium?.mediaUrl
                      || c.mediaUrl
                      || '',
                };
            });
            this._carouselIndex = 0;
            this._lightboxItem  = item;

            // Renderizar a mídia (com controles se carrossel)
            this._renderCarouselSlide();

            // Autor
            const displayName = CONFIG.profile.displayName || data.username || '';
            const avatarUrl   = data.profilePictureUrl || '';
            const initials    = this._getInitials(displayName);

            let avatarInner = '';
            if (avatarUrl) {
                avatarInner = `<img src="${this._esc(avatarUrl)}" alt="${this._esc(displayName)}"
                                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                               <span class="ig-lb-author-initials" style="display:none">${initials}</span>`;
            } else {
                avatarInner = `<span class="ig-lb-author-initials">${initials}</span>`;
            }
            document.getElementById('ig-lb-author').innerHTML = `
                <div class="ig-lb-author-avatar">${avatarInner}</div>
                <span>${this._esc(displayName)}</span>
            `;

            // Caption (usa prunedCaption — sem hashtags)
            const captionEl = document.getElementById('ig-lb-caption');
            const caption   = item.prunedCaption || item.caption || '';
            captionEl.innerHTML = caption
                ? `<p class="ig-lb-caption">${this._esc(caption)}</p>`
                : `<p class="ig-lb-caption-empty">Sem legenda.</p>`;

            // Timestamp
            const tsEl = document.getElementById('ig-lb-timestamp');
            tsEl.textContent = item.timestamp
                ? new Date(item.timestamp).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
                : '';

            // Permalink
            document.getElementById('ig-lb-link').href = item.permalink || '#';

            // Abrir
            this._lightboxEl.classList.add('ig-lb-open');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', this._boundKeydown);
        }

        _renderCarouselSlide() {
            const mediaEl = document.getElementById('ig-lb-media');
            if (!mediaEl) return;

            // Pausar vídeo anterior antes de trocar slide
            const prevVideo = mediaEl.querySelector('video');
            if (prevVideo) prevVideo.pause();

            const slides  = this._carouselSlides;
            const idx     = this._carouselIndex;
            const slide   = slides[idx];
            const caption = this._esc((this._lightboxItem?.caption || '').slice(0, 120));

            const mediaHTML = slide.type === 'video'
                ? `<video src="${this._esc(slide.src)}" controls playsinline preload="metadata"
                         style="width:100%;height:100%;max-height:90vh;object-fit:contain;display:block" autoplay></video>`
                : `<img src="${this._esc(slide.src)}" alt="${caption}" loading="lazy">`;

            if (slides.length <= 1) {
                mediaEl.innerHTML = mediaHTML;
                return;
            }

            const prevBtn = idx > 0
                ? `<button class="ig-lb-carousel-btn ig-lb-carousel-prev" aria-label="Anterior">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                           <polyline points="15 18 9 12 15 6"></polyline>
                       </svg>
                   </button>`
                : '';
            const nextBtn = idx < slides.length - 1
                ? `<button class="ig-lb-carousel-btn ig-lb-carousel-next" aria-label="Próximo">
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                           <polyline points="9 18 15 12 9 6"></polyline>
                       </svg>
                   </button>`
                : '';
            const dots = slides.map((_, i) =>
                `<span class="ig-lb-carousel-dot${i === idx ? ' active' : ''}" data-i="${i}"></span>`
            ).join('');

            mediaEl.innerHTML = `
                ${mediaHTML}
                ${prevBtn}
                ${nextBtn}
                <div class="ig-lb-carousel-dots">${dots}</div>
            `;

            // Botões de navegação
            const prev = mediaEl.querySelector('.ig-lb-carousel-prev');
            const next = mediaEl.querySelector('.ig-lb-carousel-next');
            if (prev) prev.addEventListener('click', (e) => { e.stopPropagation(); this._carouselNav(-1); });
            if (next) next.addEventListener('click', (e) => { e.stopPropagation(); this._carouselNav(1); });

            // Clique nos dots
            mediaEl.querySelectorAll('.ig-lb-carousel-dot').forEach((dot) => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._carouselIndex = Number(dot.dataset.i);
                    this._renderCarouselSlide();
                });
            });

            // Swipe touch
            let touchX = null;
            mediaEl.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
            mediaEl.addEventListener('touchend', (e) => {
                if (touchX === null) return;
                const diff = touchX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) this._carouselNav(diff > 0 ? 1 : -1);
                touchX = null;
            }, { passive: true });
        }

        _carouselNav(dir) {
            const len = this._carouselSlides.length;
            this._carouselIndex = Math.max(0, Math.min(len - 1, this._carouselIndex + dir));
            this._renderCarouselSlide();
        }

        closeLightbox() {
            if (!this._lightboxEl) return;
            const video = this._lightboxEl.querySelector('video');
            if (video) video.pause();
            this._lightboxEl.classList.remove('ig-lb-open');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', this._boundKeydown);
        }

        _onKeydown(e) {
            if (e.key === 'Escape') { this.closeLightbox(); return; }
            if (this._carouselSlides.length > 1) {
                if (e.key === 'ArrowLeft')  this._carouselNav(-1);
                if (e.key === 'ArrowRight') this._carouselNav(1);
            }
        }

        // ----------------------------------------
        // Helpers
        // ----------------------------------------
        _showError(msg) {
            const gridEl = document.getElementById('ig-feed-grid');
            if (gridEl) {
                gridEl.innerHTML = `<div class="ig-feed-status error" style="grid-column:1/-1">${this._esc(msg)}</div>`;
            }
        }

        _esc(str) {
            if (str == null) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        _getInitials(name) {
            if (!name) return '?';
            const parts = name.replace(/^@/, '').trim().split(/\s+/);
            if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }

        _numFmt(n) {
            if (n == null) return '';
            if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
            if (n >= 1000)    return (n / 1000).toFixed(1).replace('.0', '') + 'K';
            return String(n);
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Recarrega os dados do feed (útil para SPAs ou atualização manual).
         */
        reload() {
            const gridEl = document.getElementById('ig-feed-grid');
            if (gridEl) {
                gridEl.innerHTML = `<div class="ig-feed-status loading" style="grid-column:1/-1">${this._esc(CONFIG.loadingText)}</div>`;
            }
            const headerEl = document.getElementById('ig-feed-header');
            if (headerEl) headerEl.innerHTML = '';
            this._loadData();
        }

        /**
         * Atualiza configurações e reinicializa o plugin.
         * @param {Object} newConfig
         */
        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
            this.reinit();
        }

        /**
         * Reinicializa o plugin.
         */
        reinit() {
            this.destroy();
            this._feedData       = null;
            this._lightboxEl     = null;
            this._lightboxItem   = null;
            this._carouselSlides = [];
            this._carouselIndex  = 0;
            this.init();
        }

        /**
         * Remove completamente o plugin do DOM.
         */
        destroy() {
            document.removeEventListener('keydown', this._boundKeydown);
            document.body.style.overflow = '';

            const section = document.getElementById(SECTION_ID);
            if (section) section.remove();

            const lightbox = document.getElementById(LIGHTBOX_ID);
            if (lightbox) lightbox.remove();

            const styles = document.getElementById(STYLES_ID);
            if (styles) styles.remove();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initInstagramFeed() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.InstagramFeed = new InstagramFeed();
            });
        } else {
            window.InstagramFeed = new InstagramFeed();
        }
    }

    initInstagramFeed();

})();
