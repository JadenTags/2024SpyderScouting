<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import {useUserStore} from "@/stores/user";
import {useAuthStore} from "@/stores/auth";

const router = useRouter()

const menu = ref(false);
const authStore = useAuthStore();
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

const chosenEvent = ref("");
const chosenYear = ref("");

const menu_items = ref([
  {
    title: "Logout",
    value: 1,
    click: () => {
      authStore.logout()
      router.push("/")
    }
  }
])

const years = ref([
  {
    year: 2024,
    game: "Creshendo",
  },
  {
    year: 2023,
    game: "Charged Up",
  },
]);
const events = ref([
  {
    name: "Ventura",
    location: "Los Angeles, CA, USA",
  },
  {
    name: "San Diego",
    location: "San Diego, CA, USA",
  },
]);

function yearProps(item) {
  return {
    title: item.year,
    subtitle: item.game,
  };
}
function eventProps(item) {
  return {
    title: item.name,
    subtitle: item.location,
  };
}

</script>

<template>
  <div class="text-center" style="height: 100%">
    <v-menu v-model="menu" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="text-xs" style="height: 100%">
          {{ greeting + ", " + userStore.getName }}
        </v-btn>
      </template>
        <v-list>
          <v-list-item
            v-for="item in menu_items"
            v-bind:key="item"
            @click="item.click"
            >
            {{ item.title }}
          </v-list-item>
        </v-list>
    </v-menu>
  </div>
</template>