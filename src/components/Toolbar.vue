<template>
    <div>
    <button
      class="switch summarize"
      @click="switchComponent('summarize-wizard')"
      :disabled="currentComp === 'summarize-wizard'"
    >Lauseiden valinta</button>
    <button
      class="switch ner"
      @click="switchComponent('named-entity-recognition')"
      :disabled="currentComp === 'named-entity-recognition'"
    >Henkilötietojen piilottaminen</button>
    </div>
</template>

<script>
import { bus } from '../main.js';

export default {
    props: {
        currentComp: {
            type: String,
            required: true
        }
    },

    methods: {
        switchComponent(comp) {
            bus.$emit('switchComp', comp);
        }
    }
}
</script>

<style scoped>

button.switch {
  background: none;
  border: 1px solid black;
  margin: 0;
  cursor: pointer;
}

button.switch[disabled='disabled'] {
  color: lightgray;
  border-color: lightgray;
}

button.switch:not([disabled='disabled']):hover {
  background-color: black;
  border-color: gray;
  color: lightgray;
}

button.summarize, button.ner {
  border-color: green;
  color: green;
}
</style>
