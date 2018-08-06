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
import 'vue-form-wizard/dist/vue-form-wizard.min.css'
import { bus } from './main.js';
import {SET_NER_FILE, ADD_NER_NAME, TOGGLE_SUBSTITION, CHANGE_SUBSTITION,
        CHANGE_NER_RETURN_TYPE, CHANGE_NER_TOGGLE_SEARCH_PERSONID,
        SET_SUMMARY_FILES, SET_SUMMARY_METHOD, SET_SUMMARY_LENGTH,
        CHANGE_SUMMARY_RETURN_TYPE } from './mutation-types.js';


function fetchApiUrl() {
  var request = new XMLHttpRequest();
  request.open('GET', '/config', false);
  request.send(null);
  var json = JSON.parse(request.responseText)
  return json.apiurl
}

const API_URL = (process.env.NODE_ENV == 'development') ? 'http://127.0.0.1:5000' : fetchApiUrl()

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    nerFile: null,
    nernames: [],
    ners_fetched: false,
    apiurl: API_URL,
    nerReturnType: 'docx',
    nerSearchPersonid: true,
    summaryFiles: null,
    summaryMethod: 'embedding',
    summaryLength: 25,
    summaryReturnType: 'docx'
  },
  mutations: {
    [SET_NER_FILE] (state, file) {
      state.nerFile = file
      state.ners_fetched = false
      state.nernames = []
    },
    [ADD_NER_NAME] (state, payload) {
      state.nernames.push(payload)
      state.nernames = state.nernames.sort((a,b) => a.name > b.name)
      state.ners_fetched = true
    },
    [TOGGLE_SUBSTITION] (state, name) {
      var objIndex = state.nernames.findIndex((obj => obj.name == name ));
      state.nernames[objIndex].selected = !state.nernames[objIndex].selected
    },
    [CHANGE_SUBSTITION] (state, payload) {
      var objIndex = state.nernames.findIndex((obj => obj.name == payload.name ));
      state.nernames[objIndex].substitute = payload.substitute
    },
    [CHANGE_NER_RETURN_TYPE] (state, returnType) {
      state.nerReturnType = returnType
    },
    [CHANGE_NER_TOGGLE_SEARCH_PERSONID] (state) {
      state.nerSearchPersonid = !state.nerSearchPersonid
    },
    [SET_SUMMARY_FILES] (state, files) {
      state.summaryFiles = files
    },
    [SET_SUMMARY_METHOD] (state, method) {
      state.summaryMethod = method
    },
    [SET_SUMMARY_LENGTH] (state, length) {
      state.summaryLength = length
    },
    [CHANGE_SUMMARY_RETURN_TYPE] (state, returnType) {
      state.summaryReturnType = returnType
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
      currentComp: 'named-entity-recognition'
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
  width: 1000px;
  height: auto;
  margin: 5px;
  padding: 10px;
  border: 1px solid blue;
}

.label {
  font-size: 20px;
  margin-right: 20px;
}
</style>
