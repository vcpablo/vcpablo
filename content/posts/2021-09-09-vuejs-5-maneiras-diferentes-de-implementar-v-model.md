---
template: post
title: VueJS - 5 maneiras diferentes de implementar v-model
slug: vuejs-5-maneiras-diferentes-de-implementar-v-model
socialImage: /media/arrqnzcxcrx0yvsfi0dw.jpg
draft: false
date: 2021-09-03T13:52:43.145Z
description: Neste artigo, eu apresento 5 formas diferentes de implementar
  seu  v-model no VueJS 2
category: vuejs
tags:
  - vuejs
  - javascript
  - frontend
  - iniciante
---
VueJS é um framework web utilizado para construir aplicações front end e é, no momento, [amplamente utilizado] (https://insights.stackoverflow.com/survey/2020#technology-web-frameworks) por desenvolvedores ao redor do mundo.

Ele possui a diretiva `v-model` que torna a implementação de two-way data binding em [elementos de entrada de dados](https://br.vuejs.org/v2/guide/forms.html#Uso-Basico) ["mamão com açúcar"](https://br.vuejs.org/v2/guide/#Tratando-Interacao-do-Usuario).

Independente do que estiver construindo, você provavelmente vai precisar criar componentes customizados que recebem e manipulam dados através do mecanismo de _two-way data binding_. 

Neste artigo eu vou te mostrar 5 formas diferentes de implementar o seu próprio `v-model` em seu componente:

1. _[Watcher local de variáveis](#local-variable-watcher)_
2. _[Método customizado](#custom-method)_
3. _[Computed Properties "Anabolizadas"](#powerful-computed-property)_
4. _[Prop customizada + evento (VueJS 2)](#custom-prop-and-event)_
5. _[O modificador .sync (VueJS 2)](#the-sync-modifier)_

_Obs.: O objetivo aqui não é comparar a performance nem discutir quais das implementações são melhores ou piores mas sim apresentar diferentes abordagens que podem ser utilizadas para atingir o resultado esperado de um `v-model` em componentes customizados._

ℹ O componente chamada `BaseInput.vue` usado nos exemplos é bastante simples e você, provavelmente, irá ser questionar se implementar o mecanismo de two-way data binding nele é realmente necessário. Porém, como mencionei anteriormente, a intenção aqui é apenas demonstrar as possibilidades.

<a name="local-variable-watcher"></a>
## 1. Watcher de variável local

Esta é, de longe, a forma mais comum de se implementar um `v-model` em um componente.
Aqui, basta criar uma `prop` chamada `value` com o tipo desejado, criar uma variável reativa (utilizando a função `data()` do componente), inicializá-la com o valor da prop `value` definida anteriormente e "observar" suas mudanças utilizando um [`watcher`](https://br.vuejs.org/v2/guide/computed.html#Observadores).

Cada vez que o _watcher_ identifica uma mudança na variável local, ele emite um evento `input` passando o novo valor da mesma. Este valor poderá, então, ser lido pelo componente pai que, por sua vez, irá atualizar a prop `value` "de fora para dentro".

```vuejs
<!-- BaseInput.vue -->
<template>
  <input type="text" v-model="model" />
</template>

<script>
  export default {
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        model: this.value
      }
    },
    watch: {
      model(currentValue) {
        this.$emit('input', currentValue)
      }
    }
  }
</script>

<!-- Utilização -->
<BaseInput v-model="text" />
```
<a name="custom-method"></a>
## 2. Método Customizado

Você já deve ter lido por aí que, para prevenir problemas de performance, você deve evitar utilizar muitos _watchers_ na sua aplicação.
Neste segundo exemplo, tendo em mente esta premisa, nós tiramos proveito do evento `@input` disparado pelo elemento de entrada (`<input />`) nativo* e, utilizando um método customizado dentro do nosso componente, passamos o valor capturado deste elemento para o componente pai através da emissão de um evento `input`. O componente pai, por sua vez, ao utilizar o `v-model` poderá atualizar a prop `value` "de fora para dentro"**.

É importante mencionar que, neste caso, não utilizamos a diretiva `v-model` no input nativo, mas sim sua propriedade `value`.

_* O VueJS já cria, automaticamente, event listeners em elementos de entrada de dados e, quando esses elementos são destruídos, os listeners são destruídos também._

```vuejs
<!-- BaseInput.vue -->
<template>
  <input type="text" :value="value" @input="onInput" />
</template>

<script>
  export default {
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    methods: {
      onInput(event) {
        this.$emit('input', event.target.value)
      }
    }
  }
</script>

<!-- Utilização -->
<BaseInput v-model="text" />
```
**⚠ VueJS 3: se você está utilizando a versão mais recente do VueJS, substitua o nome da prop `value` por `modelValue` e o nome do evento emitido `input` por `update:modelValue`. Leia mais na [documentação do VueJS 3](https://vuejsbr-docs-next.netlify.app/guide/migration/v-model.html)**

<a name="powerful-computed-property"></a>
## 3. Propriedades Computed "Anabolizadas"

Uma outra forma de implementar seu próprio `v-model` é utilizando os [_getters_ e _setters_](https://br.vuejs.org/v2/guide/computed.html#Atribuicao-em-Dados-Computados) de computed properties.
Primeiro defina uma _computed property_ local, dentro do seu componente. Depois, implemente um _getter_ que retorna o valor da prop `value` e um _setter_ que emite o evento `input` para que o componente pai atualize a prop `value` "de fora para dentro"**.

```vuejs
<!-- BaseInput.vue -->
<template>
  <input type="text" v-model="model" />
</template>

<script>
  export default {
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    computed: {
      model: {
        get() {
          return this.value
        },
        set(value) {
          this.$emit('input', value)
        }
      }
    }
  }
</script>

<!-- Utilização -->
<BaseInput v-model="text" />
```

**⚠ VueJS 3: se você está utilizando a versão mais recente do VueJS, substitua o nome da prop `value` por `modelValue` e o nome do evento de `input` por `update:modelValue` de acordo com a [documentação do VueJS 3](https://vuejsbr-docs-next.netlify.app/guide/migration/v-model.html).**

_** Você deve evitar a alteração de valor de uma prop diretamente [Leia mais na documentação](https://br.vuejs.org/v2/guide/migration.html#Mutacao-de-Prop-descontinuado)._

<a name="custom-prop-and-event"></a>
## 4. Prop e Evento Customizados (VueJS 2)

Você deve ter percebido que, nos exemplos anteriores, o nome da prop é sempre `value` e o nome do evento é sempre `input`. Estes nomes são utilizados por padrão para implementar um `v-model` em um componente customizado. Porém, você pode trocá-los de acordo com suas necessidades.
Para que isso seja possível e o mecanismo de two-way data binding continue funcionando você pode utilizar o atributo `model` da instância do Vue para informar ao componente o nome da prop e do evento devem representar "participar" do mecanismo.

```vuejs
<!-- BaseInput.vue -->
<template>
  <input type="text" :value="text"  @input="onInput" />
</template>

<script>
  export default {
    model: {
      prop: 'text',
      event: 'update'
    },
    props: {
      text: {
        type: String,
        default: ''
      }
    },
    methods: {
      onInput(event) {
        this.$emit('update', event.target.value)
      }
    }
  }
</script>

<!-- Usage -->
<BaseInput v-model="text" />
```

**⚠ VueJS 3: se você está usando a última versão do VueJS, esta abordagem não irá funcionar pois está [desatualizada](https://vuejsbr-docs-next.netlify.app/guide/migration/v-model.html).**

<a name="the-sync-modifier"></a>
## 5. O modificador ".sync" (VueJS 2)

Esta não é, exatamente, uma implementação de um `v-model` mas irá funcionar de forma similar. 
Utilizando o modificador `.sync`([VueJS 2.3+](https://br.vuejs.org/v2/guide/components-custom-events.html#Modificador-sync)), o componente filho, ao invés de utilizar a prop `value`, irá utilizar o nome da prop que está sendo "sincronizada" com o componente pai.

Além disso, ao invés de emitir um evento `input` para atualizar a `prop`, você emite um evento convenientemente chamado `update:text` (Source: [VueJS - prop.sync](https://medium.com/front-end-weekly/vues-v-model-directive-vs-sync-modifier-d1f83957c57c)) .

------

```javascript
<!-- BaseInput.vue -->
<template>
  <input type="text" :value="text"  @input="onInput" />
</template>

<script>
  export default {
    props: {
      text: {
        type: String,
        default: ''
      }
    },
    methods: {
      onInput(event) {
        this.$emit('update:text', event.target.value)
      }
    }
  }
</script>

<!-- Utilização -->
<BaseInput :text.sync="text" />
```

**⚠ VueJS 3: se você está utilizando a versão mais recente do VueJS, esta abordagem não irá funcionar visto que está [descontinuada](https://vuejsbr-docs-next.netlify.app/guide/migration/v-model.html)**

<a name="named-v-model"></a>
## 6. v-model nomeado (VueJS 3)

A versão 3 do VueJS, lançada em 18 de setembro de 2020, tornou possível definir facilmente qual `prop` vai representar o `v-model` dentro de um componente.
Para fazer isso, basta utilizar um modificador no próprio `v-model` quando utilizar o seu componente customizado.
No exemplo abaixo, estamos dizendo que a propriedade `text`, dentro do componente `BaseInput`, irá receber o valor vindo do `v-model`.

```vuejs
<!-- BaseInput.vue -->
<template>
  <input type="text" :value="text"  @input="onInput" />
</template>

<script>
  export default {
    model: {
      prop: 'text',
      event: 'update'
    },
    props: {
      text: {
        type: String,
        default: ''
      }
    },
    methods: {
      onInput(event) {
        this.$emit('update', event.target.value)
      }
    }
  }
</script>

<!-- Utilização -->
<BaseInput v-model:text="text" />
```

---

Deixe seu comentário me dizendo se conhece alguma outra implementação que envolva `v-model` que seja interessante mencionar aqui ou envie-me sugestões de outros assuntos que podem se tornar um artigo como este aqui.

**Você pode encontrar exemplos de todas as abordagens aqui citadas (em inglês) [neste repositório](https://github.com/vcpablo/vuejs-v-model).**

Muito Obrigado a [Keith Machado](https://dev.to/keithmchd48) pela colaboração! ([Ver artigo original (inglês)](https://dev.to/vcpablo/vuejs-2-different-ways-to-implement-v-model-1mjf))

Espero que seja útil e, por favor, compartilhe!
