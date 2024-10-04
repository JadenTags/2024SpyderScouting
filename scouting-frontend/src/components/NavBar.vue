<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user";
import UserComponent from "@/components/NavUser.vue";
import vars from "@/vars";

const userStore = useUserStore();

const greeting = computed(() => {
  var time = new Date().getHours();

  if (5 <= time && time < 12) {
    return "Good Morning";
  } else if (12 <= time && time < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
});

const windowWidth = ref(window.innerWidth);
window.addEventListener("resize", () => {
  windowWidth.value = window.innerWidth;
});

const includeGreeting = computed(() => {
  return windowWidth.value >= vars.greetingMinWidth;
});
const includeIcon = computed(() => {
  return windowWidth.value >= vars.iconMinWidth;
});
const includePicklisting = computed(() => {
  return windowWidth.value >= vars.picklistingMinWidth;
});
const navButtonDivWidth = computed(() => {
  if (includeIcon.value) {
    return "width: 90%";
  } else {
    return "width: 100%";
  }
});

function scrollToTop() {
  window.scrollTo(0,0);
}
</script>

<template>
  <v-app-bar id="appBar">
    <img v-if="includeIcon" id="spyderLogo" src="../images/spyderLogo.png" />

    <v-divider
      v-if="$router.currentRoute.value.name != 'LogIn' && includeIcon"
      vertical>
    </v-divider>

    <div id="outerButtonsDiv" :style="navButtonDivWidth">
      <div id="navButtons" v-if="$router.currentRoute.value.name != 'LogIn'">
        <v-btn
          @click="$router.push('/home'); scrollToTop();"
          :disabled="$router.currentRoute.value.name == 'Home' || vars.lockNav"
          class="navButton"
          rounded="0"
          style="height: 100%">
          HOME
        </v-btn>

        <v-divider class="m-auto h-3/5" vertical></v-divider>

        <v-btn
          @click="$router.push('/forms/pit'); scrollToTop();"
          :disabled="($router.currentRoute.value.name?.includes('Form') && !$router.currentRoute.value.name?.includes('Display')) || vars.lockNav"
          class="navButton"
          rounded="0"
          style="height: 100%">
          FORMS
        </v-btn>

        <v-divider class="m-auto h-3/5" vertical></v-divider>

        <v-btn
          @click="$router.push('/displays/teamSearch'); scrollToTop();"
          :disabled="$router.currentRoute.value.name?.includes('Display') || vars.lockNav"
          class="navButton"
          rounded="0"
          style="height: 100%">
          DISPLAYS
        </v-btn>

        <v-divider
          v-if="includePicklisting"
          class="m-auto h-3/5"
          vertical>
        </v-divider>

        <v-btn
          v-if="includePicklisting"
          @click="$router.push('/picklisting/teamSort'); scrollToTop();"
          :disabled="$router.currentRoute.value.name?.includes('Picklisting') || vars.lockNav"
          class="navButton"
          rounded="0"
          style="height: 100%">
          PICKLISTING
        </v-btn>

        <v-divider v-if="includeGreeting" vertical></v-divider>
      </div>
    </div>

    <UserComponent v-if="$router.currentRoute.value.name != 'LogIn' && includeGreeting" class="w-1/10"/>
  </v-app-bar>
</template>

<style>
.navButton {
  flex: 1;
  height: 100%;
}

.navButton:disabled {
  background-color: rgb(255, 255, 255);
  color: black;
}

#navButtons {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: auto;
  justify-content: space-between;
}

#outerButtonsDiv {
  width: 80%;
  height: 100%;
}

#greetingDiv {
  align-items: center;
  width: 200px;
  float: right;
  text-align: center;
}

#spyderLogo {
  float: left;
  margin-left: 1%;
  margin-right: 1%;
  height: 60%;
}

#appBar {
  color: #9b9696;
  background-color: #272727;
  display: flex;
  overflow: auto;
  justify-content: space-between;
  text-align: center;
  vertical-align: middle;
  margin-bottom: 20vw;
}

#greetingText {
  font-size: 13px;
  right: 0;
  padding: 10px;
  font-family: kanit-light;
}
</style>
