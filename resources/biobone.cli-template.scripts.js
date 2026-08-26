console.log(`==============================`);
console.log(`== ALPIX - BIOBONE - LOADED ==`);
console.log(`==============================`);


(function () {
  const params = new URLSearchParams(window.location.search);

  if (params.get('apx') === '1') {
      
      window.UpsellCrossSellConfig = {
          productPage: {
              active: true,
              title: 'Leve esses aqui também',
              source: 'keywords',
              parameter: "chaveiro",
              sort: 'most_sold',            // 'most_sold' | 'price_asc' | 'price_desc'
              layout: 'list',              // 'list' | 'grid' | 'slider'
              maxProducts: 3,
              cardsPerRow: 1,              // usado quando layout = 'grid'
              insertSelector: '.principal #DelimiterFloat',
              insertMethod: 'afterend'
              
          },
          checkout: {
              id: 'ucs-cart-cj-petisco',
              title: 'APROVEITE O FRETE, E LEVE:',
              // source: 'category',
              // categoryId: '23322461',
              source: 'keywords',
              parameter: "chaveiro",
              sort: 'most_sold',       // 'most_sold' | 'price_asc' | 'price_desc'
              layout: 'slider',        // 'list' | 'grid' | 'slider'
              maxProducts: 30,
              slidesPerView: 1,
              insertSelector: '#formularioCheckout > div > .span4:nth-child(2) > .caixa-sombreada:first-child',
              insertMethod: 'beforebegin',
              onAddToCart: function(response, skuId) {
                  console.log('[Carrinho CJ] adicionado:', skuId);
                  window.location.reload();
              }
          },
          cart: {
              sections: [
                  {
                      id: 'ucs-cart-cj',
                      title: 'Leve um chaveiro exclusivo!',
                      source: 'keywords',
                      parameter: "chaveiro",
                      // source: 'compre_junto',
                      // sort: 'most_sold',       // 'most_sold' | 'price_asc' | 'price_desc'
                      layout: 'slider',        // 'list' | 'grid' | 'slider'
                      maxProducts: 30,
                      slidesPerView: 5,
                      insertSelector: '.finalizar-compra .caixa-sombreada',
                      insertMethod: 'afterend',
                      onAddToCart: function(response, skuId) {
                          console.log('[Carrinho CJ] adicionado:', skuId);
                          window.location.reload();
                      }
                  }
              ]
          },
          
          colors: {
              sectionBackground:  '#f9fafb',
              sectionBorder:      '#e5e7eb',
              titleColor:         '#111827',
              cardBackground:     '#ffffff',
              cardBorder:         '#e5e7eb',
              cardShadow:         'rgba(0,0,0,0.06)',
              textColor:          '#131313',
              textLight:          '#6b7280',
              priceColor:         '#111827',
              priceOldColor:      '#9ca3af',
              buttonBg:           '#208d58',
              buttonText:         '#ffffff',
              buttonHoverBg:      '#208d58',
              buttonSuccessBg:    '#32bcad',
              buttonErrorBg:      '#dc2626',
              sliderArrowBg:      '#ffffff',
              sliderArrowBorder:  '#e5e7eb',
              sliderArrowIcon:    '#208d58',
              modalOverlay:       'rgba(0,0,0,0.5)',
              modalBackground:    '#ffffff',
              skuOptionBorder:    '#e5e7eb',
              skuOptionHoverBg:   '#f3f4f6',
              skuOptionActiveBg:  '#f0fdf4',
              skuOptionActiveBorder: '#32bcad'
          }
      };
      
      if (window.PRODUTO_ID == "401877167") {
          window.UpsellCrossSellConfig.productPage = {
              title: 'Leve um mordedor também!',
              source: 'keywords',
              parameter: "mordedor",
              sort: 'most_sold',           // 'most_sold' | 'price_asc' | 'price_desc'
              layout: 'list',              // 'list' | 'grid' | 'slider'
              maxProducts: 5,
              cardsPerRow: 1,              // usado quando layout = 'grid'
              insertSelector: '.principal #DelimiterFloat',
              insertMethod: 'afterend',
              onAddToCart: function(response, skuId) {
                  console.log('[Produto] SKU adicionado:', skuId);
                  
              }     
          }
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/eduvlemes/li_new_resources/resources/upsell_cross_sell_v2.js?v=1.1';
      document.body.appendChild(script);

  }
})();