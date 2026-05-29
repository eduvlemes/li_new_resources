# Ring Size Simulator - Documentacao

Plugin de simulacao de tamanho de anel com 2 etapas:
1. Calibragem com cartao fisico.
2. Medicao do aro no circulo.

## Como usar

```html
<script>
  window.RingSizeSimulatorConfig = {
    buttonText: 'Guia de Medidas',
    buttonMountSelector: '.principal .acoes-produto',
    buttonInsertMode: 'append',
    triggerCondition: "$('.nome-produto').text().includes('Anel')"
  };
</script>
<script src="resources/ring_size_simulator.js"></script>
```

## Requisito de gatilho

Voce pode controlar se o botao sera exibido usando `triggerCondition`:

- Boolean: `true` ou `false`
- Funcao: `function () { return true; }`
- String JavaScript: `"$('.nome-produto').text().includes('Anel')"`

Se a condicao for falsa, o plugin fica silencioso e nao cria o botao.

## Posicionamento do botao Guia de Medidas

Use `buttonMountSelector` para apontar o elemento de referencia e `buttonInsertMode` para a posicao:

- `append`: dentro do alvo, no fim
- `prepend`: dentro do alvo, no inicio
- `before`: antes do alvo
- `after`: depois do alvo

Exemplo:

```js
window.RingSizeSimulatorConfig = {
  buttonMountSelector: '#produto-acoes',
  buttonInsertMode: 'before'
};
```

## Modal fullscreen

O plugin abre em overlay de tela inteira (full viewport), com scroll da pagina bloqueado enquanto estiver aberto.

## Configuracoes principais

- `buttonText`: texto do botao
- `openOnInit`: abre automaticamente ao iniciar
- `referenceCard`: parametros da calibragem (85.6 x 53.9 mm por padrao)
- `measurement`: faixa e passo de diametro em mm
- `brSizeTable`: tabela de conversao para aro BR
- `onResult`: callback chamado em toda atualizacao do resultado

## API publica

- `window.RingSizeSimulator.open()`
- `window.RingSizeSimulator.close()`
- `window.RingSizeSimulator.goToStep(1 | 2)`
- `window.RingSizeSimulator.getResult()`
- `window.RingSizeSimulator.reset()`
- `window.RingSizeSimulator.destroy()`
- `window.RingSizeSimulator.reinit()`
