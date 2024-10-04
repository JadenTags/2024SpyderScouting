<script setup>
import { toRefs, watch, computed } from 'vue';

const props = defineProps({
    data: Object,
    colors: String,
    refs: Object
});
const { data, colors, refs } = toRefs(props);

const colorObjs = {
    "neutralColorObj": {
        "basicCell": {
            "background": "#797979",
            "text": "#2e2e2e"
        },
        "haveCell": {
            "background": "#797979",
            "text": "#2e2e2e"
        },
        "dataHeaderCell": {
            "background": "#636363",
            "text": "#2e2e2e"
        },
        "dataInfoCell": {
            "background": "#797979",
            "text": "#2e2e2e"
        },
        "dataPercentCell": {
            "background": "#666666",
            "text": "#2e2e2e"
        },
        "yesCell": {
            "background": "#698a65",
            "text": "#2e2e2e"
        },
        "noCell": {
            "background": "#8a6565",
            "text": "#2e2e2e"
        },
        "sectionCell": {
            "background": "#3b3b3b",
            "text": "#2e2e2e"
        }
    }
}
const curColors = computed(() => {
    return colorObjs[colors.value];
});

async function useColors(cellType) {
    var cellList = await document.getElementsByClassName(cellType);
    
    for (let cell of cellList) {
        cell.style.backgroundColor = curColors.value[cellType]["background"];
        cell.style.color = curColors.value[cellType]["text"];
    }
}

watch(data,
    async () => {
        ["basicCell", "haveCell", "dataHeaderCell", "dataInfoCell", "dataPercentCell", "yesCell", "noCell", "sectionCell"].forEach(cellType => {
            useColors(cellType);
        });
    },
    {
        immediate: true
    }
)

const computeWithAuto = ['Exit%'];
const computeWithTele = ['Endgame%', 'Climb Time', 'Trap%', 'Buddy ATPT%', 'Buddy SCS%'];
</script>

<template>
    <v-container class="table">
        <v-container v-if="data['noData']" class="p-0">
            <h1 class="title">NO DATA</h1>
        </v-container>
        
        <v-container v-else class="p-0">
            <v-container v-for="section in Object.keys(data)" class="section">
                <v-container class="sectionCell"
                v-if="Object.values(data[section]).filter(x => x != 'DONT SHOW').length > 0"></v-container>

                <v-container v-for="header in Object.keys(data[section])" class="wrapper">
                    <v-container
                    v-if="['string', 'number'].includes(typeof data[section][header]) && data[section][header] != 'DONT SHOW'"
                    :id="header + 'Cell'"
                    class="basicCell">
                        {{ data[section][header] }}
                    </v-container>

                    <v-container
                    v-else-if="data[section][header]['TYPE'] == 'COMPLEX' && !data[section][header]['DONT SHOW']"
                    class="complexCell">
                        <v-container class="row">
                            <v-container v-for="subHeader in Object.keys(data[section][header]).filter(x => !['TYPE'].includes(x))" class="dataHeaderCell">
                                {{ subHeader }}
                            </v-container>
                        </v-container>

                        <v-container class="row">
                            <v-container v-for="subHeader in Object.keys(data[section][header]).filter(x => !['TYPE'].includes(x))" class="dataInfoCell">
                                {{ data[section][header][subHeader] }}
                            </v-container>
                        </v-container>
                    </v-container>

                    <v-container
                    v-else-if="data[section][header]['TYPE'] == 'HAVE' && (Object.values(data[section][header]).includes(true) || Object.values(data[section][header]).includes('ND'))"
                    class="haveContainer"
                    :style="'height: min(' + Object.values(data[section][header]).filter(x => x == true || x == 'ND').length*10 + 'vw, ' + Object.values(data[section][header]).filter(x => x == true || x == 'ND').length*40 + 'px)'">
                        <v-container v-for="subHeader in Object.keys(data[section][header]).filter(x => !['TYPE'].includes(x))" class="wrapper">
                            <v-container
                            v-if="data[section][header][subHeader] != ''"
                            class="haveCell">
                                {{ data[section][header][subHeader] == "ND" ? "ND" : subHeader }}
                            </v-container>
                        </v-container>
                    </v-container>

                    <v-container
                    v-else-if="refs[section] && refs[section][header] && data[section][header]['TYPE'] == 'YESNO'"
                    @click="refs[section][header]['ref'] = !refs[section][header]['ref']"
                    :class="'row duration-500 ' + (refs[section][header]['ref'] ? '' : 'delayedFlex')"
                    :style="refs[section][header]['ref'] ? 'display: block; height: calc(min(max(10vw, 25px), 40px) * ' + (Object.keys(data[section][header]).filter(x => x != 'TYPE' && data[section][header][x] != '').length) + ');' : 'height: min(max(10vw, 25px), 40px)'">
                        <v-container v-for="type in Object.keys(data[section][header]).filter(x => x != 'TYPE' && typeof data[section][header][x] == 'number')" class="dataPercentContainer"
                            :style="refs[section][header]['ref'] ? 'flex: ' + (Object.keys(data[section][header])[0] == type ? 1 : 0) : (type.includes('EXTRA_') ? 'width: 0; transition-delay: 400ms;' : 'flex: ' + data[section][header][type] + ';transition-delay: 500ms; transition-duration: 1s;')">
                            <p class="dataPercentCell duration-500" :style="refs[section][header]['ref'] ? 'height: calc((calc(min(max(10vw, 25px), 40px) * ' + (Object.keys(data[section][header]).filter(x => x != 'TYPE' && data[section][header][x] != '').length) + ')/' + (Object.keys(data[section][header]).filter(x => !x.includes('EXTRA_') && x != 'TYPE').length != 0 ? Object.keys(data[section][header]).filter(x => !x.includes('EXTRA_') && x != 'TYPE').length : 1) : ''">
                                <p v-if="type == 'ND'" :class="'dataPercentText ' + (type == 'Y' ? 'yesCell' : 'noCell')">
                                    ND
                                </p>
                                <p v-else-if="type.includes('EXTRA_')" :class="'dataPercentText ' + (type == 'Y' ? 'yesCell' : 'noCell')"></p>
                                <p v-else-if="computeWithAuto.includes(header)" :class="'dataPercentText ' + (type == 'Y' ? 'yesCell' : 'noCell')">
                                    {{ refs[section][header]['ref'] ? type + ": " + Math.round(Math.round(data["General"]["Matches"] * data["Auto"]["Auto"]["Y"] / 100) * data[section][header][type] / 100) + " Match(es)" : type }}
                                </p>
                                <p v-else-if="computeWithTele.includes(header)" :class="'dataPercentText ' + (type == 'Y' ? 'yesCell' : 'noCell')">
                                    {{ refs[section][header]['ref'] ? type + ": " + Math.round(Math.round(data["General"]["Matches"] * data["General"]["Failure%"]["N"] / 100) * data[section][header][type] / 100) + " Match(es)" : type }}
                                </p>
                                <p v-else :class="'dataPercentText ' + (type == 'Y' ? 'yesCell' : 'noCell')">
                                    {{ refs[section][header]['ref'] ? type + ": " + Math.round(data["General"]["Matches"] * data[section][header][type] / 100) + " Match(es)" : type }}
                                </p>
                            </p>
                        </v-container>
                    </v-container>

                    <v-container
                    v-else-if="refs[section] && refs[section][header] && data[section][header]['TYPE'] == 'PERCENT'"
                    @click="refs[section][header]['ref'] = !refs[section][header]['ref']"
                    :class="'row duration-500 ' + (refs[section][header]['ref'] ? '' : 'delayedFlex')"
                    :style="refs[section][header]['ref'] ? 'display: block; height: calc(min(max(10vw, 25px), 40px) * ' + (Object.keys(data[section][header]).filter(x => x != 'TYPE' && data[section][header][x] != '').length) + ');' : 'height: min(max(10vw, 25px), 40px)'">
                        <v-container v-for="type in Object.keys(data[section][header]).filter(x => x != 'TYPE' && typeof data[section][header][x] == 'number')" class="dataPercentContainer"
                        :style="refs[section][header]['ref'] ? 'flex: ' + (Object.keys(data[section][header])[0] == type ? 1 : 0) : (type.includes('EXTRA_') ? 'width: 0; transition-delay: 400ms;' : 'flex: ' + data[section][header][type] + ';transition-delay: 500ms; transition-duration: 1s;')">
                            <p class="dataPercentCell duration-500" :style="refs[section][header]['ref'] ? 'height: calc((calc(min(max(10vw, 25px), 40px) * ' + (Object.keys(data[section][header]).filter(x => x != 'TYPE' && data[section][header][x] != '').length) + ')/' + (Object.keys(data[section][header]).filter(x => !x.includes('EXTRA_') && x != 'TYPE').length != 0 ? Object.keys(data[section][header]).filter(x => !x.includes('EXTRA_') && x != 'TYPE').length : 1) : ''">
                                <p v-if="type == 'ND'">
                                    ND
                                </p>
                                <p v-else-if="type.includes('EXTRA_')"></p>
                                <p v-else-if="computeWithAuto.includes(header)" :style="refs[section][header]['ref'] ? '' : 'transition-duration: 500ms; transform: rotate(-90deg);'">
                                    {{ refs[section][header]['ref'] ? type + ": " + Math.round(Math.round(data["General"]["Matches"] * data["Auto"]["Auto"]["Y"] / 100) * data[section][header][type] / 100) + " Match(es)" : type}}
                                </p>
                                <p v-else-if="computeWithTele.includes(header)" :style="refs[section][header]['ref'] ? '' : 'transition-duration: 500ms; transform: rotate(-90deg);'">
                                    {{ refs[section][header]['ref'] ? type + ": " + Math.round(Math.round(data["General"]["Matches"] * data["General"]["Failure%"]["N"] / 100) * data[section][header][type] / 100) + " Match(es)" : type }}
                                </p>
                                <p v-else :style="refs[section][header]['ref'] ? '' : 'transition-duration: 500ms; transform: rotate(-90deg);'">
                                    {{ refs[section][header]['ref'] ? type + ": " + Math.round(data["General"]["Matches"] * data[section][header][type] / 100) + " Match(es)" : type}}
                                </p>
                            </p>
                        </v-container>
                    </v-container>
                </v-container>
            </v-container>
        </v-container>
    </v-container>
</template>

<style>
@keyframes bTof {
    from {display: block;}
    to {display: default;}
}

.delayedFlex {
    animation: bTof;
    animation-duration: 1500ms;
}

#NameCell {
    max-height: 300px;
    height: 12vw;
    min-height: 150px;
    font-size: min(4vw, 20px);
}

.yesCell, .noCell {
    width: 100%;
    height: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
}

.table {
    max-width: 150px;
    height: 100vh;
    display: inline-block;
    flex: 1;
    padding: 0;
    height: 100%;
    width: 30%;
    margin: 0;
    padding: 0;
}

.section {
    width: 100%;
    padding: 0;
}

.row {
    width: 100%;
    padding: 0;
    display: flex;
}

.basicCell {
    background-color: #797979;
    height: min(10vw, 40px);
    font-size: min(max(3vw, 15px), 22px);
    border-left: 1px solid black;
    border-top: 1px solid black;
    padding: 0;
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
}

.haveContainer {
    padding: 0;
    border-top: 1px solid black;
}

.haveCell {
    background-color: #797979;
    height: min(10vw, 40px);
    font-size: min(max(3vw, 15px), 20px);
    border-left: 1px solid black;
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    padding: 0;
}

.complexCell {
    padding: 0;
    height: min(10vw, 40px);
    border-left: 1px solid black;
}

.dataHeaderCell {
    border-top: 1px solid black;
    background-color: #636363;
    height: min(5vw, 20px);
    font-size: min(max(3.25vw, 13px), 16px);
    flex: 1;
    padding: 0;
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
}

.firstCell {
    border-left: 1px solid black;
}

.dataInfoCell {
    background-color: #797979;
    height: min(5vw, 20px);
    font-size: min(max(3.25vw, 13px), 16px);
    flex: 1;
    padding: 0;
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
}

.dataPercentContainer {
    padding: 0;
}

.dataPercentCell {
    background-color: #666666;
    height: min(max(10vw, 25px), 40px);
    flex: 1;
    border-top: 1px solid black;
    border-left: 1px solid black;
    padding: 0;
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    overflow: hidden;
    font-size: max(min(2.5vw, 16px), 10px);
}

.sectionCell {
    background-color: #3b3b3b;
    height: min(10vw, 40px);
    font-size: min(4vw, 20px);
    font-weight: bolder;
    font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    border-top: 1px solid black;
    padding: 0;
    width: 100%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
}

.wrapper {
    padding: 0;
}
</style>