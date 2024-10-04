
<script setup></script>

<template>
  <v-container>
  <v-card>
    <v-card-title>Whoops!</v-card-title>
    <v-card-text>
      You found a dead link!  Click below to return!
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" to="/forms/match">Forms</v-btn>
      <v-btn color="primary" to="/displays/match">Displays</v-btn>
    </v-card-actions>
  </v-card>
  </v-container>
</template>

<style>
p {
  color: gray;
}

h1 {
  color: gray;
}
</style>
