<script setup>
import { ref } from 'vue';
import { useTbaStore } from "@/stores/tba";
import vars from "@/vars";
import getStatTable from '@/statTable.js';
import { statTableFormat, getRefObj } from '@/statTable.js';
import router from "@/router/index";
import headerTable from "@/components/headerTable.vue";
import fillMissingHeaders from '@/multiTable';
import teamTable from "@/components/teamTable.vue";
import doubleCheckButton from "@/components/doubleCheckButton.vue";

const tbaStore = useTbaStore();

const searchErrorText = ref();
const searchWarmups = ref(JSON.parse(localStorage.getItem('searchWarmups')) == true);
const noShow = ref(false);

const teamOne = ref();
const teamTwo = ref();
const teamThree = ref();
const curTeamDataOne = ref();
const curTeamDataTwo = ref();
const curTeamDataThree = ref();
const loading = ref();

const refObj = ref();

async function searchTeams() {
  loading.value = true;

  var teams = [teamOne, teamTwo, teamThree].filter(x => ![undefined, ""].includes(x.value));

  if (teams.length >= 2) {
    if (teams.filter(x => isNaN(x.value)).length == 0) {
      if (teams.length - Array.from(new Set(teams.map(x => x.value))).length == 0) {
        searchErrorText.value = "";
        curTeamDataOne.value = await getStatTable(Number(teams[0].value), vars.dbEventId, searchWarmups.value);
        curTeamDataTwo.value = await getStatTable(Number(teams[1].value), vars.dbEventId, searchWarmups.value);

        if (teams.length > 2) {  
          curTeamDataThree.value = await getStatTable(Number(teams[2].value), vars.dbEventId, searchWarmups.value);
        } else {
          curTeamDataThree.value = null;
        }
        
        var nonTeams = [];
        if (teamOne.value && (await tbaStore.getTeam(teamOne.value))["Error"]) {
          nonTeams.push(teamOne.value);
        } if (teamTwo.value && (await tbaStore.getTeam(teamTwo.value))["Error"]) {
          nonTeams.push(teamTwo.value);
        } if (teamThree.value && (await tbaStore.getTeam(teamThree.value))["Error"]) {
          nonTeams.push(teamThree.value);
        }

        if (nonTeams.length == 0) {
          if ([curTeamDataOne.value, curTeamDataTwo.value, curTeamDataThree.value].filter(x => x != null && !x.noData).length == 0) {
            noShow.value = true;
          } else {
            // var commonHeaders = getCommonHeaders();

            [curTeamDataOne.value, curTeamDataTwo.value, curTeamDataThree.value] = fillMissingHeaders(curTeamDataOne.value, curTeamDataTwo.value, curTeamDataThree.value);
            refObj.value = getRefObj();

            // if (curTeamDataOne.value) {
            //   curTeamDataOne.value = fillMissingHeaders(commonHeaders, curTeamDataOne.value);
            // }

            // if (curTeamDataTwo.value) {
            //   curTeamDataTwo.value = fillMissingHeaders(commonHeaders, curTeamDataTwo.value);
            // }

            // if (curTeamDataThree.value) {
            //   curTeamDataThree.value = fillMissingHeaders(commonHeaders, curTeamDataThree.value);
            // }
          }
        } else {
          if (nonTeams.length == 1) {
            searchErrorText.value = nonTeams[0] + " is not a team!";
          } else if (nonTeams.length == 2) {
            searchErrorText.value = nonTeams[0] + " and " + nonTeams[1] + " are not teams!";
          } else {
            searchErrorText.value = nonTeams[0] + ", " + nonTeams[1] + ", and " + nonTeams[2] + " are not teams!";
          }

          curTeamDataOne.value = undefined;
          curTeamDataTwo.value = undefined;
          curTeamDataThree.value = undefined;
        }
      } else {
        searchErrorText.value = "You typed multiple of the same number!";
        curTeamDataOne.value = undefined;
        curTeamDataTwo.value = undefined;
        curTeamDataThree.value = undefined;
      }
    } else {
      searchErrorText.value = "You typed non-numbers!";
      curTeamDataOne.value = undefined;
      curTeamDataTwo.value = undefined;
      curTeamDataThree.value = undefined;
    }
  } else {
    searchErrorText.value = "You didn't type enough teams!";
    curTeamDataOne.value = undefined;
    curTeamDataTwo.value = undefined;
    curTeamDataThree.value = undefined;
  }
  
  loading.value = false;
}
</script>

<template>
  <div class="vueContainer">
    <doubleCheckButton
      text="SWITCH"
      :fnc="router.push"
      :args="['/displays/formSearch']"
      style="display: inline-block;"/>

    <h1 class="sectionTitle">Multi Search</h1>

    <v-text-field
      v-model="teamOne"
      label="Team#"
      variant="outlined"
      class="multiSearchTeamInput">
    </v-text-field>

    <v-text-field
      v-model="teamTwo"
      label="Team#"
      variant="outlined"
      class="multiSearchTeamInput">
    </v-text-field>
    
    <v-text-field
      v-model="teamThree"
      label="Team#"
      variant="outlined"
      class="multiSearchTeamInput">
    </v-text-field>
    
    <h1 class="errorText">{{ searchErrorText }}</h1>

    <v-btn
      class="btn"
      :loading="loading"
      @click="searchTeams()">
      Search
    </v-btn>

    <div v-if="!loading" id="tableContainer">
      <div id="innerTableContainer">
        <headerTable
          v-if="curTeamDataOne != undefined && !noShow"
          v-bind="{data: curTeamDataOne, refs: refObj}"
          class="multiTable"
          style="flex: 1"/>
    
        <teamTable
          v-if="curTeamDataOne != undefined"
          v-bind="{data: curTeamDataOne, colors: 'neutralColorObj', refs: refObj}"
          class="multiTable"
          :style="'flex: 1.5;' + (noShow ? 'margin:auto' : '')"/>
    
        <teamTable
          v-if="curTeamDataTwo != undefined && !noShow"
          v-bind="{data: curTeamDataTwo, colors: 'neutralColorObj', refs: refObj}"
          class="multiTable"
          style="flex: 1.5"/>
    
        <teamTable
          v-if="curTeamDataThree != undefined && !noShow"
          v-bind="{data: curTeamDataThree, colors: 'neutralColorObj', refs: refObj}"
          class="multiTable"
          style="flex: 1.5"/>
      </div>
    </div>
  </div>
</template>

<style>
#tableContainer {
  width: 95%;
  text-align: center;
  align-items: center;
  vertical-align: middle;
  margin: auto;
  display: flex;
}

#innerTableContainer {
  display: flex;
  margin: auto;
  max-width: 600px;
}

.multiTable {
  margin:0; 
  flex: 1.5; 
  display: inline-block;
}

.multiSearchTeamInput {
  display: inline-block;
  width: 20vw;
  margin-left: 4vw;
  color: white;
}
</style>