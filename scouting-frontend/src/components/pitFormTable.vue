<script setup>
import { toRefs } from 'vue';
import { pitFormFormat } from '@/views/formsViews/PitFormView.vue';

const props = defineProps({
    data: Object,
});
const { data } = toRefs(props);

const displayTextObj = {
    "general": {
        "SELF": "General",
        "programmingLanguage": "Language",
        "dimensions": {
            "SELF": "Dims",
            "length": "Length",
            "width": "Width"
        },
        "fitUnderStage": "Under Stage",
        "dbType": "DB Type",
        "dbTypeInput": "DB Type Input",
        "motorType": "Motor Type",
        "gearRatio": "Gear Ratio",
        "hasBuddyClimb": "Buddy Climb",
        "pickups": "Pickups",
        "canShoot": "Can Shoot",
        "speakerShootingPositions": "Shooting Pos",
        "notes": "Notes",
    },
    "auto": {
        "SELF": "Auto",
        "noAuto": "No Auto",
        "otfPathPlanning": "Path Planning",
        "hasCenterDisrupt": "Center Disrupt",
        "autos": {
            "SELF": "Autos",
            "preload": "Preload",
            "exit": "Exit",
            "nearNotes": "Near Notes",
            "centerNotes": "Center Notes"
        },
    },
    "teleop": {
        "SELF": "Teleop",
        "canClimb": "Climb",
        "canHarmonize": "Harmonize"
    }
}
</script>

<template>
    <v-container>
        <v-container v-if="data == 'NO DATA'" class="p-0">
            <h1 class="title">NO DATA</h1>
        </v-container>

        <v-container v-else v-for="section in Object.keys(pitFormFormat)">
            <v-container class="formSectionTitle">
                {{ displayTextObj[section]["SELF"] }}
            </v-container>

            <v-container v-for="header in Object.keys(pitFormFormat[section])" class="wrapper">
                <v-container class="tableRow"
                v-if="['string', 'number', 'boolean'].includes(typeof data[section][header])"
                :style="header == 'notes' ? 'height: calc(max(min(10vw, 40px), 20px)*4)' : ''">
                    <v-container class="headerCell" :style="header == 'notes' ? 'height: calc(max(min(10vw, 40px), 20px)*4)' : ''">
                        {{ displayTextObj[section][header] }}
                    </v-container>
    
                    <v-container class="dataCell" :style="header == 'notes' ? 'height: calc(max(min(10vw, 40px), 20px)*4)' : ''">
                        {{ data[section][header] }}
                    </v-container>
                </v-container>

                <v-container class="outerHaveContainer"
                v-else-if="header == 'autos'">
                    <v-container class="headerCell"
                    :style="'height: calc(max(min(10vw, 40px), 20px) * ' + (data[section][header].length*(Object.keys(data[section][header][0]).length + 1)) + ');'">
                        {{ displayTextObj[section][header]["SELF"] }}
                    </v-container>

                    <v-container class="haveContainer">
                        <v-container v-for="(auto, autoNum) in Object.keys(data[section][header])" class="wrapper">
                            <v-container class="objHeader" style="border-right: none; ">
                                {{ "Auto " + (autoNum + 1) }}
                            </v-container>

                            <v-container class="flex">
                                <v-container v-for="miniIndex in [0, 1]" class="wrapper">
                                    <v-container v-for="(subHeader, index) in Math.ceil(Object.keys(data[section][header][auto]).length/2)" class="wrapper"
                                    style="width: calc(min(max(80vw, 440px), 600px) / 4)">
                                        <v-container class="autoCell headerCell m-0" style="border-right: none; ">
                                            {{ displayTextObj[section][header][Object.keys(data[section][header][auto])[(index * 2) + miniIndex]] }}
                                        </v-container>
                        
                                        <v-container class="autoCell dataCell m-0">
                                            {{ data[section][header][auto][Object.keys(data[section][header][auto])[(index * 2) + miniIndex]] }}
                                        </v-container>
                                    </v-container>
                                </v-container>
                            </v-container>
                        </v-container>
                    </v-container>
                </v-container>

                <v-container class="outerHaveContainer"
                v-else-if="Array.isArray(data[section][header])">
                    <v-container class="headerCell"
                    :style="'height: calc(max(min(10vw, 40px), 20px) * ' + data[section][header].length + ');'">
                        {{ displayTextObj[section][header] }}
                    </v-container>

                    <v-container class="haveContainer">
                        <v-container v-for="haveCell in data[section][header]" class="dataCell">
                            {{ haveCell }}
                        </v-container>
                    </v-container>
                </v-container>

                <v-container class="outerHaveContainer"
                v-else-if="typeof displayTextObj[section][header] == 'object'">
                    <v-container class="headerCell"
                    :style="'height: calc(max(min(10vw, 40px), 20px) * ' + (Object.keys(data[section][header]).length*2) + ');'">
                        {{ displayTextObj[section][header]["SELF"] }}
                    </v-container>

                    <v-container class="haveContainer">
                        <v-container v-for="subHeader in Object.keys(data[section][header])" class="wrapper">
                            <v-container class="headerCell" style="border-right: none; ">
                                {{ displayTextObj[section][header][subHeader] }}
                            </v-container>
            
                            <v-container class="dataCell">
                                {{ data[section][header][subHeader] }}
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

.headerCell, .dataCell, .objHeader {
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