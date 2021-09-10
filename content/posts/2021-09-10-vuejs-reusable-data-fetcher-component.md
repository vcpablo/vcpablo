---
template: post
title: VueJS - Reusable Data Fetcher Component
slug: vuejs-reusable-data-fetcher-component
socialImage: /media/9x2u1dd7fjpbgzwb4238.jfif
draft: false
date: 2021-09-10T16:35:17.116Z
description: In this article I explain to you how to build a reusable Data
  Fetcher Component to use in your VueJS applications.
category: vuejs
tags:
  - vuejs
  - javascript
  - frontend
  - beginners
---
You are probably able to count on the fingers the number of web applications around the world that do not need to fetch remote data and display it to the user.

So, assuming that your next Single Page Application (written using VueJS 😍) will require external data fetching, I would like to introduce you to a component that will help you manage the state of other components that require data fetching and easily provide proper feedback to the users.

## First things first

Initially, it is important to think about how rendering the correct state in your application is useful so that users know exactly what is happening. This will prevent them from thinking the interface has frozen while waiting for data to be loaded and also provide them, in case of any errors, with prompt feedback that will help in case they need to contact support.

### Loading / Error / Data Pattern

I am not sure if this is an official pattern (please comment below if you know any reference) but what I do know is that this simple pattern helps you to organize the state of your application/component very easily.

Consider this object. It represents the initial state of a `users` list:

```javascript
const users = {
  loading: false,
  error: null,
  data: []
}
```

By building state objects like this, you will be able to change the value of each attribute according to what is happening in your application and use them to display different parts at a time. So, while fetching data, you set `loading` to `true` and when it has finished, you set `loading` to `false`.

Similarly, `error` and `data` should also be updated according to the fetching results: if there was any error, you should assign it to the `error` property, if not, then you should assign the result to the `data` property.

## Specializing

A state object, as explained above, is still too generic. Let´s put it into a VueJS application context. We are going to do this by implementing a component and using [slots](https://vuejs.org/v2/guide/components-slots.html), which will allow us to pass data from our fetcher component to its children. 

As per VueJS docs:

> VueJS implements a content distribution API inspired by the Web Components spec draft, using the `<slot>` element to serve as distribution outlets for content.

To start, create a basic component structure and implement the `users` state object as follows:

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

Now, create the method responsible for fetching data and update the state object. Notice that we have implemented the API request in the `created` method so that it is made when the component is fully loaded.

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

The next step is implementing the template that will display different things according to *Loading*, *Error* and *Data* states using a `slot` to pass data, when present, to children components.

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

With the fetcher component built, let´s use it in our `UsersList` component.

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

## Making the component reusable

That was a very simple approach to implementing the *Error / Loading / Data* pattern to provide proper feedback to the users when fetching external data, but the implementation above is not very reusable since it is strictly fetching `users`. By implementing a few changes to our fetcher component, we will make it more generic and we will be able to reuse it for any data fetching we need in our application.

First, let´s make the fetcher component more dynamic since we need to fetch not only users in our application but all kinds of data that require different service methods and variables' names.
In order to do that, we will make use of [props](https://vuejs.org/v2/api/#props) to pass dynamic content to the component.

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

Analyzing each one of the props above:

`apiMethod [required]`: the service function responsible for fetching external data

`params [optional]`: the parameter sent to the fetch function, if needed. Ex.: when fetching data with filters

`updater [optional]`: a function that will transform the fetched result if needed.

`initialValue [optional]`: the initial value of the attribute `data` of the state object.

After implementing the required props, let´s now code the main mechanism that will allow the component to be reused. Using the defined props, we are able to set the operations and control the component's state according to fetching results.

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

So, after implementing these changes, this is how we would use the new Fetcher component.

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

- - -

So, that´s it. Using basic VueJS concepts such as *props*  and *slots*  we were able to create a reusable fetcher component that can be responsible for retrieving data from your API and provide proper feedback to the users of your application.
You can use it more than once on one page and fetch different data as needed.

You can find a fully-working example of this implementation in [this repo](https://github.com/vcpablo/vuejs-fetcher).

I hope you liked it. Please, comment and share!

*Special thanks to [Neil Merton](https://dev.to/scpnm) for helping me to fix an incorrect piece of code in this article.*

*Cover image by [nordwood](https://unsplash.com/@nordwood)*