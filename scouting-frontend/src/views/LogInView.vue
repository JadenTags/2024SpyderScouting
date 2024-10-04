<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import router from "@/router/index";

const authStore = useAuthStore();

const logInErrorText = ref();

const loading = ref();
const user = ref("");
const pass = ref("");

async function handleLogin() {
  loading.value = true;
  logInErrorText.value = "";

  if (user.value != "" && pass.value != "") {
    try {
      if (await authStore.login(user.value.toLowerCase(), pass.value)) {
        router.push("/home");
      }
    } catch {
      logInErrorText.value = "Those are incorrect credentials!";
    }
  }

  loading.value = false;
}
</script>

<template>
  <img src="../images/web.png" id="web" >

  <div id="logInContainer">
    <h1 id="logInText">Log In</h1>

    <v-text-field
      v-model="user"
      label="Username"
      variant="outlined"
      hint="Type In Your Username"
      class="logInInputs"
      @keydown.enter="handleLogin()">
    </v-text-field>

    <v-text-field
      v-model="pass"
      label="Password"
      variant="outlined"
      type="password"
      hint="Type In Your Password"
      class="logInInputs"
      @keydown.enter="handleLogin()">
    </v-text-field>

    <h1 class="errorText">{{ logInErrorText }}</h1>

    <v-btn
      id="submitBtn"
      class="btn"
      :disabled="user == '' || pass == ''"
      :loading="loading"
      @click="handleLogin()">
      Submit
    </v-btn>
  </div>
</template>

<style>
#logInContainer {
  vertical-align: middle;
  align-items: center;
  align-content: center;
  margin: auto;
  text-align: center;
  padding: 0;
  max-height: 600px;
  height: 2;
  max-width: 400px;
  width: 80%;
}

#logInText {
  color: white;
  font-family: kanit;
  font-size: 50px; 
  margin-left: auto;
  margin-bottom: min(2vw, 20px);
}

#web {
  position: absolute;
  margin: 0;
  bottom: 0;
  width: 400px;
}

#submitBtn:disabled {
  background-color: #808080;
}

.logInInputs {
  background-color: #181818;
  color: white;
  margin: auto;
  width: min(60vw, 400px);
  margin-top: min(4vw, 40px);
}
</style>
