/**
 * Blog Vitrine - Vitrine de posts de blog a partir das páginas do rodapé
 * Escaneia o rodapé real da página por um <ul> > <li> > <a> com texto "Blog",
 * remove esse item e todos os <li> seguintes do menu (não podem aparecer como
 * links soltos) e usa essas páginas como posts, cacheando capa/título/resumo
 * de cada uma em sessionStorage. O que é renderizado depende de onde o script
 * está rodando:
 *   - Na página inicial ("/"): vitrine com as últimas N postagens
 *   - Na própria página de uma postagem: compartilhamento + outras postagens
 *   - Na página "Blog" (a que tem o link marcador): todas as postagens, sem
 *     cabeçalho, em grade
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.BlogVitrineConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,

        // Texto do link, no rodapé, que marca o início do blog.
        // Tudo que vier DEPOIS desse <li> na mesma lista é tratado como post
        // e é removido do menu (não pode aparecer como link solto no rodapé).
        blogMarkerText: 'Blog',

        // Onde procurar o <ul> > <li> > <a> do rodapé. Por padrão procura dentro
        // de <footer>; se não existir uma tag <footer> na página, procura no documento inteiro.
        footerSelector: 'footer',

        // Override manual: se definido, usa esse HTML ao invés de escanear o rodapé
        // real da página (útil pra testes)
        footerPagesHTML: null,

        // Override manual: se definido, usa esse pathname ao invés de window.location.pathname
        // pra decidir o contexto da página (útil pra testes)
        testPathname: null,

        // Seletor do container de conteúdo em cada página de post
        // (usado para achar a capa, o h1 e o resumo)
        contentSelector: '.conteudo',

        // Tamanho do resumo, em caracteres
        excerptLength: 150,

        // Onde inserir a vitrine/listagem/compartilhamento
        insertSelector: '.conteudo .caixa-sombreada',
        insertMethod: 'beforeend',

        // Chave usada no sessionStorage para não buscar as páginas de novo
        storageKey: 'blog_vitrine_posts_cache',

        // Página inicial: vitrine com as últimas N postagens
        homeLimit: 3,
        homeSectionTitle: 'Blog',

        // Página de uma postagem: compartilhamento + outras postagens (exceto a atual)
        relatedLimit: 3,
        relatedSectionTitle: 'Outras postagens',
        shareText: 'Compartilhe:',

        // Página "Blog" (o link marcador): todas as postagens, sem cabeçalho
        listingColumns: { desktop: 2, tablet: 2, mobile: 1 },

        // Colunas da vitrine da home e das "outras postagens"
        columns: { desktop: 3, tablet: 2, mobile: 1 },

        colors: {
            titleColor: '#111111',
            cardBackground: '#ffffff',
            cardBorder: '#e5e5e5',
            excerptColor: '#555555',
            shareText: '#333333'
        }
    };

    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.BlogVitrineConfig && typeof window.BlogVitrineConfig === 'object') {
        Object.assign(CONFIG, window.BlogVitrineConfig);

        if (window.BlogVitrineConfig.columns && typeof window.BlogVitrineConfig.columns === 'object') {
            CONFIG.columns = Object.assign({}, DEFAULT_CONFIG.columns, window.BlogVitrineConfig.columns);
        }
        if (window.BlogVitrineConfig.listingColumns && typeof window.BlogVitrineConfig.listingColumns === 'object') {
            CONFIG.listingColumns = Object.assign({}, DEFAULT_CONFIG.listingColumns, window.BlogVitrineConfig.listingColumns);
        }
        if (window.BlogVitrineConfig.colors && typeof window.BlogVitrineConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.BlogVitrineConfig.colors);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // ID único por instância — evita conflito se o script for carregado mais de uma vez na página
    const _instanceId = (window.__bvInstanceCount = (window.__bvInstanceCount || 0) + 1);
    const SECTION_ID = 'blog-vitrine-section-' + _instanceId;
    const GRID_ID = 'blog-vitrine-grid-' + _instanceId;
    const STYLES_ID = 'blog-vitrine-styles-' + _instanceId;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class BlogVitrine {
        constructor() {
            this.posts = [];
            this.section = null;
            this.grid = null;
            this.mode = null;
            this.init();
        }

        init() {
            if (!CONFIG.active) return;
            if (typeof DOMParser === 'undefined' || typeof fetch === 'undefined') return;

            const root = CONFIG.footerPagesHTML
                ? new DOMParser().parseFromString(CONFIG.footerPagesHTML, 'text/html')
                : (document.querySelector(CONFIG.footerSelector) || document);

            // Limpa o rodapé (remove "Blog" e as postagens do menu) em QUALQUER página
            const found = this.extractBlogSection(root);
            if (!found || !found.posts.length) return;

            // Assume que o rodapé lista as postagens em ordem cronológica crescente
            // (a última da lista é a mais recente)
            const latestFirst = found.posts.slice().reverse();

            if (this.isCurrentPage(found.blogUrl)) {
                this.renderListing(latestFirst);
                return;
            }

            const currentPost = found.posts.find(p => this.isCurrentPage(p.url));
            if (currentPost) {
                const others = latestFirst.filter(p => p.url !== currentPost.url).slice(0, CONFIG.relatedLimit);
                this.renderPostFooter(others);
                return;
            }

            if (this.currentPathname() === '/') {
                this.renderHome(latestFirst.slice(0, CONFIG.homeLimit));
            }
        }

        currentPathname() {
            return CONFIG.testPathname || window.location.pathname;
        }

        // Acha <ul> > <li> > <a> com o texto "Blog", remove esse <li> e todos os <li>
        // seguintes na mesma lista (não podem aparecer soltos no menu) e devolve os
        // links dessas páginas para virarem posts
        extractBlogSection(root) {
            const markerText = CONFIG.blogMarkerText.trim().toLowerCase();
            const links = Array.from(root.querySelectorAll('ul > li > a'));
            const blogLink = links.find(a => a.textContent.trim().toLowerCase() === markerText);
            if (!blogLink) return null;

            const blogLi = blogLink.closest('li');
            const blogUrl = blogLink.getAttribute('href');

            const posts = [];
            let sibling = blogLi.nextElementSibling;
            while (sibling && sibling.tagName === 'LI') {
                const next = sibling.nextElementSibling;
                const a = sibling.querySelector('a');
                if (a && a.getAttribute('href') && !a.hasAttribute('data-toggle')) {
                    posts.push({ url: a.getAttribute('href'), listTitle: a.textContent.trim() });
                }
                sibling.remove();
                sibling = next;
            }
            blogLi.remove();

            return { blogUrl, posts };
        }

        isCurrentPage(url) {
            if (!url) return false;
            try {
                return new URL(url, window.location.href).pathname === this.currentPathname();
            } catch (e) {
                return false;
            }
        }

        // ========================================
        // RENDERIZAÇÃO POR CONTEXTO DE PÁGINA
        // ========================================

        // Página inicial: vitrine com título e as últimas N postagens
        renderHome(posts) {
            this.mode = 'home';
            this.injectStyles(CONFIG.columns);
            this.renderSection(`
                <div class="titulo-categoria cor-principal"><strong>${this.escapeHTML(CONFIG.homeSectionTitle)}</strong></div>
                <div id="${GRID_ID}"></div>
            `);
            this.loadPosts(posts);
        }

        // Página "Blog": todas as postagens, sem cabeçalho, em grade de 2 colunas
        renderListing(posts) {
            this.mode = 'listing';
            this.injectStyles(CONFIG.listingColumns);
            this.renderSection(`<div id="${GRID_ID}"></div>`);
            this.loadPosts(posts);
        }

        // Página de uma postagem: compartilhamento + outras postagens (exceto a atual)
        renderPostFooter(otherPosts) {
            this.mode = 'post';
            this.injectStyles(CONFIG.columns);

            const relatedHTML = otherPosts.length ? `
                <div class="titulo-categoria cor-principal"><strong>${this.escapeHTML(CONFIG.relatedSectionTitle)}</strong></div>
                <div id="${GRID_ID}"></div>
            ` : '';

            this.renderSection(this.buildShareHTML() + relatedHTML);

            if (otherPosts.length) this.loadPosts(otherPosts);
        }

        buildShareHTML() {
            const url = window.location.href;
            const titleEl = document.querySelector(CONFIG.contentSelector + ' h1');
            const title = (titleEl ? titleEl.textContent : document.title).trim();
            const encodedUrl = encodeURIComponent(url);
            const encodedTitle = encodeURIComponent(title);

            // Marcas oficiais (Simple Icons, CC0), cada uma como um único path monocromático
            const ICONS = {
                whatsapp: {
                    color: '#25D366',
                    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z'
                },
                facebook: {
                    color: '#1877F2',
                    path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z'
                },
                x: {
                    color: '#000000',
                    path: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z'
                }
            };

            const buildIconLink = (href, network, label) => `
                <a class="bv-share-btn" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">
                    <svg viewBox="0 0 24 24" fill="${ICONS[network].color}" aria-hidden="true"><path d="${ICONS[network].path}"/></svg>
                </a>
            `;

            return `
                <div class="bv-share">
                    <span class="bv-share-label">${this.escapeHTML(CONFIG.shareText)}</span>
                    ${buildIconLink(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, 'whatsapp', 'Compartilhar no WhatsApp')}
                    ${buildIconLink(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, 'facebook', 'Compartilhar no Facebook')}
                    ${buildIconLink(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, 'x', 'Compartilhar no X')}
                </div>
            `;
        }

        // ========================================
        // DOM / ESTILOS
        // ========================================

        injectStyles(columns) {
            if (document.getElementById(STYLES_ID)) return;
            document.head.insertAdjacentHTML('beforeend', this.buildStyles(columns));
        }

        buildStyles(columns) {
            return `
                <style id="${STYLES_ID}">
                    #${SECTION_ID} {
                        margin: 24px 0;
                        font-family: inherit;
                    }

                    #${GRID_ID} {
                        display: grid;
                        grid-template-columns: repeat(${columns.desktop}, 1fr);
                        gap: 20px;
                        margin-top: 16px;
                    }

                    @media (max-width: 1023px) {
                        #${GRID_ID} { grid-template-columns: repeat(${columns.tablet}, 1fr); }
                    }

                    @media (max-width: 599px) {
                        #${GRID_ID} { grid-template-columns: repeat(${columns.mobile}, 1fr); }
                    }

                    .bv-card {
                        display: flex;
                        flex-direction: column;
                        background: ${CONFIG.colors.cardBackground};
                        border: 1px solid ${CONFIG.colors.cardBorder};
                        border-radius: 8px;
                        overflow: hidden;
                        text-decoration: none;
                        color: inherit;
                        transition: box-shadow .2s ease;
                    }

                    .bv-card:hover {
                        box-shadow: 0 4px 14px rgba(0, 0, 0, .08);
                    }

                    .bv-cover {
                        width: 100%;
                        aspect-ratio: 16 / 9;
                        object-fit: cover;
                        display: block;
                        background: #f2f2f2;
                    }

                    .bv-card-body {
                        padding: 14px 16px;
                    }

                    .bv-card-title {
                        margin: 0 0 8px;
                        font-size: 1rem;
                        line-height: 1.3;
                        color: ${CONFIG.colors.titleColor};
                    }

                    .bv-card-excerpt {
                        margin: 0;
                        font-size: .875rem;
                        line-height: 1.5;
                        color: ${CONFIG.colors.excerptColor};
                    }

                    .bv-share {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        flex-wrap: wrap;
                        margin-bottom: 24px;
                    }

                    .bv-share-label {
                        font-size: .875rem;
                        font-weight: 600;
                        color: ${CONFIG.colors.shareText};
                    }

                    .bv-share-btn {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 26px;
                        height: 26px;
                        line-height: 0;
                        opacity: .85;
                        transition: opacity .15s ease, transform .15s ease;
                    }

                    .bv-share-btn:hover {
                        opacity: 1;
                        transform: translateY(-2px);
                    }

                    .bv-share-btn svg {
                        width: 100%;
                        height: 100%;
                        display: block;
                    }
                </style>
            `;
        }

        renderSection(innerHTML) {
            const existing = document.getElementById(SECTION_ID);
            if (existing) existing.remove();

            const html = `<section id="${SECTION_ID}">${innerHTML}</section>`;

            const target = document.querySelector(CONFIG.insertSelector) || document.body;
            target.insertAdjacentHTML(CONFIG.insertMethod, html);

            this.section = document.getElementById(SECTION_ID);
            this.grid = document.getElementById(GRID_ID);
        }

        // ========================================
        // BUSCA E CACHE DOS POSTS
        // ========================================

        // Busca cada post (usando cache de sessão quando disponível) e renderiza
        loadPosts(postLinks) {
            const cache = this.readCache();
            const results = new Array(postLinks.length);

            const pending = postLinks.map((link, index) => {
                const cached = cache[link.url];
                if (cached) {
                    results[index] = cached;
                    return Promise.resolve();
                }
                return this.fetchPost(link).then(post => {
                    if (post) {
                        results[index] = post;
                        cache[link.url] = post;
                    }
                });
            });

            Promise.all(pending).then(() => {
                this.writeCache(cache);
                this.posts = results.filter(Boolean);
                this.renderPosts();
            });
        }

        fetchPost(link) {
            return fetch(link.url)
                .then(r => (r.ok ? r.text() : null))
                .then(html => (html ? this.parsePost(html, link) : null))
                .catch(() => null);
        }

        // Extrai capa (1ª imagem), título (h1) e resumo (150 chars) do conteúdo da página
        parsePost(html, link) {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const content = doc.querySelector(CONFIG.contentSelector);
            if (!content) return null;

            const img = content.querySelector('img');
            const image = img ? (img.getAttribute('src') || '') : '';

            const h1 = content.querySelector('h1') || doc.querySelector('h1');
            const title = h1 ? h1.textContent.trim() : link.listTitle;

            const excerptSource = content.querySelector(':scope > div > div');
            const rawText = excerptSource ? excerptSource.textContent.trim().replace(/\s+/g, ' ') : '';
            const excerpt = rawText.length > CONFIG.excerptLength
                ? rawText.slice(0, CONFIG.excerptLength).trim() + '...'
                : rawText;

            return { url: link.url, title, image, excerpt };
        }

        renderPosts() {
            if (!this.grid) return;

            if (!this.posts.length) {
                if (this.grid) this.grid.remove();
                return;
            }

            this.grid.innerHTML = this.posts.map(post => this.buildCardHTML(post)).join('');
        }

        buildCardHTML(post) {
            const safeTitle = this.escapeHTML(post.title);
            const safeExcerpt = this.escapeHTML(post.excerpt);
            const safeUrl = this.escapeHTML(post.url);
            const coverHTML = post.image
                ? `<img class="bv-cover" src="${this.escapeHTML(post.image)}" alt="${safeTitle}" loading="lazy">`
                : '';

            return `
                <a class="bv-card" href="${safeUrl}">
                    ${coverHTML}
                    <div class="bv-card-body">
                        <h3 class="bv-card-title">${safeTitle}</h3>
                        <p class="bv-card-excerpt">${safeExcerpt}</p>
                    </div>
                </a>
            `;
        }

        readCache() {
            try {
                const raw = sessionStorage.getItem(CONFIG.storageKey);
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                return {};
            }
        }

        writeCache(cache) {
            try {
                sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(cache));
            } catch (e) {
                console.warn('[BlogVitrine] Erro ao salvar cache:', e);
            }
        }

        escapeHTML(str) {
            return String(str == null ? '' : str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Atualiza a configuração do plugin
         */
        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
        }

        /**
         * Remove completamente o plugin
         */
        destroy() {
            if (this.section) this.section.remove();
            const styles = document.getElementById(STYLES_ID);
            if (styles) styles.remove();
        }

        /**
         * Reinicializa o plugin (ignora o cache de sessão)
         */
        reinit() {
            this.destroy();
            this.init();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initBlogVitrine() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.BlogVitrine = new BlogVitrine();
            });
        } else {
            window.BlogVitrine = new BlogVitrine();
        }
    }

    initBlogVitrine();

})();
