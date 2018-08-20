<template>
 <form-wizard @on-complete="onComplete"
              @on-loading="setLoading"
               @on-error="handleErrorMessage"
               @on-validate="fetchNERs"
               :start-index="0"
               title="Henkilötietojen piilottaminen"
               subtitle="Korvaa erisnimet ja henkilötunnukset tekstistä"
               color="#e67e22"
               back-button-text="Edellinen"
               next-button-text="Seuraava"
               finish-button-text="Korvaa">
   <tab-content title="Tiedosto"
                  :before-change="validateNerFile"
                  icon="ti-user">

       <p> Anna tiedosto, joka sisältää korvattavan tekstin. </p>
       <input id="ner_file" type="file" v-on:change="setNerFile($event)"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"/>

       <div>
           <input type="checkbox" id="detect_hetu" v-model="checked" />
           <label for="detect_hetu">Hae samalla HETUT (muodossa 010101-1234) korvattavaksi. </label>
       </div>

     </tab-content>
     <tab-content title="Valitse korvattavat sanat"
                  icon="ti-settings"
                  :before-change="validateChosenNERs" >
      <div v-show="$store.state.ners_fetched">
        <fieldset>
            <legend>Valitse korvattavat sanat</legend>
            <div class="ner-row">
                <input type="checkbox" id="select_all" value="select_all" name="feature" v-on:change="selectAllNERs($event)" />
                <label for="select_all"><b>Valitse kaikki sanat</b></label>
            </div>
            <div class="ner-container">
              <div v-for="(item, index) in this.$store.state.nernames" v-bind:key="index" class="ner-row">
                  <input type="checkbox" v-bind:id="item.name" v-bind:value="item.name" name="feature" v-on:change="addNERToBeSubstituted($event)" />
                  <label v-bind:for="item.name">{{item.name}}</label>

                  <input type="text" v-bind:id="item.name + '-substitute'" placeholder="Korvike" v-bind:value="item.substitute" v-on:change="changeSubstitute($event)" />
              </div>
            </div>
        </fieldset>
      </div>
     </tab-content>
     <tab-content title="Syötetiedoston muoto"
                  icon="ti-check"
                  :before-change="replaceWords">

      <h3>Korvataan sanat </h3>
      <div class="substitute-pairs">
        <span class="sub-pair" v-for="(item, index) in this.$store.state.nernames.filter(obj => obj.selected)"
              v-bind:key="index">{{item.name }} => {{ item.substitute}} </span>
      </div>
      <br><br>
       Missä muodossa haluat tiedoston ulos?
       <select id="returnType" v-on:change="changeNerReturnType($event)" >
          <option value="docx">Docx (word) tiedosto </option>
          <option value="txt">Teksi (.txt) tiedosto </option>
        </select>

     </tab-content>

     <div class="loader" v-if="loadingWizard">LOLO</div>
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
import { getSubstiteByIndex, validateFileInput } from './tools.js';
import '../styles/loader.css';

function toggleSubstituteMap(store, value) {
  const keys = store.state.nernames.filter((obj) => obj.selected)
  const keyId = keys.length
  const substitute = getSubstiteByIndex(keyId)
  const payload = {name: value, substitute: substitute}
  store.commit('TOGGLE_SUBSTITION', value)
  if (store.state.nernames.find(obj => obj.name == value).substitute == '') {
      store.commit('CHANGE_SUBSTITION', payload)
  }
}

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
     validateChosenNERs: function() {
       const state = this.$store.state
       return new Promise((resolve, reject) => {
         if(state.nernames.length == 0) {
           reject('Henkilötiedot eivät ole vielä latautuneet tai yhtäkään ei löytynyt.')
         }
         if (state.nernames.filter(obj => obj.selected ).length == 0) {
           reject('Valitse ainakin yksi henkilötieto korvattavaksi.')
         }
         const emptys = state.nernames.filter(obj => obj.selected && (obj.substitute == null || obj.substitute == '' ))
         if (emptys.length > 0) {
           reject('Anna korvikkeet henkilötiedoille: ' + emptys.map(obj => obj.name).join(', ') + ' ');
         }
         resolve(true)
       })
     },
     validateNerFile: function() {
        const nerFile = this.$store.state.nerFile
        return validateFileInput((nerFile) ? [nerFile] : undefined)
       },
       fetchNERs: function() {
         const file = this.$store.state.nerFile
         const apiurl = this.$store.state.apiurl
         const searchPersonid = this.$store.state.nerSearchPersonid
         var path = apiurl + '/entities/directory'
         path += '?return_type=json&'
         path += 'person_ids=' + searchPersonid
         var fd = new FormData();
         fd.append("file-0", file);
         fetch(path, {
           method: 'POST',
           body: fd
         }).then(res=>res.json())
         .then((response) => {
           this.setLoading(false);
           const namesObject = response.names
           const names = namesObject.filenames.map((fn) => namesObject[fn])[0] // This works only for one file.
           for (var i = 0; i < names.length; i++) {
             var exists = (this.$store.state.nernames.length == 0) ? false : this.$store.state.nernames.some((obj) => obj.name == names[i])
             if (!exists) {
               this.$store.commit('ADD_NER_NAME', {
                 name: names[i],
                 selected: false,
                 substitute: ''
               })
             }
           }
         }).catch((e) => {
           // eslint-disable-next-line
           console.error(e);
         })
         this.setLoading(true)
       },
       addNERToBeSubstituted: function(e) {
         const value = e.currentTarget.value
         toggleSubstituteMap(this.$store, value)
       },
       selectAllNERs: function(e) {
         var checked = e.currentTarget.checked;
         const checkboxes = document.getElementsByName(e.currentTarget.name);
         for(var i in checkboxes) {
           var box = checkboxes[i]
           if (box instanceof HTMLInputElement) {
             var needToggle = box.checked !== checked
             box.checked = checked
             if (box.value != 'select_all' && needToggle) {
               toggleSubstituteMap(this.$store, box.value)
             }
           }
         }
       },
       replaceWords: function() {
         const filtered = this.$store.state.nernames.filter(obj => obj.selected)
         const words = filtered.map(obj => obj.name)
         const substitutes = filtered.map(obj => obj.substitute)
         const file = this.$store.state.nerFile
         const apiurl = this.$store.state.apiurl
         const returnType = this.$store.state.nerReturnType
         var path = apiurl + '/entities/replace' // http://127.0.0.1:5000
         var fd = new FormData();
         fd.append("file-0", file);
         path += "?return_type=" + returnType + "&"
         path += "nerlist=" + encodeURIComponent(JSON.stringify(words)) + "&";
         path += "substitutes=" + encodeURIComponent(JSON.stringify(substitutes))
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
       },
        changeSubstitute: function(e) {
        const id = e.currentTarget.id
        const name = id.substring(0, id.length - 11)
        const newSubstitute = e.currentTarget.value
        this.$store.commit('CHANGE_SUBSTITION', {
          name: name,
          substitute: newSubstitute
        })
      },
      changeNerReturnType: function(e) {
        const returnType = e.currentTarget.options[e.currentTarget.selectedIndex].value
        this.$store.commit('CHANGE_NER_RETURN_TYPE', returnType)
      }
    },
    computed: {
      checked: {
        get () {
          return this.$store.state.nerSearchPersonid
        },
        set (value) { // eslint-disable-line no-unused-vars
          this.$store.commit('CHANGE_NER_TOGGLE_SEARCH_PERSONID')
        }
      }
    }
}
</script>

<style scoped>
span.error{
  color:#e74c3c;
  font-size:20px;
  display:flex;
  justify-content:center;
}

.ner-container {
  display: flex;
  flex-wrap: wrap;
}
.ner-row {
  display: flex;
  justify-content: space-between;
  width: 40%;
}
.substitute-words {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.sub-pair {
  border: 1px solid black;
  margin: 2px 2px 2px 2px;
  line-height: 1.5;
  display: inline-block;
}
</style>
