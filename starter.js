/**
 * Sistema Starter - Carregamento Condicional de Recursos
 * 
 * Este script permite carregar diferentes recursos (scripts, estilos, etc.)
 * baseado em condições específicas definidas pelo cliente.
 */

(function() {
    'use strict';

    // ========================================
    // SISTEMA DE CARREGAMENTO DE RECURSOS
    // ========================================
    
    class ResourceLoader {
        constructor() {
            this.loadedResources = new Set();
            this.loadingPromises = new Map();
        }

        // Carrega um script JavaScript
        async loadScript(url, id = null) {
            if (this.loadedResources.has(url)) {
                return Promise.resolve();
            }

            if (this.loadingPromises.has(url)) {
                return this.loadingPromises.get(url);
            }

            const promise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                
                if (id) {
                    script.id = id;
                }

                script.onload = () => {
                    this.loadedResources.add(url);
                    resolve();
                };

                script.onerror = () => {
                    reject(new Error(`Falha ao carregar script: ${url}`));
                };

                document.head.appendChild(script);
            });

            this.loadingPromises.set(url, promise);
            return promise;
        }

        // Carrega um arquivo CSS
        async loadCSS(url, id = null) {
            if (this.loadedResources.has(url)) {
                return Promise.resolve();
            }

            if (this.loadingPromises.has(url)) {
                return this.loadingPromises.get(url);
            }

            const promise = new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                
                if (id) {
                    link.id = id;
                }

                link.onload = () => {
                    this.loadedResources.add(url);
                    resolve();
                };

                link.onerror = () => {
                    reject(new Error(`Falha ao carregar CSS: ${url}`));
                };

                document.head.appendChild(link);
            });

            this.loadingPromises.set(url, promise);
            return promise;
        }

        // Executa código JavaScript inline
        executeInlineScript(code) {
            try {
                const script = document.createElement('script');
                script.textContent = code;
                document.head.appendChild(script);
                document.head.removeChild(script); // Remove após execução
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(new Error(`Erro ao executar script inline: ${error.message}`));
            }
        }
    }

    // ========================================
    // SISTEMA DE CONDIÇÕES
    // ========================================
    
    class ConditionEvaluator {
        constructor() {
            this.conditions = {
                // Condições de página
                'page.url.contains': (value) => window.location.href.includes(value),
                'page.url.equals': (value) => window.location.href === value,
                'page.pathname.contains': (value) => window.location.pathname.includes(value),
                'page.pathname.equals': (value) => window.location.pathname === value,
                'page.hash.contains': (value) => window.location.hash.includes(value),
                'page.search.contains': (value) => window.location.search.includes(value),
                
                // Condições de DOM
                'dom.element.exists': (selector) => document.querySelector(selector) !== null,
                'dom.element.count.greater': (data) => document.querySelectorAll(data.selector).length > data.count,
                'dom.element.count.equals': (data) => document.querySelectorAll(data.selector).length === data.count,
                'dom.element.has.class': (data) => {
                    const element = document.querySelector(data.selector);
                    return element && element.classList.contains(data.className);
                },
                'dom.element.has.text': (data) => {
                    const element = document.querySelector(data.selector);
                    return element && element.textContent.includes(data.text);
                },
                
                // Condições de tempo
                'time.after': (dateStr) => new Date() > new Date(dateStr),
                'time.before': (dateStr) => new Date() < new Date(dateStr),
                'time.between': (data) => {
                    const now = new Date();
                    return now >= new Date(data.start) && now <= new Date(data.end);
                },
                'time.hour.between': (data) => {
                    const hour = new Date().getHours();
                    return hour >= data.start && hour <= data.end;
                },
                'time.day.of.week': (dayNum) => new Date().getDay() === dayNum, // 0 = domingo, 1 = segunda, etc.
                
                // Condições de dispositivo
                'device.mobile': () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                'device.desktop': () => !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                'device.screen.width.greater': (width) => window.screen.width > width,
                'device.screen.width.less': (width) => window.screen.width < width,
                'device.viewport.width.greater': (width) => window.innerWidth > width,
                'device.viewport.width.less': (width) => window.innerWidth < width,
                
                // Condições de localStorage/sessionStorage
                'storage.local.exists': (key) => localStorage.getItem(key) !== null,
                'storage.local.equals': (data) => localStorage.getItem(data.key) === data.value,
                'storage.session.exists': (key) => sessionStorage.getItem(key) !== null,
                'storage.session.equals': (data) => sessionStorage.getItem(data.key) === data.value,
                
                // Condições de cookies
                'cookie.exists': (name) => document.cookie.split(';').some(cookie => cookie.trim().startsWith(name + '=')),
                'cookie.equals': (data) => {
                    const cookies = document.cookie.split(';');
                    const cookie = cookies.find(c => c.trim().startsWith(data.name + '='));
                    return cookie && cookie.split('=')[1] === data.value;
                },
                
                // Condições personalizadas (função)
                'custom': (func) => typeof func === 'function' ? func() : false,
                
                // Condições sempre verdadeiras/falsas
                'always': () => true,
                'never': () => false
            };
        }

        // Avalia uma condição
        evaluate(condition) {
            if (!condition || typeof condition !== 'object') {
                return false;
            }

            const { type, value, operator = 'and' } = condition;

            // Se é um array de condições, avalia todas
            if (Array.isArray(condition)) {
                return this.evaluateMultiple(condition, operator);
            }

            // Se tem subcondições
            if (condition.conditions && Array.isArray(condition.conditions)) {
                return this.evaluateMultiple(condition.conditions, operator);
            }

            // Avalia condição única
            if (type && this.conditions[type]) {
                try {
                    return this.conditions[type](value);
                } catch (error) {
                    console.warn(`Erro ao avaliar condição ${type}:`, error);
                    return false;
                }
            }

            return false;
        }

        // Avalia múltiplas condições
        evaluateMultiple(conditions, operator = 'and') {
            if (!Array.isArray(conditions) || conditions.length === 0) {
                return false;
            }

            if (operator === 'or') {
                return conditions.some(condition => this.evaluate(condition));
            } else {
                return conditions.every(condition => this.evaluate(condition));
            }
        }

        // Adiciona uma condição personalizada
        addCondition(name, func) {
            this.conditions[name] = func;
        }
    }

    // ========================================
    // SISTEMA PRINCIPAL
    // ========================================
    
    class Starter {
        constructor() {
            this.resourceLoader = new ResourceLoader();
            this.conditionEvaluator = new ConditionEvaluator();
            this.resources = [];
            this.debug = false;
        }

        // Ativa modo debug
        enableDebug() {
            this.debug = true;
        }

        // Log debug
        log(...args) {
            if (this.debug) {
                console.log('[Starter]', ...args);
            }
        }

        // Adiciona um recurso com condição
        addResource(resource) {
            if (!resource || !resource.condition) {
                console.warn('Recurso inválido - faltando condição');
                return;
            }

            if (!resource.url && !resource.code) {
                console.warn('Recurso inválido - faltando URL ou código');
                return;
            }

            this.resources.push(resource);
            this.log('Recurso adicionado:', resource);
        }

        // Adiciona múltiplos recursos
        addResources(resources) {
            if (Array.isArray(resources)) {
                resources.forEach(resource => this.addResource(resource));
            }
        }

        // Executa todos os recursos que atendem às condições
        async executeAll() {
            this.log('Iniciando verificação de recursos...');
            
            const promises = this.resources.map(async (resource) => {
                try {
                    const shouldLoad = this.conditionEvaluator.evaluate(resource.condition);
                    this.log(`Recurso "${resource.name || resource.url || 'inline'}" - Condição: ${shouldLoad}`);
                    
                    if (shouldLoad) {
                        await this.executeResource(resource);
                        this.log(`Recurso "${resource.name || resource.url || 'inline'}" carregado com sucesso`);
                    }
                } catch (error) {
                    console.error(`Erro ao carregar recurso "${resource.name || resource.url || 'inline'}":`, error);
                }
            });

            await Promise.allSettled(promises);
            this.log('Verificação de recursos concluída');
        }

        // Executa um recurso específico
        async executeResource(resource) {
            const { type = 'script', url, code, id } = resource;

            switch (type) {
                case 'script':
                    if (url) {
                        await this.resourceLoader.loadScript(url, id);
                    } else if (code) {
                        await this.resourceLoader.executeInlineScript(code);
                    }
                    break;
                    
                case 'css':
                    if (url) {
                        await this.resourceLoader.loadCSS(url, id);
                    }
                    break;
                    
                case 'inline':
                    if (code) {
                        await this.resourceLoader.executeInlineScript(code);
                    }
                    break;
                    
                default:
                    throw new Error(`Tipo de recurso não suportado: ${type}`);
            }
        }

        // Adiciona condição personalizada
        addCondition(name, func) {
            this.conditionEvaluator.addCondition(name, func);
        }
    }

    // ========================================
    // INICIALIZAÇÃO E EXPOSIÇÃO GLOBAL
    // ========================================
    
    // Cria instância global
    const starter = new Starter();
    
    // Expõe globalmente
    window.Starter = starter;
    
    // Aguarda DOM estar pronto e executa recursos se já foram definidos
    function init() {
        // Se já existem recursos definidos globalmente, adiciona eles
        if (window.StarterResources && Array.isArray(window.StarterResources)) {
            starter.addResources(window.StarterResources);
        }
        
        // Se debug está ativado globalmente
        if (window.StarterDebug === true) {
            starter.enableDebug();
        }
        
        // Executa todos os recursos
        starter.executeAll();
    }
    
    // Inicializa quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM já está pronto
        setTimeout(init, 0);
    }

})();
