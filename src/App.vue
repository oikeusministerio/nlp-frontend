<template>
  <div id="app">
    <h1 class="label">NLP-sovellus</h1>

    <toolbar :current-comp="currentComp"></toolbar>

    <div class="container">
      <component :is="currentComp"></component>
    </div>
  </div>
</template>


<script>
import Toolbar from './components/Toolbar.vue';
import NERWizard from './components/NERWizard.vue';
import SummarizeWizard from './components/SummarizeWizard.vue';
import { bus } from './main.js';
import Vue from 'vue';
import Vuex from 'vuex'
import {SET_NER_FILE} from './mutation-types.js';

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    nerFile: null,
  },
  mutations: {
    [SET_NER_FILE] (state, file) {
      state.nerFile = file
    },
  }
})

export default {
  el: '#app',
  store,
  data() {
    return {
      currentComp: 'summarize-wizard'
    };
  },

  created() {
      bus.$on('switchComp', comp => {
           this.currentComp = comp;
      })
  },

  components: {
    'toolbar': Toolbar,
    'named-entity-recognition': NERWizard,
    'summarize-wizard': SummarizeWizard
  }
}
</script>

<style scoped>
.container {
  width: 450px;
  height: 670px;
  margin: 5px;
  padding: 10px;
  border: 1px solid blue;
}

.label {
  font-size: 20px;
  color: blue;
  margin-right: 20px;
}
</style>
