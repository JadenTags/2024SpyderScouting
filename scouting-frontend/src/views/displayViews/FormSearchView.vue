<script setup>
import { ref } from 'vue';
import { useTbaStore } from "@/stores/tba";
import { useReadStore } from "@/stores/read";
import router from "@/router/index";
import vars from "@/vars";
import pitFormTable from "@/components/pitFormTable.vue";
import matchFormTable from "@/components/matchFormTable.vue";
import doubleCheckButton from "@/components/doubleCheckButton.vue";

const tbaStore = useTbaStore();
const readStore = useReadStore();

const searchErrorText = ref();

const team = ref();
const type = ref(0);
const matchSelector = ref(0);

const searchWarmups = JSON.parse(localStorage.getItem('searchWarmups')) == true;
const pitFormData = ref();
const matchFormData = ref();
const loading = ref();

async function searchForms() {
  loading.value = true;

  if (![undefined, ""].includes(team.value)) {
    if (!isNaN(Number(team.value))) {
        if (!(await tbaStore.getTeam(team.value))["Error"]) {
            searchErrorText.value = "";
            
            pitFormData.value = await readStore.getTeamPit(team.value);

            matchFormData.value = await readStore.getTeamsMatches(team.value, vars.dbEventId, searchWarmups);
            
            try {
                matchFormData.value = matchFormData.value.sort((a, b) => a.match_num - b.match_num);
            } catch {}
        } else {
            searchErrorText.value = "That is not a team!";
            pitFormData.value = null;
            matchFormData.value = null;
        }
    } else {
        searchErrorText.value = "That is not a number!";
        pitFormData.value = null;
        matchFormData.value = null;
    }
  } else {
    searchErrorText.value = "You didn't type in a team!";
    pitFormData.value = null;
    matchFormData.value = null;
  } 

  loading.value = false;
}
</script>

<template>
    <div class="vueContainer">
      <doubleCheckButton
        text="SWITCH"
        :fnc="router.push"
        :args="['/displays/teamSearch']"
        style="display: inline-block;"/>

        <h1 class="sectionTitle">Form Search</h1>

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
            @click="searchForms()">
            Search
        </v-btn>

        <div v-if="!loading && matchFormData && pitFormData" class="vueContainer">
            <h2 class="subtitle">TYPE</h2>
            <v-btn-toggle id="typeButtonGroup" v-model="type" mandatory>
                <v-btn class="typeGroupedButton">Pit</v-btn>
                <v-btn class="typeGroupedButton">Match</v-btn>
            </v-btn-toggle>

            <pitFormTable
                v-if="type == 0"
                v-bind="{data: pitFormData}"/>

            <div v-if="type == 1">
                <h1 class="sectionTitle"> {{ matchFormData[matchSelector]["match_num"] ? 'Match ' + matchFormData[matchSelector]["match_num"] : "" }} </h1>

                <v-btn
                    v-if="Array.isArray(matchFormData)"
                    class="btn"
                    @click="matchSelector > 0 ? matchSelector-- : null">
                    <
                </v-btn>

                <v-btn
                    v-if="Array.isArray(matchFormData)"
                    class="btn"
                    @click="matchSelector < matchFormData.length - 1 ? matchSelector++ : null">
                    >
                </v-btn>

                <matchFormTable
                    v-bind="{data: matchFormData, selector: matchSelector}"/>

            </div>
        </div>
    </div>
</template>

<style>
#typeButtonGroup {
    min-height: 50px;
    height: 12vw;
    max-height: 100px;
}

.typeGroupedButton {
    display: inline-block; 
    background-color: #353535;
    color: white;
    min-height: 50px;
    height: 12vw;
    max-height: 100px;
    font-size: min(2.5vw, 20px);
    width: 25vw;
    max-width: 220px;
    display: block;
    margin: auto;
    margin-top: 0;
}
</style>