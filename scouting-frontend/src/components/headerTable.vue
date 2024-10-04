<script setup>
import { toRefs } from 'vue';

const props = defineProps({
    data: Object,
    refs: Object
});
const { data, refs } = toRefs(props);

const headers = {
    "General": {
        "Name": "Name",
        "Team": "Team",
        "Language": "Language",
        "Dims": "Dims",
        "Understage": "Under Stage",
        "DB": "DB",
        "Buddy": "Buddy",
        "DB Motors": "DB Motors",
        "Pickups": "Pickups",
        "Can Shoot": "Can Shoot",
        "Shooting Pos": "Shooting Pos",
        "Fail%": "Failure%",
        "Matches": null
    },
    "Auto": {
        "Auto": "Auto",
        "Taxi%": "Exit%",
        "OTF Paths": "OTF Paths",
        "Disruption": "Center Disrupt",
        "Speaker": "Speaker",
        "Amp": "Amp",
        "Cycles": "Cycles",
        "Total Shot": "Total Shot",
        "FPs": "FPs"
    },
    "Teleop": {
        "Speaker": "Speaker",
        "Amp": "Amp",
        "Cycles": "Cycles",
        "Passed": "Passed",
        "Total Shot": "Total Shot",
        "RD%": "RD",
        "AT": "AT",
        "Playstyle%": "Playstyle%",
        "Endgame%": "Endgame%",
        "Climb": "Climb",
        "Harmonize": "Harmonize",
        "Climb Time": "Climb Time",
        "Trap%": "Trap%",
        "Trap": "Trap Score",
        "Human": "Human Score",
        "Buddy%": "Buddy ATPT%",
        "BuddySCS%": "Buddy SCS%"
    },
    "Overall": {
        "Cycles": "Cycles",
    }
}

const specialStyles = {
    "General": {
        "Name": "max-height: 300px; height: 12vw; min-height: 150px; font-size: min(4vw, 20px);"
    }
}
</script>

<template>
    <v-container v-if="!data['noData']" class="container table">
        <v-container v-for="section in Object.keys(headers)" class="wrapper">
            <v-container class="sectionHeader"
            v-if="Object.values(data[section]).filter(x => x != 'DONT SHOW').length > 0"> 
                {{ section }} 
            </v-container>

            <v-container v-for="header in Object.keys(headers[section])" class="wrapper">
                <v-container class="basicHeader"
                v-if="header == 'Matches'">
                    Matches
                </v-container>

                <v-container class="percentHeader"
                v-else-if="refs[section] && refs[section][headers[section][header]] && (data[section][headers[section][header]]['TYPE'] == 'PERCENT' || data[section][headers[section][header]]['TYPE'] == 'YESNO')"
                @click="refs[section][headers[section][header]]['ref'] = !refs[section][headers[section][header]]['ref']"
                :style="(specialStyles[section] && specialStyles[section][header] ? specialStyles[section][header] : '') + (refs[section][headers[section][header]]['ref'] ? 'height: calc(min(max(10vw, 25px), 40px) * ' + (Object.values(data[section][headers[section][header]]).filter(x => x != 'PERCENT' && x != 'YESNO').length) + ');' : '')">
                    {{ header }}
                </v-container>

                <v-container class="basicHeader"
                v-else-if="(['string', 'number'].includes(typeof data[section][headers[section][header]]) && data[section][headers[section][header]] != 'DONT SHOW') || (data[section][headers[section][header]]['TYPE'] == 'COMPLEX' && !data[section][headers[section][header]]['DONT SHOW'])"
                :style="specialStyles[section] && specialStyles[section][header] ? specialStyles[section][header] : ''">
                    {{ header }}
                </v-container>

                <v-container class="basicHeader" 
                v-else-if="data[section][headers[section][header]]['TYPE'] == 'HAVE' && (Object.values(data[section][headers[section][header]]).includes(true) || Object.values(data[section][headers[section][header]]).includes('ND'))"
                :style="'height: min(' + Object.values(data[section][headers[section][header]]).filter(x => x == true || x == 'ND').length*10 + 'vw, ' + Object.values(data[section][headers[section][header]]).filter(x => x == true || x == 'ND').length*40 + 'px)'">
                    {{ header }}
                </v-container>
            </v-container>
        </v-container>
    </v-container>
</template>

<style>
.sectionHeader {
    background-color: #3b3b3b;
    height: min(10vw, 40px);
    font-size: min(4vw, 22px);
    font-weight: bolder;
    font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    border-top: 1px solid black;
    padding: 0;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
}

.basicHeader {
    background-color: #707070;
    height: min(10vw, 40px);
    font-size: min(4vw, 22px);
    font-family: 'kanit-light';
    border-top: 1px solid black;
    padding: 0;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
}

.percentHeader {
    border-top: 1px solid black;
    background-color: #5f5f5f;
    height: min(max(10vw, 25px), 40px);
    font-size: min(max(3.25vw, 13px), 22px);
    flex: 1;
    font-family: 'kanit-light';
    border-top: 1px solid black;
    padding: 0;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    transition-duration: 500ms;
}

.wrapper {
   padding: 0;
}
</style>