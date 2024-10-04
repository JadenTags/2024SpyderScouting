<script setup>
import { toRefs } from 'vue';
import { matchFormFormat } from '@/views/formsViews/MatchFormView.vue';

const props = defineProps({
    data: Object,
    selector: Number
});
const { data, selector } = toRefs(props);

const displayTextObj = {
    "auto": {
        "SELF": "Auto",
        "amp": {
            "SELF": "Amp",
            "made": "Made",
            "missed": "Missed"
        },
        "exited": "Taxi",
        "failedPickups": "FPs",
        "noAuto": "No Auto",
        "speaker": {
            "SELF": "Speaker",
            "made": "Made",
            "missed": "Missed"
        }
    },
    "teleop": {
        "SELF": "Teleop",
        "almostTipped": "Almost Tipped",
        "amp": {
            "SELF": "Amp",
            "made": "Made",
            "missed": "Missed"
        },
        "passed": "Passed",
        "playstyle": "Playstyle",
        "roughDriving": "Rough Driving",
        "speaker": {
            "SELF": "Speaker",
            "made": "Made",
            "missed": "Missed"
        }
    },
    "endgame": {
        "SELF": "Endgame",
        "buddyClimb": "Buddy Climb",
        "buddyClimbOutcome": "Buddy Climb Outcome",
        "climbTime": "Climb Time",
        "endgame": "Endgame",
        "humanScore": {
            "SELF": "Human Score",
            "made": "Made",
            "missed": "Missed"
        },
        "ownHuman": "Own Human",
        "trap": "Trap",
        "trapScore": {
            "SELF": "Trap Score",
            "made": "Made",
            "missed": "Missed"
        }
    },
    "other": {
        "SELF": "Other",
        "failure": "Fail",
        "notes": "Notes"
    }
}
</script>


<template>
    <v-container>
        <v-container v-if="data == 'NO DATA'" class="p-0">
            <h1 class="title">NO DATA</h1>
        </v-container>

        <v-container v-else v-for="section in Object.keys(matchFormFormat)">
            <v-container class="formSectionTitle">
                {{ displayTextObj[section]["SELF"] }}
            </v-container>

            <v-container v-for="header in Object.keys(matchFormFormat[section])" class="wrapper">
                <v-container class="tableRow"
                v-if="['string', 'number', 'boolean'].includes(typeof data[selector][section][header])"
                :style="header == 'notes' ? 'height: calc(max(min(10vw, 40px), 20px)*4)' : ''">
                    <v-container class="headerCell" :style="header == 'notes' ? 'height: calc(max(min(10vw, 40px), 20px)*4)' : ''">
                        {{ displayTextObj[section][header] }}
                    </v-container>
    
                    <v-container class="dataCell" :style="header == 'notes' ? 'height: calc(max(min(10vw, 40px), 20px)*4)' : ''">
                        {{ data[selector][section][header] }}
                    </v-container>
                </v-container>

                <v-container class="outerHaveContainer"
                v-else-if="Array.isArray(data[selector][section][header])">
                    <v-container class="headerCell"
                    :style="'height: calc(max(min(10vw, 40px), 20px) * ' + data[selector][section][header].length + ');'">
                        {{ displayTextObj[section][header] }}
                    </v-container>

                    <v-container class="haveContainer">
                        <v-container v-for="haveCell in data[selector][section][header]" class="data[selector]Cell">
                            {{ haveCell }}
                        </v-container>
                    </v-container>
                </v-container>

                <v-container class="outerHaveContainer"
                v-else-if="typeof displayTextObj[section][header] == 'object'">
                    <v-container class="headerCell"
                    :style="'height: calc(max(min(10vw, 40px), 20px) * ' + (Object.keys(data[selector][section][header]).length*2) + ');'">
                        {{ displayTextObj[section][header]["SELF"] }}
                    </v-container>

                    <v-container class="haveContainer">
                        <v-container v-for="subHeader in Object.keys(data[selector][section][header])" class="wrapper">
                            <v-container class="headerCell" style="border-right: none; ">
                                {{ displayTextObj[section][header][subHeader] }}
                            </v-container>
            
                            <v-container class="dataCell">
                                {{ data[selector][section][header][subHeader] }}
                            </v-container>
                        </v-container>
                    </v-container>
                </v-container>
            </v-container>
        </v-container>
    </v-container>
</template>

<style>
:root {
    --height: max(min(10vw, 40px), 20px);
    --width: min(max(80vw, 440px), 600px);

    --sectionBgColor: #2e2e2e;
    --sectionTxColor: #dbdbdb;

    --objHeaderBgColor: #2e2e2e;
    --objHeaderTxColor: #afaeae;

    --headerBgColor: #6b6a6a;
    --headerTxColor: #333333;

    --dataBgColor: #797979;
    --dataTxColor: #2e2e2e;
}

.v-container {
    padding: 0
}

.formSectionTitle {
    width: var(--width);
    background-color: var(--sectionBgColor);
    color: var(--sectionTxColor);
    font-size: max(min(4vw, 40px), 30px);
    border-bottom: 1px solid black;
    font-family: arvo-bold;
}

.tableRow {
    height: var(--height);
    width: var(--width);
    display: flex;
}

.objHeader {
    background-color: var(--objHeaderBgColor);
    color: var(--objHeaderTxColor);
} 

.headerCell, .data[selector]Cell, .objHeader {
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    overflow: hidden;
    height: var(--height);
    flex: 1;
    font-family: utendo;
    border-bottom: 1px solid black;
}

.headerCell {
    background-color: var(--headerBgColor);
    color: var(--headerTxColor);
    border-right: 1px solid black;
}

.dataCell {
    background-color: var(--dataBgColor);
    color: var(--dataTxColor);
}

.outerHaveContainer {
    text-align: center;
    align-items: center;
    justify-content: center;
    width: var(--width);
    flex: 1;
    font-family: utendo;
    display: flex;
}

.haveContainer {
    text-align: center;
    align-items: center;
    justify-content: center;
    flex: 1;
    font-family: utendo;
    border:0;
}

.autoCell {
    width: calc(var(--width) / 4);
}
</style>