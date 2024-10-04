<script setup>
import { ref } from 'vue';
import { useTbaStore } from "@/stores/tba";
import vars from "@/vars";
import router from "@/router/index";
import { getRefObj } from '@/statTable.js';
import getStatTable from '@/statTable.js'
import headerTable from "@/components/headerTable.vue";
import teamTable from "@/components/teamTable.vue";
import doubleCheckButton from "@/components/doubleCheckButton.vue";

const tbaStore = useTbaStore();

const searchErrorText = ref();

const team = ref();
const loading = ref();
const curTeamData = ref();
const refObj = ref();
const searchWarmups = ref(JSON.parse(localStorage.getItem('searchWarmups')) == true);

async function searchTeam() {
  loading.value = true;
  
  if (![undefined, ""].includes(team.value)) {
    if (!isNaN(Number(team.value))) {
      if (!(await tbaStore.getTeam(team.value))["Error"]) {
        searchErrorText.value = "";
        refObj.value = getRefObj();
        curTeamData.value = await getStatTable(Number(team.value), vars.dbEventId, searchWarmups.value);
      } else {
        searchErrorText.value = "That is not a team!";
        curTeamData.value = undefined;
      }
    } else {
      searchErrorText.value = "That is not a number!";
      curTeamData.value = undefined;
    }
  } else {
    searchErrorText.value = "You didn't type in a team!";
    curTeamData.value = undefined;
  } 
  
  loading.value = false;
}
</script>

<template>
  <div class="vueContainer">
    <doubleCheckButton
      text="SWITCH"
      :fnc="router.push"
      :args="['/displays/multiSearch']"
      style="display: inline-block;"/>
      
    <h1 class="sectionTitle">Team Search</h1>

    <v-text-field
      v-model="team"
      id="teamInput"
      label="Team#"
      variant="outlined"
      class="formInput m-auto mt-5"
      style="width:min(40vw, 200px);">
    </v-text-field>
    
    <h1 class="errorText">{{ searchErrorText }}</h1>

    <v-btn
      class="btn"
      :loading="loading"
      @click="searchTeam()">
      Search
    </v-btn>

    <div v-if="!loading" id="tableContainer">
      <headerTable
        v-if="curTeamData != undefined"
        v-bind="{data: curTeamData, refs: refObj}"
        class="m-0 flex-1 inline-block"/>
  
      <teamTable
        v-if="curTeamData != undefined"
        v-bind="{data: curTeamData, colors: 'neutralColorObj', refs: refObj}"
        class="m-0 flex-1 inline-block"/>
    </div>
  </div>
</template>

<style>
#tableContainer {
  text-align: center;
  align-items: center;
  vertical-align: middle;
  display: flex;
  width: min(60%, 310px);
  margin: auto;
  justify-content: center;
  margin-bottom: 4vw;
}

.outerContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  background-color: #151515;
  text-align: center;
}
</style>
