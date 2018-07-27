<template>
 <form-wizard @on-complete="onComplete"
                       @on-error="handleErrorMessage"
                       @on-loading="setLoading"
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
      <fieldset>
          <legend>Valitse korvattavat sanat</legend>

          <div>
              <input type="checkbox" id="hessu" name="feature"
                     value="scales" />
              <label for="hessu">Hessu Hopo</label>
          </div>

          <div>
              <input type="checkbox" id="hetu" name="feature"
                     value="horns" />
              <label for="hetu">010150-1234</label>
          </div>

          <div>
              <input type="checkbox" id="berlin" name="feature"
                     value="berlin" />
              <label for="berlin">Berliini</label>
          </div>

      </fieldset>
     </tab-content>
     <tab-content title="Syötetiedoston muoto"
                  icon="ti-check">
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

Vue.use(VueFormWizard)
export default {
  data(){
    return {
     loadingWizard: false,
     errorMsg: null,
     count: 0
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
         }).then((response) => {
           alert('fetch form server' + response) // TODO send file to server to get ners
           return true;
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
