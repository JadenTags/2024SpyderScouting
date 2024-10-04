<script setup>
    import {ref} from 'vue';

    const buttonStyle = ref("");
    var toggleValue = false;

    function toggleButton() {
        if (toggleValue) {
            buttonStyle.value = "";
        } else {
            buttonStyle.value = "background-color: #9b9696; color: black;";
        }

        toggleValue = !toggleValue;
    }
</script>

<script>
    export default {
        props: {
            text: String
        }
    }
</script>

<template>
    <v-btn
        class="btn toggleButton"
        @click="toggleButton()"
        :style="buttonStyle"
        :ripple="false">
        {{ text }}
    </v-btn>
</template>

<style>
.toggleButton {
    font-size: min(2.5vw, 16px);
    max-height: 50px;
    max-width: 220px;
    display: block;
    height: 8vw;
    width: 50vw;
    margin: auto;
    margin-top: 0;
    margin-bottom: min(5vw, 40px);
}
</style>