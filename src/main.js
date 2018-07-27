import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

export const bus = new Vue();

/* eslint-disable no-new */
/*
new Vue({
	el: '#app',
	template: '<App/>',
	components: { App }
})*/;

new Vue(App).$mount('#app')
