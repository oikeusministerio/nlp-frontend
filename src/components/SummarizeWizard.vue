<template>
  <form-wizard @on-complete="onComplete"
                  @on-loading="setLoading"
                  @on-error="handleErrorMessage"
                  title="Automaattinen tiivistäminen"
                  subtitle="Valitsee laskennallisesti merkityksellisimmät lauseet"
                  shape="circle"
                  color="gray"
                  error-color="#e74c3c"
                  back-button-text="Edellinen"
                  next-button-text="Seuraava"
                  finish-button-text="Tiivistä">

    <tab-content title="Tiivistettävät tiedostot"
                 :before-change="validateFileInput"
                 icon="ti-user">

       <p> Anna tiivistettävät tiedostot. </p>
       <input id="summary_files" type="file" v-on:change="setSummaryFiles($event)"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              multiple />
    </tab-content>
    <tab-content title="Käytettävä tiivistelmä menetelmä"
                 icon="ti-settings">

                 <div class="summary-method">
                   <div class="input-row">
                     <input type="radio" id="summary-method-embedding" name="summary-method" v-on:change="addSummaryMethod('embedding')" checked />
                     <label for="summary-method-embedding"> Sanastoon perustuva tiivistys-menetelmä   &nbsp;</label>
                     <div class="tooltip">Lisätietoja
                       <span class="tooltiptext">Valitsee lauseet, joiden sanojen yhteenlaskettu semanttinen etäisyys alkuperäisestä tekstistä on pienin mahdollinen.</span>
                     </div>
                      &nbsp;
                     <div class="tooltip" > <a href="http://www.aclweb.org/anthology/D15-1232" >Artikkeli </a>
                       <span class="tooltiptext">  Kobayashi, Hayato, Masaki Noguchi, and Taichi Yatsuka. "Summarization based on embedding distributions." Proceedings of the 2015 Conference on Empirical Methods in Natural Language Processing. 2015.</span>
                     </div>
                   </div>
                   <div class="input-row">
                     <input type="radio" id="summary-method-graph" name="summary-method" v-on:change="addSummaryMethod('graph')" />
                     <label for="summary-method-graph"> Sanoihin sanoihin perustuva tiivistys-menetelmä &nbsp;</label>
                     <div class="tooltip">Lisätietoja
                       <span class="tooltiptext">Valitsee lauseet, joissa on eniten samoja sanoja, kuin muissa lauseissa.</span>
                     </div>
                      &nbsp;
                     <div class="tooltip" > <a href="https://www.jair.org/index.php/jair/article/view/10396/24901" >Artikkeli </a>
                       <span class="tooltiptext">Erkan, Günes, and Dragomir R. Radev. "Lexrank: Graph-based lexical centrality as salience in text summarization." Journal of artificial intelligence research 22 (2004): 457-479.</span>
                     </div>
                   </div>
                 </div>
    </tab-content>
    <tab-content title="Tiivistelmän pituus"
                 icon="ti-check"
                 :before-change="validateMethodLength">
          <div>
             <p>Tiivistelmän pituus sanoissa </p>
             <input type="number" name="quantity" min="10" max="300" value="25" v-on:change="setSummaryLength($event)" />
         </div>
    </tab-content>
    <tab-content title="Syötetiedoston muoto"
                 icon="ti-check">
                 <h3>Lähetetään tiedostot palvelimelle</h3>
                 <div >Syötetyt tiedostot:
                   <span v-for="(fn, i) in summaryFileNames"
                         v-bind:key="i"> {{fn}} </span>
                 </div>
                 <div >Käytettävä menetelmä:
                   <span>{{this.$store.state.summaryMethod}}</span>
                 </div>
                 <div >Tiivistelmän pituus sanoissa:
                   <span>{{this.$store.state.summaryLength}}</span>
                 </div>
             Missä tiedostomuodossa tiivistelmä tulostetaan?
             <select id="returnType" v-on:change="changeSummaryReturnType($event)" >
                <option value="docx">Word (.docx) tiedosto </option>
                <option value="txt">Teksti (.txt) tiedosto </option>
              </select>
              <br>
              <p v-if="loadingWizard" >Tiedostot lähetetty palvelimelle Tässä voi mennä useita minutteja, riippuen tiedostojen koosta.</p>
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
import { saveAs } from 'file-saver/FileSaver';
import 'vue-form-wizard/dist/vue-form-wizard.min.css'
import { validateFileInput } from './tools.js';
import '../styles/tooltip.css';
import '../styles/loader.css';

Vue.use(VueFormWizard)
export default {
   data(){
      return {
       loadingWizard: false,
       errorMsg: null,
       count: 0,
       rules: {
          summaryLength: [{
            required: true,
            message: 'Please input Activity name',
            trigger: 'blur',
            min: 10,
            max: 300
          }]
        }
     }
    },
    methods: {
      setLoading: function(value) {
          this.loadingWizard = value
      },
      handleErrorMessage: function(errorMsg){
        this.errorMsg = errorMsg
      },
      setSummaryFiles: function(e) {
        this.$store.commit('SET_SUMMARY_FILES', e.currentTarget.files)
      },
      addSummaryMethod: function(method) {
        this.$store.commit('SET_SUMMARY_METHOD', method)
      },
      validateFileInput:function() {
        const files = this.$store.state.summaryFiles
        return validateFileInput(files)
       },
       setSummaryLength: function(e) {
         this.$store.commit('SET_SUMMARY_LENGTH', e.currentTarget.value)
       },
       validateMethodLength: function() {
         return new Promise((resolve, reject) => {
           const len = this.$store.state.summaryLength
           if (len < 10 || len > 300) {
             reject("Pituuden on oltava 10 - 300 sanaa.")
           } else {
             resolve(true)
           }
          })
       },
       changeSummaryReturnType: function(e) {
         const returnType = e.currentTarget.options[e.currentTarget.selectedIndex].value
         this.$store.commit('CHANGE_SUMMARY_RETURN_TYPE', returnType)
       },
       onComplete: function(){
          const {summaryFiles,summaryMethod,summaryLength,summaryReturnType,apiurl} = this.$store.state

          var path = apiurl + '/summarize/directory'
          var fd = new FormData();
          for (var i = 0; i < summaryFiles.length; i++) {
            fd.append("file-"+i, summaryFiles[i]);
          }
          path += "?return_type=" + summaryReturnType + "&"
          path += "method=" + summaryMethod + "&"
          path += "summary_length=" + summaryLength
          fetch(path, {
            method: 'POST',
            body: fd
          }).then(res => res.blob())
         .then((res) => {
             this.setLoading(false)
             saveAs(res)
          }).catch((e) => {
            // eslint-disable-next-line
            error.log(e)
          })
          this.setLoading(true)
          alert(text)
        },
     },
     computed: {
       summaryFileNames: function() {
         const summaryFiles = this.$store.state.summaryFiles
         return Object.keys(summaryFiles).map(id => summaryFiles[id].name)
       }
     }
}
</script>

<style>
span.error{
  color:#e74c3c;
  font-size:20px;
  display:flex;
  justify-content:center;
}

.summary-method {
  display: flex;
  flex-direction: column;
}

.input-row {
  display: flex;
  justify-content: left;
  width: 90%;
}
</style>
