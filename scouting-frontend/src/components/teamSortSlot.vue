<script setup>
const props = defineProps({
    data: Object,
    links: Object
});
</script>

<template>
    <v-container id="slot">
        <img v-if="links[data['id']['#']]" :src="links[data['id']['#']]" class="roboPic">
        <v-container v-else class="roboPic">
            NO PIC
        </v-container>

        <v-container id="infoContainer">
            <v-container id="idContainer" style="height: 25px;">
                <v-container class="left-5 absolute">
                    {{ "Rank " + data["id"]['Rank'] }}
                </v-container>

                <v-container>
                    {{ "Team " +  data["id"]['#'] + " | " + data["id"]['Name'] }}
                </v-container>

                <v-container class="right-5 absolute">
                    {{ data["id"]['Matches'] + " Match" + (data["id"]['Matches'] != 1 ? "es Scouted" : " Souted") }}
                </v-container>
            </v-container>

            <v-container id="dataContainer" style="height: calc(100% - 25px);">
                <v-container v-for="(section, index) in Object.keys(data).filter(x => x != 'id')" style="height: 100%;">
                    <v-container class="sectionHeader" :style="'height: 25px;' + (index == 0 ? 'border-left: 1px solid black;' : '')"> {{ section }} </v-container>

                    <v-container v-for="header in Object.keys(data[section])" id="actualDataContainer" :style="'height: calc( calc(100% - 25px) / ' + Object.keys(data[section]).length + ')'">
                        <v-container id="headerCell" style="width:fit-content;"> {{ header }} </v-container>

                        <v-container> {{ data[section][header] }} </v-container>
                    </v-container>
                </v-container>
            </v-container>
        </v-container>
    </v-container>
</template>

<style>
:root {
    --slotHeight: min(max(30vw, 150px), 300px);
}

#slot {
    height: var(--slotHeight);
    background-color: rgb(151, 151, 151);
    border-bottom: 1px solid black;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    text-align: center;
    display: flex;
}

#headerCell {
    background-color: rgb(143, 142, 142);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    text-align: center;
}

#infoContainer {
    width: 100%;
    height: 100%;
    display: block;
    flex: 100;
    margin-left: 10px;
}

#actualDataContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    text-align: center;
    border-left: 1px solid black;
}

#idContainer {
    border-left: 1px solid black;
}

#idContainer .v-container {
    width: fit-content;
    display: inline-block;
    font-weight: bold;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

#dataContainer {
    display: flex;
}

#dataContainer .v-container {
    flex: 1;
}

.sectionHeader {
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    background-color: rgb(116, 116, 116);
    border-bottom: 1px solid black;
}

.roboPic {
    border: 1px solid black;
    height: calc(var(--slotHeight) - 1vw);
    min-width: calc(calc(calc(var(--slotHeight) - 1vw) * 3) / 4);
    float: left;
    margin-left: 10px;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    flex: 1;
}
</style>