import axios from "axios";

axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "http://localhost:5050/v1"; // Used for local development with a local api server
axios.defaults.baseURL = "https://api.scouting.teamspyder.science/v1";
axios.defaults.withCredentials = false;

var temp = JSON.parse(localStorage.getItem("auth"));
if (temp) {
    axios.defaults.headers.common["Authorization"] = temp["token"];
}

export default axios;
