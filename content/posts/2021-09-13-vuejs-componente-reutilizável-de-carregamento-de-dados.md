---
template: post
title: VueJS - Componente Reutilizável de Carregamento de Dados
slug: vuejs-componente-reutilizavel-de-carregamento-de-dados
socialImage: /media/9x2u1dd7fjpbgzwb4238.jfif
draft: false
date: 2021-09-13T21:08:34.567Z
description: Neste artigo, eu mostro como construir um componente VueJS de
  carregamento e exibição de dados reutilizável que utiliza o padrão Loading /
  Error / Data (Carregamento / Erro / Dados) para prover feedback adequado ao
  seu usuário de acordo com estado da aplicação.
category: vuejs
tags:
  - vuejs
  - javascript
  - frontend
  - br
---
É possível contar com os dedos de uma mão as aplicações web ao redor do mundo que não precisam realizar carregamento de dados remotos e exibi-los aos usuários.

Então, assumindo que a sua próxima _Single Page Application_ (construída usando VueJS, logicamente 😍) vai precisar obter dados de um servidor remoto, eu gostaria de te ensinar a construir um componente reutilizável que vai ser responsável por gerenciar a visualização de estado de outros componentes que dependem de carregamento de dados e prover, facilmente, feedback para seus usuários.

## Começando pelo começo

Inicialmente, é preciso ter em mente o quão importante é a exibição correta do estado atual da aplicação para que os usuários saibam o que está acontecendo e o que esperar dela.
Isso vai fazer com que eles não fiquem em dúvida se a interface travou enquanto esperam informações serem carregadas e também informá-los caso ocorra algum erro para que possam entrar em contato com o suporte imediatamente, se necessário.

### Padrão Loading / Error / Data (Carregamento / Erro / Dado)

Eu não tenho certeza se é um padrão "oficial" (me mande uma mensagem caso você saiba algo a respeito) mas esta é uma forma muito fácil de implementar e que vai ajudar você a organizar a exibição do estado da sua aplicação de forma bastante simples.

Considere o objeto abaixo. Ele representa o estado inicial de uma lista de `users` (usuários):

```javascript
const users = {
  loading: false,
  error: null,
  data: []
}
```
Ao construir objetos neste formato, você poderá alterar o valor de cada atributo de acordo com o que está acontecendo na sua aplicação e utilizá-los para exibir na tela qualquer coisa de acordo com cada estado por vez. Portanto, quando a aplicação estiver carregando os dados, basta setar `loading` para `true` e quando o carregamento for concluído, setar para `false`.

De forma similar, `error` e `data` também devem ser atualizados de acordo com o resultado da chamada ao back end: se algum erro ocorreu, você pode atribuir a mensagem ao atributo `error` e, caso a requisição tenha sido concluída e o dado entregue com sucesso, basta atribuí-lo ao atributo `data`.

## Especializando

Um objeto de estado, como explicado acima, ainda é muito genérico. Vamos inseri-lo no contexto de uma aplicação VueJS.
Faremos isso implementando um componente utilizando [`slots`](https://br.vuejs.org/v2/guide/components-slots.html), o que vai nos permitir passar o dado recebido pelo componente Fetcher para os componentes filho. 

De acordo com a documentação do VueJS:

> Vue implementa uma API de distribuição de conteúdo que é modelada após o atual detalhamento da especificação dos componentes da Web, usando o elemento `<slot>` para servir como saída de distribuição de conteúdos.

Para iniciar, crie uma estrutura básica de um componente Vue e implemente o objeto `users` como variável reativa dentro de `data` conforme o exemplo abaixo:

```javascript
export default {
  data() {
    return {
      loading: false,
      error: null,
      data: null
    }
  }
}
```

Agora, crie o método responsável por fazer o request, carregar os dados e atualizar a variável de estado. Perceba que fazemos a chamada ao método que carrega os dados no hook `created` para que seja executado assim que o componente for criado.

```javascript
import { fetchUsers } from '@/services/users'

export default {
  data() {
    return {
      loading: false,
      error: null,
      data: []
      
    }
  },
  created() {
    this.fetchUsers()
  }
  methods: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      this.users.data = []

      try {
        fetchUsers()
      } catch(error) {
        this.users.error = error
      } finally {
        this.users.loading = false
      }
    }
  }
}
```

O próximo passo é implementar o `template` que irá exibir elementos diferentes de acordo com os estados de *Loading* (carregando), *Error* (erro) e *Data* (dados) usando `slots` para passar o valor de `data` para componentes filhos, caso esteja definido.

```html
<template>
  <div>
    <div v-if="users.loading">
      Loading...
    </div>
    <div v-else-if="users.error">
      {{ users.error }}
    </div>
    <slot v-else :data="users.data" />    
  </div>
</template>
```

Com o componente `Fetcher` construído, vamos utilizá-lo em outro componente chamado `UsersList`, que irá representar nossa lista de usuários.

```html
<template>
   <UsersFetcher>
     <template #default="{ data }">
       <table>
         <tr>
           <th>ID</th>
           <th>Name</th>
           <th>Age</th>
         </tr>
         <tr v-for="user in data" :key="user.id">
           <td>{{ user.id }}</td>
           <td>{{ user.name }}</td>
           <td>{{ user.age }}</td>
         </tr>
       </table>
     </template>
   </UsersFetcher>
</template>
```

```javascript
import UsersFetcher from '@/components/UsersFetcher'

export default {
  name: 'UsersList',
  components: {
    UsersFetcher
  }
}
```
## Tornando o componente reutilizável

Esta foi uma forma muito simples de se implementar o padrão *Loading / Error / Data* a fim de capturar e exibir feedback correto para os usuários quando a aplicação precisa buscar dados remotos. Porém, a implementação acima não é muito reutilizável já que está carregando e manipulando, estritamente, usuários.

Para tornar o componente mais genérico, basta implementarmos algumas pequenas mudanças e assim será possível utilizá-lo em qualquer lugar onde nossa aplicação precise buscar e exibir dados.

Primeiro, vamos tornar o componente `Fetcher` mais dinâmico visto que, em uma aplicação real, teremos que carregar diversos tipos de dados que, por sua vez, requerem métodos de serviço e nomes de variáveis específicos.
Vamos utilizar [props](https://br.vuejs.org/v2/api/index.html#props) para passar valores dinâmicos para dentro do componente.

```html
<template>
  <div>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="error">
      {{ error }}
    </div>
    <slot v-else :data="data" />    
  </div>
</template>
```

```javascript
export default {
  name: 'Fetcher',
  props: {
    apiMethod: {
      type: Function,
      required: true
    },
    params: {
      type: Object,
      default: () => {}
    },
    updater: {
      type: Function,
      default: (previous, current) => current
    },
    initialValue: {
      type: [Number, String, Array, Object],
      default: null
    }
  }
}
```
Analisando cada uma das `props` definidas acima:

`apiMethod [obrigatória]`: a função responsável por realizar a chamada à API para carregar dados externos

`params [opcional]`: os parâmetros enviados na chamada do método de serviço (_apiMethod_), quando necessários. Ex.: quando precisamos carregar dados usando filtros.

`updater [opcional]`: função que irá transformar os dados recebidos.

`initialValue [opcional]`: o valor inicial do atributo `data` do objeto de estado.

Após implementar estas `props`, vamos criar agora o mecanismo principal que irá permitir que o componente seja reutilizado.
Utilizando as `props` definidas, podemos agora definir as operações e controlar o estado do componente de acordo com o resultado da requisição.

```html
<template>
  <div>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="error">
      {{ error }}
    </div>
    <slot v-else :data="data" />    
  </div>
</template>
```

```javascript
export default {
  name: 'Fetcher',
  props: {
    apiMethod: {
      type: Function,
      required: true
    },
    params: {
      type: Object,
      default: () => {}
    },
    updater: {
      type: Function,
      default: (previous, current) => current
    },
    initialValue: {
      type: [Number, String, Array, Object],
      default: null
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      data: this.initialValue
    }
  },
  methods: {
    fetch() {
      const { method, params } = this
      this.loading = true

      try {
        method(params)
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    }
  } 
}
```

Após implementar estas mudanças, assim ficará o nosso componente `Fetcher`:

```html
<template>
   <Fetcher :apiMethod="fetchUsers">
     <template #default="{ data }">
       <table>
         <tr>
           <th>ID</th>
           <th>Name</th>
           <th>Age</th>
         </tr>
         <tr v-for="user in data" :key="user.id">
           <td>{{ user.id }}</td>
           <td>{{ user.name }}</td>
           <td>{{ user.age }}</td>
         </tr>
       </table>
     </template>
   </Fetcher>
</template>
```

```javascript
import Fetcher from '@/components/Fetcher'
import { fetchUsers } from '@/services/users'

export default {
  name: 'UsersList',
  components: {
    Fetcher
  },
  methods: {
    fetchUsers
  }
}
```

---

E é isso! :)
Utilizando apenas conceitos básicos de VueJS como `props` e `slots` podemos criar um componente de carregamento de dados reutilizável que será responsável por carregar e exibir os dados e prover feedback apropriado conforme o estado da aplicação.
Além disso, você pode utilizá-lo em qualquer página ou componente que precise carregar dados, independentemente do tipo.

Você encontra um exemplo 100% funcional desta implementação [neste repositório](https://github.com/vcpablo/vuejs-fetcher).

Espero que tenha gostado. Por favor, comente e compartilhe!

_Gostaria de agradecer especialmente a [Neil Merton](https://dev.to/scpnm) por ter me ajudado a corrigir partes do código utilizado neste artigo._

*Imagem de capa por [nordwood](https://unsplash.com/@nordwood)*


