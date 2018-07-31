<template>
 <form-wizard @on-complete="onComplete"
                       @on-error="handleErrorMessage"
                       @on-loading="setLoading"
                       @on-validate="fetchNERs"
                       :start-index="0"
                       title="Henkilötietojen piilottaminen"
                       subtitle="Korvaa erisnimet ja henkilötunnukset tekstistä"
                       color="#e67e22">
     <tab-content title="Tiedosto"
                  :before-change="validateNerFile"
                  icon="ti-user">

       <p > Anna tiedosto, joka sisältää korvattavan tekstin. </p>
       <input id="ner_file" type="file" v-on:change="setNerFile($event)"/>
     </tab-content>
     <tab-content title="Valitse korvattavat sanat"
                  icon="ti-settings">
      <div v-show="!$store.state.ners_fetched"> Loading </div>
      <div v-show="$store.state.ners_fetched">
        <fieldset>
            <legend>Valitse korvattavat sanat</legend>

            <div >
                <input type="checkbox" id="select_all" value="select_all" name="feature" v-on:change="selectAllNERs($event)" />
                <label for="select_all">Valitse kaikki</label>
            </div>

            <div v-for="(name, index) in this.$store.state.nernames" v-bind:key="index">
                <input type="checkbox" v-bind:id="name" v-bind:value="name" name="feature" v-on:change="addNERToBeSubstituted($event)" />
                <label v-bind:for="name">{{name}}</label>
            </div>
        </fieldset>
      </div>
     </tab-content>
     <tab-content title="Syötetiedoston muoto"
                  icon="ti-check"
                  :before-change="replaceWords">

      <h3>Korvataan sanat </h3>
      <span v-for="(name, index) in this.$store.state.substituteList" v-bind:key="index">{{name}} </span>
      <br><br>
       Missä muodossa haluat tiedoston ulos?
       <select id="returnType">
          <option value="docx">Docx (word) tiedosto </option>
          <option value="docx">Teksi (.txt) tiedosto </option>
        </select>

     </tab-content>

     <div class="loader" v-if="loadingWizard"></div>
      <div v-if="errorMsg">
        <span class="error">{{errorMsg}}</span>
      </div>
 </form-wizard>

</template>

<script>
import Vue from 'vue';
import VueFormWizard from 'vue-form-wizard';
import 'vue-form-wizard/dist/vue-form-wizard.min.css'
import { saveAs } from 'file-saver/FileSaver';

Vue.use(VueFormWizard)
export default {
  data(){
    return {
     loadingWizard: false,
     errorMsg: null,
     count: 0,
    }
  },
  methods: {
     setNerFile: function(e) {
       this.$store.commit('SET_NER_FILE', e.currentTarget.files[0])
     },
    onComplete: function(){
        alert('Tässä menee pieni hetki.');
     },
     setLoading: function(value) {
       this.loadingWizard = value
      },
     handleErrorMessage: function(errorMsg){
       this.errorMsg = errorMsg
     },
     validateNerFile: function() {
       const file = this.$store.state.nerFile
       return new Promise((resolve, reject) => {
           var filesOk = false;
           const supportedFileTypes = ['.pdf','.docx', '.txt']
           if (!file) {
             reject('Anna tiedosto.')
             return;
           }
           for (var i = 0; i < supportedFileTypes.length; i++) {
             if(file.name.indexOf(supportedFileTypes[i]) !== -1) {
               filesOk = true;
             }
           }
           if (!filesOk) {
             reject('Tiedosto ei kelpaa, anna yksi seuraavista ' + supportedFileTypes)
           } else {
             resolve(true)
           }
         })
           /*
           ; */
       },
       fetchNERs: function() {
         const file = this.$store.state.nerFile
         const path = 'http://127.0.0.1:5000/entities/directory'
         var fd = new FormData();
         fd.append("file-0", file);
         fetch(path + '?return_type=json', { // Your POST endpoint
           method: 'POST',
           body: fd
         }).then(res=>res.json())
         .then((response) => {
           const namesObject = response.names
           const names = namesObject.filenames.map((fn) => namesObject[fn])[0] // This works only for one file.
           this.$store.commit('SET_NER_NAMES', names)
         }).catch((e) => {
           // eslint-disable-next-line
           error.log(e);
         })
       },
       addNERToBeSubstituted: function(e) {
         this.$store.commit('ADD_NER_TO_SUBSITUTE_LIST', e.currentTarget.value)
       },
       selectAllNERs: function(e) {
         var checked = true//!e.currentTarget.checked;
         const checkboxes = document.getElementsByName(e.currentTarget.name);
         for(var i in checkboxes) {
           var box = checkboxes[i]
           if (box instanceof HTMLInputElement) {
             box.checked = checked
             if (box.value != 'select_all') {
               this.$store.commit('ADD_NER_TO_SUBSITUTE_LIST', box.value)
             }
           }
         }
       },
       replaceWords: function() {
         const words = this.$store.state.substituteList
         const file = this.$store.state.nerFile
         var path = 'http://127.0.0.1:5000/entities/replace'
         var fd = new FormData();
         fd.append("file-0", file);
         path += "?return_type=docx&"
         path += "nerlist=" + encodeURIComponent(JSON.stringify(words));
         fetch(path, {
           method: 'POST',
           body: fd
         }).then(res => res.blob())
        .then((res) => {
            saveAs(res)
         }).catch((e) => {
           // eslint-disable-next-line
           error.log(e)
         })
       }
    }
}
</script>

<style scoped>
.error {
    color: red;
}
</style>
