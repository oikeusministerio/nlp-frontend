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
import Vue from 'vue';
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'
import createLogger from 'vuex/dist/logger'
import Toolbar from './components/Toolbar.vue';
import NERWizard from './components/NERWizard.vue';
import SummarizeWizard from './components/SummarizeWizard.vue';
import { bus } from './main.js';
import {SET_NER_FILE, SET_NER_NAMES, ADD_NER_TO_SUBSITUTE_LIST} from './mutation-types.js';

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    nerFile: null,
    nernames: [],
    ners_fetched: false,
    substitute_list: []
  },
  mutations: {
    [SET_NER_FILE] (state, file) {
      state.nerFile = file
    },
    [SET_NER_NAMES] (state, names) {
      state.nernames = names
      state.ners_fetched = true
    },
    [ADD_NER_TO_SUBSITUTE_LIST] (state, name) {
      const index = state.substitute_list.indexOf(name)
      if (index != -1) {
        state.substitute_list = state.substitute_list.splice(index, 1) // remove
      } else {
        state.substitute_list.push(name)
      }
    }
  },
  plugins: [
    createPersistedState({
      getState: (key) => Cookies.getJSON(key),
      setState: (key, state) => Cookies.set(key, state, { expires: 3, secure: true })
    }),
    createLogger()
  ]
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
