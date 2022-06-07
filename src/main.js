import Vue from "vue";
import App from "./App.vue";
import "@/assets/styles/index.css";
import axios from "axios";

let token = "16e2f0694a311151c01aa0a131b94a5a3ad7f110e12c2d8f459fcbb158214f5f";

axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

Vue.prototype.$axios = axios;

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
