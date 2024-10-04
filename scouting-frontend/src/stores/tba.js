import { defineStore } from "pinia";
import axios from "axios"; //DOES NOT WORK BRUH
import config from '@/config';
import vars from "@/vars";

const tbaHeaders = new Headers({
  "X-TBA-Auth-Key" : config.tbaKey,
});
const tbaApiRoot = "https://www.thebluealliance.com/api/v3/";

export const useTbaStore = defineStore("tba", {
  state: () => ({
    token: "",
  }),
  actions: {
    async getTbaData(link) {
      return await fetch(tbaApiRoot + link, {
        method: 'GET',
        headers: tbaHeaders
      }).then(r => r.json());
    },
    async getTeam(teamNum) {
      return await this.getTbaData("team/frc" + teamNum); 
    },
    async getMatch(matchNum) {
      return await this.getTbaData("match/" + vars.year + vars.tbaEventId + "_qm" + matchNum);
    },
    async getEventTeams() {
      return await this.getTbaData("event/" + vars.year + vars.tbaEventId + "/teams"); 
    },
    async getEventMatches() {
      return await this.getTbaData("event/" + vars.year + vars.tbaEventId + "/matches"); 
    },
    async getRankings() {
      return await this.getTbaData("event/" + vars.year + vars.tbaEventId + "/rankings"); 
    }
  },
});
