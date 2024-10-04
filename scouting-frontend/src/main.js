import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "@/App.vue";
import "@/axios";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
// import { ref } from "vue";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";

const vuetify = createVuetify({
  components,
  directives,
});
import "@/assets/main.css";

const app = createApp(App);

app.use(vuetify);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
app.use(pinia);
import router from "./router";
app.use(router);
// router.replace("/");

app.mount("#app");


//LOGIN FOR DEVS
import { useAuthStore } from "@/stores/auth";
import vars from "@/vars";
import config from "@/config";

const authStore = useAuthStore();

async function test() {
  await authStore.login(config.user, config.pass);
  // router.push(vars.page);
}

if (vars.bypassLogin && !localStorage.getItem("auth")) {
  console.log("logging in")
  test();
}

//TBA STORE
import { useTbaStore } from "@/stores/tba";
const tbaStore = useTbaStore();


//DEV STORE
import { useDevStore } from "@/stores/dev";
const devStore = useDevStore();

// devStore.clearEventMatches(4);
// devStore.clearEventPit(4);
// devStore.createAccount("spyderscout", "teamspyder1622", "email@gmail.com");

//READ STORE
import { useReadStore } from "@/stores/read";
const readStore = useReadStore();

// console.log(readStore.getEventMatches(4));
// console.log(readStore.getEventMatches(8));
// console.log(readStore.getEventPitList(8));

export default app;
