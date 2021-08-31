---
template: post
title: VueJS - Different ways to implement v-model
slug: vuejs-2-different-ways-to-implement-v-model
socialImage: /media/arrqnzcxcrx0yvsfi0dw.jpg
draft: false
date: 2021-08-31T23:49:32.826Z
description: In this article, I introduce you to 5 different ways of
  implementing v-model in VueJS 2
category: vuejs
tags:
  - vuejs
  - javascript
  - frontend
  - beginners
---
VueJS is a web framework used to build front-end applications and it is [widely adopted](https://insights.stackoverflow.com/survey/2020#technology-web-frameworks) by web developers around the world.

It provides the `v-model` directive that makes [two-way binding between form inputs](https://vuejs.org/v2/guide/forms.html#Basic-Usage) ["a breeze"](https://vuejs.org/v2/guide/#Handling-User-Input).

Depending on what you are building, you might need to build custom components that deal with two-way data binding. Here are some ways of implementing your own custom `v-model`:

1. _[Local variable watcher](#local-variable-watcher)_
2. _[Custom method](#custom-method)_
3. _["Powerful" computed property](#powerful-computed-property)_
4. _[Custom prop and event (VueJS 2)](#custom-prop-and-event)_
5. _[The .sync modifier (VueJS 2)](#the-sync-modifier)_



_Obs.: The goal here is not to benchmark neither discuss which of the implementations is the best but to introduce the different approaches that can be used to implement `v-model` in your custom components._

ℹ The component named `BaseInput.vue` used in the examples is very simple, and you might even question if implementing a custom `v-model` is really necessary for it, but, as mentioned, the intention is just to demonstrate the possibilities.


<a name="local-variable-watcher"></a>
## 1. Local variable watcher

This is probably the most used way of implementing `v-model` in your custom components. You create a prop named `value` using the type you need, then create a local observable variable in `data()` and initialize it with the value of the prop you've created previously and watch its changes in order to emit an `input` event to the parent component to update the `value` prop from the outside**.

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

<!-- Usage -->
<BaseInput v-model="text" />
```
<a name="custom-method"></a>
## 2. Custom method
You might have already read that, to prevent performance issues, you should avoid using watchers in your application.
In this second example, we take advantage of the `@input` event triggered by the native `input` element* and, using a custom method inside our component, we pass the value of the input to the parent component emitting an `input` event so that the `value` prop is updated from the outside**.

It is also important to mention that in this case we do not use the `v-model` in the native input, but the `value` attribute.

_* VueJS already attaches event listeners to form inputs for us automatically and when these inputs are destroyed, all listeners are destroyed as well_

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

<!-- Usage -->
<BaseInput v-model="text" />
```
**⚠ VueJS 3: if you are using the latest version of VueJS, change the name of the prop from `value` to `modelValue` and the name of the event from `input` to `update:modelValue` as per [VueJS 3 docs](https://v3.vuejs.org/guide/migration/v-model.html#overview)**

<a name="powerful-computed-property"></a>
## 3. "Powerful" computed property

Another way of implementing `v-model` in your custom component is using computed properties [getters and setters](https://vuejs.org/v2/guide/computed.html#Computed-Setter).
You can define a local _computed property_, implement a getter that returns the `value` property, and a setter that emits an `input` event for the parent component to update the `value` prop from the outside**.

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

<!-- Usage -->
<BaseInput v-model="text" />
```

**⚠ VueJS 3: if you are using the latest version of VueJS, change the name of the prop from `value` to `modelValue` and the name of the event from `input` to `update:modelValue` as per [VueJS 3 docs](https://v3.vuejs.org/guide/migration/v-model.html#overview)**

_** You must avoid changing a prop value directly [See Docs](https://vuejs.org/v2/guide/migration.html#Prop-Mutation-deprecated)._

<a name="custom-prop-and-event"></a>
## 4. Custom prop and event (VueJS 2)

You might have noticed that, in the previous examples, the name of the prop is always `value` and the name of the event is always `input`. These are defaults to implement a `v-model` in your custom component. But you can change it if you want. You can name the prop and the event according to your own needs.
For that to be possible you may set the `model` attribute and tell the component which names you expect to represent the prop and the event that will update it.

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

**⚠ VueJS 3: if you are using the latest version of VueJS, this approach will not work since it is now [deprecated](https://v3.vuejs.org/guide/migration/v-model.html#overview)**

<a name="the-sync-modifier"></a>
## 5. The ".sync" modifier (VueJS 2)

This is not a `v-model` implementation exactly but it will work as it is. With the `.sync` modifier ([VueJS 2.3+](https://vuejs.org/v2/guide/components.html#sync-Modifier)), the child component doesn’t need a value prop. Instead, it uses the same prop name you synced in the parent.
Also instead of emitting an `input` event to update the prop, you emit the conveniently named event `update:text`. (Source: [Vue’s new and improved prop.sync](https://medium.com/front-end-weekly/vues-v-model-directive-vs-sync-modifier-d1f83957c57c)).

```vuejs
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

<!-- Usage -->
<BaseInput :text.sync="text" />
```

**⚠ VueJS 3: if you are using the latest version of VueJS, this approach will not work since it is now [deprecated](https://v3.vuejs.org/guide/migration/v-model.html#overview)**

<a name="named-v-model"></a>
## 6. Named v-model (VueJS 3)

With VueJS 3, released on 18 September 2020, it is now possible to define which prop will represent the `v-model` inside the component in an extremely easy way.
To do that, you just need to use a modifier in the `v-model` itself when using your custom component.
In the example below, we are defining that the `text` prop, inside the `BaseInput` component will receive the value from the `v-model`.

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
<BaseInput v-model:text="text" />
```

---

Let me know if you know of any other implementation that might be worth mentioning or event provide me suggestions about subjects that can become short articles like this one.

**You can find an example for all of the mentioned approaches in [this repo](https://github.com/vcpablo/vuejs-v-model).**

Thanks to @keithmchd48 for his help! (Check comments)

I hope it is useful and please, share it!

