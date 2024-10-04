<script setup>
import NavBar from "./components/NavBar.vue";
</script>

<template>
  <v-app style="margin: 0px; padding: 0px; width: 100%;" id="app">
    <NavBar></NavBar>

    <div style="height: 64px;"></div>

    <router-view/>
  </v-app>
</template>

<style scoped>
#app {
  background-color: #181818;
  margin: 0;
  padding: 0;
  position: relative;
  height: 100%;
}
</style>
