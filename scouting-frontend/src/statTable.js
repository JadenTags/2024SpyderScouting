import { ref } from "vue";
import { useReadStore } from "@/stores/read";
import { useTbaStore } from "@/stores/tba";

const readStore = useReadStore();
const tbaStore = useTbaStore();

function fillPercentObj(arr, path, header, ref) {
    var percentObj = {"TYPE": "YESNO"};
    var temp = arr.filter(x => x != null);
    var tot = temp.length;
  
    if (tot == 0) {
      path[header] = "DONT SHOW";
  
      return;
    }
  
    temp.forEach(x => {
      if (percentObj[x] == null) {
        percentObj[x] = 1;
      } else {
        percentObj[x]++;
      }
    });
  
    Object.keys(percentObj).forEach(key => {
      percentObj[key] = Math.floor(percentObj[key] / tot * 100);
    });
  
    Object.keys(ref).forEach(x => {
      if (!percentObj[x]) {
        delete path[header][ref[x]];
      } else {
        path[header][ref[x]] = percentObj[x];
      }
    });
}
  
function getScoreStats(scoreArr) {
    var scoreObj = {"TYPE": "COMPLEX"};
    var temp = scoreArr.filter(x => x != null);
    
    if (temp.length == 0) {
      scoreObj = "DONT SHOW";

      return scoreObj;
    }
  
    scoreObj["Max"] = Math.max(...temp.map(x => x.made));
    scoreObj["Avg"] = Math.round((temp.map(x => x.made).reduce((x, y) => x + y) * 10) / temp.length) / 10;

    if (scoreObj["Max"] == scoreObj["Avg"]) {
      scoreObj["Always"] = scoreObj["Max"];
      delete scoreObj["Max"];
      delete scoreObj["Avg"];
    } if (scoreObj["Always"] != 0) {
      scoreObj["ACC"] = Math.round((temp.map(x => x.made).reduce((x, y) => x + y)) / ((temp.map(x => x.made).reduce((x, y) => x + y)) + temp.map(x => x.missed).reduce((x, y) => x + y)) * 100) + "%";
    }
  
    if (scoreObj["ACC"] == "NaN%") {
      scoreObj = "DONT SHOW";
    }
  
    return scoreObj;
}
  
function getNormStats(arr) {
    var statsObj = {"TYPE": "COMPLEX"};
    var temp = arr.filter(x => x != null);
    
    if (temp.length == 0) {
      statsObj = "DONT SHOW";

      return statsObj;
    }
  
    statsObj["Max"] = Math.max(...temp);
    statsObj["Avg"] = Math.round((temp.reduce((x, y) => x + y) * 10) / temp.length) / 10;
  
    if (statsObj["Max"] == statsObj["Avg"]) {
      statsObj = "Always " + statsObj["Max"];
    }
  
    return statsObj;
}

function getYesNo(bool) {
  if (bool) {
    return "Yes";
  } else {
    return "No";
  }
}
  
function fillHaveObj(arr, path, header, ref) {
  arr.forEach(x => {
    path[header][ref[x]] = true;
  });
}

async function getStatTable(teamNum, eventNum, scoutingWarmps) {
  var teamsMatches = await readStore.getTeamsMatches(teamNum, eventNum, scoutingWarmps);
  var pitData = await readStore.getTeamPit(teamNum);
  var statTable = JSON.parse(JSON.stringify(statTableFormat));

  if (teamsMatches != "NO DATA") {
    // teamsMatches = teamsMatches.filter(x => x.other.failure != null);

    if (teamsMatches.length == 0) {
      teamsMatches = "NO DATA";
    }
  }
  
  statTable["General"]["Team"] = teamNum;

  statTable["General"]["Name"] = (await tbaStore.getTeam(teamNum)).nickname;
  
  if (pitData != "NO DATA") {
    ////////////////////////////////////GENERAL

    //LANGUAGE
    statTable["General"]["Language"] = pitData["general"]["programmingLanguage"];

    //DIMS
    statTable["General"]["Dims"]["L"] = pitData['general']['dimensions']['length'];
    statTable["General"]["Dims"]["W"] =  pitData['general']['dimensions']['width'];

    //UNDER STAGE
    statTable["General"]["Under Stage"] = getYesNo(pitData['general']['fitUnderStage']);

    //DRIVE BASE
    if (pitData['general']['dbTypeInput'] != '') {
      statTable["General"]["DB"] = pitData['general']['dbTypeInput'];
    } else {
      statTable["General"]["DB"] = pitData['general']['dbType'];
    }

    //HAS BUDDY
    statTable["General"]["Buddy"] = getYesNo(pitData['general']['hasBuddyClimb']);

    //MOTORS
    statTable["General"]["DB Motors"]["Type"] = pitData['general']['motorType'];
    statTable["General"]["DB Motors"]["Ratio"] = pitData['general']['gearRatio'];

    //PICKUPS
    fillHaveObj(pitData["general"]["pickups"], statTable["General"], ["Pickups"], {
      "under bumper": "UB",
      "over bumper": "OB",
      "source": "Source"
    });

    //CAN SHOOT
    fillHaveObj(pitData["general"]["canShoot"], statTable["General"], ["Can Shoot"], {
      "speaker": "Speaker",
      "amp": "Amp",
      "trap": "Trap"
    });

    //SHOOTING POSITIONS
    fillHaveObj(pitData["general"]["speakerShootingPositions"], statTable["General"], ["Shooting Pos"], {
      "subwoofer": "Subwoofer",
      "podium": "Podium",
      "under stage": "US"
    });

    ////////////////////////////////////AUTO

    //IF NO AUTO SELECTED
    if (pitData["auto"]["noAuto"]) {
      statTable["Auto"]["Auto"] = false;
      statTable["Auto"]["OTF Paths"] = false;
      statTable["Auto"]["Center Disrupt"] = false;
    } else {
      statTable["Auto"]["Auto"] = true;
      
      //ON THE FLY PATH PLANNING
      statTable["Auto"]["OTF Paths"] = getYesNo(pitData["auto"]["otfPathPlanning"]);

      //HAS CENTER DISRUPT AUTO
      statTable["Auto"]["Center Disrupt"] = getYesNo(pitData["auto"]["hasCenterDisrupt"]);

      //ALL AUTO PROFILES
      statTable["Auto"]["Autos"] = pitData["auto"]["autos"];
    }

    ////////////////////////////////////TELEOP

    //CLIMB
    statTable["Teleop"]["Climb"] = getYesNo(pitData["teleop"]["canClimb"]);

    //HARMONIZE
    statTable["Teleop"]["Harmonize"] = getYesNo(pitData["teleop"]["canHarmonize"]);
  } else {
    ////////////////////////////////////GENERAL

    //LANGUAGE
    statTable["General"]["Language"] = "DONT SHOW";

    //DIMS
    statTable["General"]["Dims"]["DONT SHOW"] = "DONT SHOW";

    //UNDER STAGE
    statTable["General"]["Under Stage"] = "DONT SHOW";

    //DRIVE BASE
    statTable["General"]["DB"] = "DONT SHOW";

    //HAS BUDDY
    statTable["General"]["Buddy"] = "DONT SHOW";

    //MOTORS
    statTable["General"]["DB Motors"]["DONT SHOW"] = "DONT SHOW";

    //PICKUPS

    //CAN SHOOT

    //SHOOTING POSITIONS

    ////////////////////////////////////AUTO

    statTable["Auto"]["Auto"] = "DONT SHOW";
    statTable["Auto"]["OTF Paths"] = "DONT SHOW";
    statTable["Auto"]["Center Disrupt"] = "DONT SHOW";
    statTable["Auto"]["Autos"] = "DONT SHOW";

    ////////////////////////////////////TELEOP

    //CLIMB
    statTable["Teleop"]["Climb"] = "DONT SHOW";

    //HARMONIZE
    statTable["Teleop"]["Harmonize"] = "DONT SHOW";

  }
  
  if (teamsMatches != "NO DATA") {
    //ALL DATA NULLIFICATION CASES
    teamsMatches.forEach(x => {
      //NO AUTO
      if (x.auto.noAuto) {
        x.auto.exited = null;
        x.auto.speaker = null;
        x.auto.amp = null;
        x.auto.failedPickups = null;
      }

      //DEFENSE
      if (x.teleop.playstyle == "Defense") {
        x.teleop.speaker = null;
        x.teleop.amp = null;
        x.teleop.passed = null;
      }

      //FAILURE
      if (x.other.failure) {
        x.teleop.speaker = null;
        x.teleop.amp = null;
        x.teleop.passed = null;
        x.endgame.endgame = null;
        x.endgame.climbTime = null;
        x.endgame.trap = null;
        x.endgame.trapScore = null;
        x.endgame.buddyClimb = null;
        x.endgame.buddyClimbOutcome = null;
      }

      //OWN HUMAN
      if (!x.endgame.ownHuman) {
        x.endgame.humanScore = null;
      }
    });

    if (teamsMatches.length == 0) {
      statTable["NO MATCH"] = true;
      return statTable;
    }

    ////////////////////////////////////GENERAL

    //FAILURE PERCENT
    fillPercentObj(teamsMatches.map(x => {
      if (x.other.failure == null) {
        return "none";
      } else {
        return x.other.failure;
      }
    }), statTable["General"], "Failure%", {
      "Mech": "MF",
      "Comms": "CF",
      "Tipped": "T",
      "No Show": "NS",
      "Stuttering": "ST",
      "none": "N"
    });

    //MATCHES SCOUTED
    statTable["General"]["Matches"] = teamsMatches.length;

    ////////////////////////////////////AUTO

    //NO AUTO PERCENT
    if (teamsMatches.length != 0) {
      statTable["Auto"]["Auto"] = {
        "Y": "",
        "N": "",
        "TYPE": "YESNO"
      }

      fillPercentObj(teamsMatches.map(x => x.auto.noAuto), statTable["Auto"], "Auto", {
        false: "Y",
        true: "N"
      });
    }

    //EXIT PERCENT
    fillPercentObj(teamsMatches.map(x => x.auto.exited), statTable["Auto"], "Exit%", {
      true: "Y",
      false: "N"
    });

    //SPEAKER SCORE
    statTable["Auto"]["Speaker"] = getScoreStats(teamsMatches.map(x => x.auto.speaker));

    //AMP SCORE
    statTable["Auto"]["Amp"] = getScoreStats(teamsMatches.map(x => x.auto.amp));

    //CYCLES
    statTable["Auto"]["Cycles"] = getScoreStats(teamsMatches.filter(x => ![x.auto.speaker, x.auto.amp].includes(null)).map(x => ({"made": x.auto.amp.made + x.auto.speaker.made, "missed": x.auto.amp.missed + x.auto.speaker.missed})));

    //TOTAL SHOT
    statTable["Auto"]["Total Shot"] = getNormStats(teamsMatches.filter(x => ![x.auto.speaker, x.auto.amp].includes(null)).map(x => x.auto.amp.made + x.auto.amp.missed + x.auto.speaker.made + x.auto.speaker.missed));

    //FAILED PICK UPS
    statTable["Auto"]["FPs"] = getNormStats(teamsMatches.map(x => x.auto.failedPickups));

    ////////////////////////////////////Teleop

    //SPEAKER SCORE
    statTable["Teleop"]["Speaker"] = getScoreStats(teamsMatches.map(x => x.teleop.speaker));

    //AMP SCORE
    statTable["Teleop"]["Amp"] = getScoreStats(teamsMatches.map(x => x.teleop.amp));

    //CYCLES
    statTable["Teleop"]["Cycles"] = getScoreStats(teamsMatches.filter(x => ![x.teleop.speaker, x.teleop.amp].includes(null)).map(x => ({"made": x.teleop.amp.made + x.teleop.speaker.made, "missed": x.teleop.amp.missed + x.teleop.speaker.missed})));

    //PASSED
    statTable["Teleop"]["Passed"] = getNormStats(teamsMatches.map(x => x.teleop.passed));

    //TOTAL SHOT
    statTable["Teleop"]["Total Shot"] = getNormStats(teamsMatches.filter(x => ![x.teleop.speaker, x.teleop.amp].includes(null) && x.teleop.passed).map(x => x.teleop.amp.made + x.teleop.amp.missed + x.teleop.speaker.made + x.teleop.speaker.missed + x.teleop.passed));
    
    //ROUGH DRIVING
    fillPercentObj(teamsMatches.map(x => x.teleop.roughDriving), statTable["Teleop"], "RD", {
      true: "Y",
      false: "N"
    });
    
    //ALMOST TIPPED
    statTable["Teleop"]["AT"] = getNormStats(teamsMatches.map(x => x.teleop.almostTipped));

    //PLAYSTYLE
    fillPercentObj(teamsMatches.map(x => x.teleop.playstyle), statTable["Teleop"], "Playstyle%", {
      "Offense": "Off",
      "Hybrid": "Hyb",
      "Defense": "Def",
      "IDK": "CNF"
    });
    
    //ENDGAME
    fillPercentObj(teamsMatches.map(x => x.endgame.endgame), statTable["Teleop"], "Endgame%", {
      "Scoring": "Sc",
      "Climbing": "Clmb",
      "Defending": "Def",
    });

    //CLIMB TIME
    fillPercentObj(teamsMatches.map(x => x.endgame.climbTime).filter(x => x), statTable["Teleop"], "Climb Time", {
      "5<": "5<",
      "10<": "10<",
      "10+": "10+",
    });

    //TRAP PERCENTAGE
    fillPercentObj(teamsMatches.map(x => x.endgame.trap), statTable["Teleop"], "Trap%", {
      true: "Y",
      false: "N"
    });

    //TRAP SCORE
    statTable["Teleop"]["Trap Score"] = getScoreStats(teamsMatches.map(x => x.endgame.trapScore));

    //HUMAN SCORE
    statTable["Teleop"]["Human Score"] = getScoreStats(teamsMatches.map(x => x.endgame.humanScore));

    //BUDDY ATTEMPT
    fillPercentObj(teamsMatches.map(x => x.endgame.buddyClimb), statTable["Teleop"], "Buddy ATPT%", {
      true: "Y",
      false: "N"
    });
    
    //BUDDY SCS
    fillPercentObj(teamsMatches.map(x => x.endgame.buddyClimbOutcome).filter(x => x), statTable["Teleop"], "Buddy SCS%", {
      "Success": "Y",
      "Fail": "N"
    });
    
    ////////////////////////////////////OVERALL

    //CYCLES
    statTable["Overall"]["Cycles"] = getScoreStats(teamsMatches.filter(x => ![x.auto.speaker, x.auto.amp, x.teleop.speaker, x.teleop.amp].includes(null)).map(x => ({"made": x.teleop.amp.made + x.teleop.speaker.made + x.auto.amp.made + x.auto.speaker.made, "missed": x.teleop.amp.missed + x.teleop.speaker.missed + x.auto.amp.missed + x.auto.speaker.missed})));
  } else {
    ////////////////////////////////////GENERAL

    //FAILURE PERCENT
    statTable["General"]["Failure%"] = "DONT SHOW";

    //MATCHES SCOUTED
    statTable["General"]["Matches"] = 0;

    ////////////////////////////////////AUTO

    //EXIT PERCENT
    statTable["Auto"]["Exit%"] = "DONT SHOW";

    //SPEAKER SCORE
    statTable["Auto"]["Speaker"] = "DONT SHOW";

    //AMP SCORE
    statTable["Auto"]["Amp"] = "DONT SHOW";

    //CYCLES
    statTable["Auto"]["Cycles"] = "DONT SHOW";

    //TOTAL SHOT
    statTable["Auto"]["Total Shot"] = "DONT SHOW";

    //FAILED PICK UPS
    statTable["Auto"]["FPs"] = "DONT SHOW";

    ////////////////////////////////////Teleop

    //SPEAKER SCORE
    statTable["Teleop"]["Speaker"] = "DONT SHOW";

    //AMP SCORE
    statTable["Teleop"]["Amp"] = "DONT SHOW";

    //CYCLES
    statTable["Teleop"]["Cycles"] = "DONT SHOW";

    //PASSED
    statTable["Teleop"]["Passed"] = "DONT SHOW";

    //TOTAL SHOT
    statTable["Teleop"]["Total Shot"] = "DONT SHOW";
    
    //ROUGH DRIVING
    statTable["Teleop"]["RD"] = "DONT SHOW";
    
    //ALMOST TIPPED
    statTable["Teleop"]["AT"] = "DONT SHOW";

    //PLAYSTYLE
    statTable["Teleop"]["Playstyle%"] = "DONT SHOW";
    
    //ENDGAME
    statTable["Teleop"]["Endgame%"] = "DONT SHOW";

    //CLIMB TIME
    statTable["Teleop"]["Climb Time"] = "DONT SHOW";

    //TRAP PERCENTAGE
    statTable["Teleop"]["Trap%"] = "DONT SHOW";

    //TRAP SCORE
    statTable["Teleop"]["Trap Score"] = "DONT SHOW";

    //HUMAN SCORE
    statTable["Teleop"]["Human Score"] = "DONT SHOW";

    //BUDDY ATTEMPT
    statTable["Teleop"]["Buddy ATPT%"] = "DONT SHOW";
    
    //BUDDY SCS
    statTable["Teleop"]["Buddy SCS%"] = "DONT SHOW";
    
    ////////////////////////////////////OVERALL

    //CYCLES
    statTable["Overall"]["Cycles"] = "DONT SHOW";
  }
  
  if (teamsMatches == "NO DATA" && pitData == "NO DATA") {
    statTable["noData"] = true;

    return statTable;
  }

  return statTable;
}

export default getStatTable;
export const statTableFormat = {
  "General": {
    "Name": "",
    "Team": "",
    "Language": "",
    "Dims": {
      "L": "",
      "W": "",
      "TYPE": "COMPLEX"
    },
    "Under Stage": "",
    "DB": "",
    "Buddy": "",
    "DB Motors": {
      "Type": "",
      "Ratio": "",
      "TYPE": "COMPLEX"
    },
    "Pickups": {
      "UB": "",
      "OB": "",
      "Source": "",
      "TYPE": "HAVE"
    },
    "Can Shoot": {
      "Speaker": "",
      "Amp": "",
      "Trap": "",
      "TYPE": "HAVE"
    },
    "Shooting Pos": {
      "Subwoofer": "",
      "Podium": "",
      "US": "",
      "TYPE": "HAVE"
    },
    "Failure%": {
      "MF": "",
      "CF": "",
      "T": "",
      "NS": "",
      "ST": "",
      "N": "",
      "TYPE": "PERCENT"
    },
    "Matches": ""
  },
  "Auto": {
    "Auto": "",
    "Exit%": {
      "Y": "",
      "N": "",
      "TYPE": "YESNO"
    },
    "OTF Paths": "",
    "Center Disrupt": "",
    "Autos": [],
    "Speaker": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    },
    "Amp": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    },
    "Cycles": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    },
    "Total Shot": {
      "Max": "",
      "Avg": "",
      "TYPE": "COMPLEX"
    },
    "FPs": {
      "Max": "",
      "Avg": "",
      "TYPE": "COMPLEX"
    }
  },
  "Teleop": {
    "Speaker": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    },
    "Amp": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    },
    "Cycles": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    },
    "Passed": {
      "Max": "",
      "Avg": "",
      "TYPE": "COMPLEX"
    },
    "Total Shot": {
      "Max": "",
      "Avg": "",
      "TYPE": "COMPLEX"
    },
    "RD": {
      "Y": "",
      "N": "",
      "TYPE": "YESNO"
    },
    "AT": {
      "Max": "",
      "Avg": "",
      "TYPE": "COMPLEX"
    }, 
    "Playstyle%": {
      "Off": "",
      "Hyb": "",
      "Def": "",
      "CNF": "",
      "TYPE": "PERCENT"
    },
    "Endgame%": {
      "Sc": "",
      "Clmb": "",
      "Def": "",
      "TYPE": "PERCENT"
    },
    "Climb": "",
    "Harmonize": "",
    "Climb Time": {
      "5<": "",
      "10<": "",
      "10+": "",
      "TYPE": "PERCENT"
    },
    "Trap%": {
      "Y": "",
      "N": "",
      "TYPE": "YESNO"
    },
    "Trap Score": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    },
    "Human Score": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    },
    "Buddy ATPT%": {
      "Y": "",
      "N": "",
      "TYPE": "YESNO"
    },
    "Buddy SCS%": {
      "Y": "",
      "N": "",
      "TYPE": "YESNO"
    }
  },
  "Overall": {
    "Cycles": {
      "Max": "",
      "Avg": "",
      "ACC": "",
      "TYPE": "COMPLEX"
    }
  }
};
export function getRefObj() {
  var refs = {};

  Object.keys(statTableFormat).forEach(section => {
    Object.keys(statTableFormat[section]).forEach(header => {
      if (statTableFormat[section][header] && (statTableFormat[section][header]['TYPE'] == "PERCENT" || statTableFormat[section][header]['TYPE'] == "YESNO")) {
        if (!refs[section]) {
          refs[section] = {};
        } if (!refs[section][header]) {
          refs[section][header] = {};
        }

        refs[section][header]['ref'] = ref(false);
      }
    });
  });

  return refs;
}