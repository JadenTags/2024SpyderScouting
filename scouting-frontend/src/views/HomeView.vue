<script setup>
import { ref, watch } from 'vue';
import toggleButton from "@/components/toggleButton.vue";

const searchWarmups = ref(JSON.parse(localStorage.getItem('searchWarmups')) == true);

async function checkWarmups() {
    if (searchWarmups.value) {
        while (!document.getElementById("searchWarmupsButton")) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }

        document.getElementById("searchWarmupsButton").click();
        searchWarmups.value = true;
    }
}
checkWarmups();

watch(searchWarmups, () => {
    localStorage.setItem('searchWarmups', searchWarmups.value);
});
</script>

<template>
    <v-container>
        <toggleButton 
        id="searchWarmupsButton"
        v-model="searchWarmups"
        @click="searchWarmups = !searchWarmups"
        text="Display Warmups"
        class="mt-8 ml-10"
        style="display: inline-block; margin: auto;"/>
    </v-container>
</template>

<style>
.v-container {
  text-align: center;
  align-items: center;
  vertical-align: middle;
  justify-content: center;
}
</style>
