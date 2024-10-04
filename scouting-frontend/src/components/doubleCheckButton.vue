<script setup>
import {ref, toRefs} from 'vue';

const props = defineProps({
    text: String,
    fnc: Function,
    args: Array
});
const { text, fnc, args } = toRefs(props);

const onSecondClick = ref(false);
const loading = ref(false);

async function checkClick(fnc, args) {
    loading.value = true;

    if (onSecondClick.value) {
        await fnc(...args);
    }

    onSecondClick.value = !onSecondClick.value;
    loading.value = false;
}
</script>

<template>
    <div>
        <v-btn
            id="normButton"
            class="inline-block"
            @click="checkClick(fnc, args)"
            :ripple="false"
            :loading="loading">
            {{ !onSecondClick ? text : "Confirm"}}
        </v-btn>
    
        <v-btn
            v-if="onSecondClick"
            id="undoButton"
            class="inline-block"
            @click="onSecondClick = false;"
            :ripple="false">
          UNDO
        </v-btn>
    </div>
</template>

<style>
#normButton, #undoButton {
    color: white;
    max-height: 60px;
    height: 8vw;
    min-height: 60px;
    max-width: 200px;
    width: 20vw;
    min-width: 100px;
    font-size: max(min(2vw, 20px), 10px);
    background-color: #353535;
    margin: 0;
    margin: auto;
    margin-top: max(2vw, 20px);
    margin-bottom: max(2vw, 20px);
}

#undoButton {
    min-width: 60px;
    width: 10vw;
    margin-left: 5px;
}
</style>