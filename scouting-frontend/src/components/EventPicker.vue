<template>
  <div class="text-center">
    <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn color="indigo" v-bind="props">
          <v-icon>calendar-outline</v-icon>
        </v-btn>
      </template>
      <v-card min-width="300">
        <v-list></v-list>
        <v-divider></v-divider>
        <v-list>
          <v-list-item>
            <v-select
              label="Year"
              :item-props="yearProps"
              :items="years"
              :hint="`${chosenYear.game}`"
              persistent-hint
              return-object
              single-line
              v-model="chosenYear"
            ></v-select>
          </v-list-item>
          <v-list-item>
            <v-select
              label="Event"
              :item-props="eventProps"
              :items="events"
              :hint="`${chosenEvent.location}`"
              persistent-hint
              return-object
              single-line
              v-model="chosenEvent"
            ></v-select>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="menu = false">Cancel</v-btn>
          <v-btn color="primary" @click="menu = false">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref } from "vue";
const menu = ref(false);
const chosenEvent = ref("");
const chosenYear = ref("");

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
