# Guia rápido – Coupon Multi Tier

Este guia explica, de forma simples, como personalizar o componente **Coupon Multi Tier** sem precisar conhecer JavaScript.

---

## 1. Abra o editor visual

1. Localize o arquivo `editor_coupon_multi_tier.html` na pasta do projeto.
2. Clique duas vezes para abrir no navegador (Chrome, Edge, etc.).
3. Aguarde o formulário carregar com valores padrão.

> Dica: Se você atualizar o arquivo com o navegador aberto, basta recarregar a página (Ctrl+R/F5).

---

## 2. Preencha os campos

O formulário está dividido em blocos. Basta alterar os campos desejados:

- **Configuração geral**

  - _Componente ativo_: liga/desliga o módulo.
  - _Mostrar botão fechar_: exibe o “X” para esconder o banner.
  - _Selectores de disparo_: informe classes ou IDs da página onde o banner deve aparecer (separe por vírgula).
  - _Selector de inserção_: onde o banner será colocado (ex.: `body`, `.topo-site`).
  - _Método de inserção_: `prepend` (começo) ou `append` (final) dentro do elemento escolhido.
  - _Mensagem de cópia_: texto mostrado no botão após copiar o cupom.
  - _Máximo de cupons_: escolha entre 1 e 3 cartões.

- **Cupons**

  - Para cada cartão, preencha Título, Subtítulo, Texto auxiliar (texto pequeno) e o código do cupom.

- **Timer**

  - Marque ou desmarque “Ativar timer”.
  - Ajuste rótulo, data/hora de término, título do evento e o texto auxiliar.

- **Cores**
  - Cada campo possui um seletor de cor. Clique para escolher a cor desejada e repita conforme necessário.

---

## 3. Gere e copie o código

1. Clique em **“Gerar configuração”**.
2. O resultado aparecerá no quadro “Resultado” já no formato correto.
3. Clique em **“Copiar texto”** para enviar o conteúdo para a área de transferência.

Caso prefira recomeçar, use **“Restaurar padrões”**.

---

## 4. Cole no seu site/loja

1. Abra o arquivo HTML da sua loja (ou o gerenciador de scripts) onde o `coupon_multi_tier.js` é carregado.
2. Antes da inclusão do script, cole a configuração copiada dentro de uma tag `<script>`:

```html
<script>
  window.CouponMultiTierConfig = { ...sua configuração copiada... };
</script>
<script src="/resources/coupon_multi_tier.js"></script>
```

3. Salve e recarregue a página para ver as alterações.

---

## 5. Perguntas rápidas

- **Posso esconder o botão fechar?** Sim, basta desmarcar “Mostrar botão fechar”.
- **O timer sumiu. Por quê?** Ele aparece somente se o campo “Ativar timer” estiver marcado e houver uma data válida.
- **O banner não aparece.** Verifique se os “Selectores de disparo” existem na página. Se estiver em dúvida, deixe o campo vazio para exibir em todas as páginas.
- **Quero mudar as cores depois.** Abra o editor novamente, mude apenas as cores e gere um novo código.

Pronto! Agora você consegue personalizar o Coupon Multi Tier de forma visual, sem mexer diretamente no JavaScript.
