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
    substituteList: []
  },
  mutations: {
    [SET_NER_FILE] (state, file) {
      state.nerFile = file
    },
    [SET_NER_NAMES] (state, names) {
      state.nernames = names.sort((a,b) => a > b)
      state.ners_fetched = true
    },
    [ADD_NER_TO_SUBSITUTE_LIST] (state, name) {
      const index = state.substituteList.indexOf(name)
      if (index != -1) {
        state.substituteList.splice(index, 1) // remove
      } else {
        state.substituteList.push(name)
      }
    }
  },
  plugins: [
    createPersistedState({
      storage: {
        getItem: key => Cookies.get(key),
        // Please see https://github.com/js-cookie/js-cookie#json, on how to handle JSON.
        setItem: (key, value) => Cookies.set(key, value, { expires: 3, secure: true }),
        removeItem: key => Cookies.remove(key)
      }
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
  height: auto;
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
