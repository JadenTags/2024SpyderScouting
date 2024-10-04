import { defineStore } from "pinia";
import config from '@/config';
import axios from "@/axios"; //DOES NOT WORK BRUH
import vars from '@/vars';

const driveHeaders = new Headers({
  'Content-Type': 'application/x-www-form-urlencoded',
});
const driveAuthCodeLink = 'https://accounts.google.com/o/oauth2/token';
const driveApiRoot = 'https://www.googleapis.com';
const driveRefreshTokenBody = 'grant_type=refresh_token&client_id=' + config.clientId + '&client_secret=' + config.clientSecret + '&refresh_token=' + config.driveRefreshToken;

export const useDriveStore = defineStore("drive", {
  state: () => ({
    token: "",
  }),
  actions: {
    async getGsKey() {
      return await fetch(driveAuthCodeLink, {
        method: 'POST',
        headers: driveHeaders,
        body: driveRefreshTokenBody
      })
      .then(response => response.json())
      .then(data => {
        return new Headers({
          Authorization: 'Bearer ' + data.access_token,
        });
      });
    },
    async uploadFile(file, name, folderId) {
      var http = driveApiRoot + '/upload/drive/v3/files?uploadType=multipart';
      
      var metaData = {
        name: name, 
        parents: [folderId]
      };
      
      var body = new FormData();
      body.append("metadata", new Blob([JSON.stringify(metaData)], {type: "application/json",}));
      body.append("file", file);
    
      fetch(http, {
        method: 'POST',
        headers: await this.getGsKey(),
        body: body
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      });
    },
    async getFileIds(containsInfo) {
      var http = driveApiRoot + '/drive/v3/files?q=' + encodeURI('name contains "' + containsInfo.join('" and "') + '"');

      return fetch(http, {
        method: 'GET',
        headers: await this.getGsKey()
      })
        .then(response => response.json())
    },
    async getFile(fileId) {
      var http = driveApiRoot + '/drive/v3/files/' + fileId;

      return fetch(http, {
        method: 'GET',
        headers: await this.getGsKey()
      })
        .then(response => response)
    },
    async getRoboPics() {
      var files = (await this.getFileIds([vars.year + vars.tbaEventId])).files.map(x => ['https://drive.google.com/thumbnail?id=' + x.id, x.name.split(' ').pop()])
      var linkObj = {};

      for (let i = 0; i < files.length; i++) {
        linkObj[files[i][1]] = files[i][0];
      }

      return linkObj;
    }
  },
});
