<template>
 <form-wizard @on-complete="onComplete"
                       :start-index="0"
                       title="Henkilötietojen piilottaminen"
                       subtitle="Korvaa erisnimet ja henkilötunnukset tekstistä"
                       color="#e67e22">
     <tab-content title="Tiedosto"
                  icon="ti-user">
       Anna tiedosto, joka sisältää korvattavan tekstin.
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
 </form-wizard>

</template>

<script>
import Vue from 'vue';
import VueFormWizard from 'vue-form-wizard';
import 'vue-form-wizard/dist/vue-form-wizard.min.css'

Vue.use(VueFormWizard)
export default {
   methods: {
    onComplete: function(){
        alert('Tässä menee pieni hetki.');
     }
    }
}
</script>

<style scoped>

</style>
