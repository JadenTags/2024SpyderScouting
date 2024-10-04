import { statTableFormat, getRefObj } from '@/statTable.js';

function checkAdd(path, header, addedHeader) {
    if (!path[header].includes(addedHeader) && !["Name", "Team", "Autos"].includes(addedHeader)) {
        path[header].push(addedHeader);
    }
}

function getCommonHeaders(teamOne, teamTwo, teamThree) {
    var commonHeaders = {"haveObjs": {}, "percentHeights": {}};

    [teamOne.value, teamTwo.value, teamThree.value].filter(x => x != null && !x.noData).forEach(teamData => {
        Object.keys(teamData).filter(x => !["NO PIT", "NO MATCH", "noData"].includes(x)).forEach(section => {
            let sectionData = teamData[section];

            if (commonHeaders[section] == null) {
                commonHeaders[section] = [];
            }

            Object.keys(sectionData).filter(x => x != "Autos").forEach(header => {
                let data = sectionData[header];
                let type = statTableFormat[section][header]["TYPE"];

                if (["string", "number"].includes(typeof data) && data != "DONT SHOW") {
                    checkAdd(commonHeaders, section, header);
                } else if (type == "COMPLEX" && !data["DONT SHOW"]) {
                    checkAdd(commonHeaders, section, header);
                } else if (type == "PERCENT" || type == "YESNO") {
                    checkAdd(commonHeaders, section, header);

                    if (!commonHeaders["percentHeights"][section]) {
                        commonHeaders["percentHeights"][section] = {};
                    }

                    let height = Object.values(data).filter(x => typeof x == "number").length;
                    if (!commonHeaders["percentHeights"][section][header] || commonHeaders["percentHeights"][section][header] < height) {
                        commonHeaders["percentHeights"][section][header] = height;
                    }
                } else if (data["TYPE"] == "HAVE" && Object.values(data).filter(x => x == true).length > 0) {
                    checkAdd(commonHeaders, section, header);

                    if (!commonHeaders["haveObjs"][section]) {
                        commonHeaders["haveObjs"][section] = {};
                    }

                    let height = Object.values(data).filter(x => x == true).length;
                    if (!commonHeaders["haveObjs"][section][header] || commonHeaders["haveObjs"][section][header] < height) {
                        commonHeaders["haveObjs"][section][header] = height;
                    }
                }
            });
        });
    });

    return commonHeaders;
}

export default function fillMissingHeaders(teamsData) {
    var newObj = [];
    var commonHeaders = getCommonHeaders(...teamsData);

    teamsData.filter(x => x).forEach(teamData => {   
        if (teamData["noData"]) {
            delete teamData["noData"];
        }

        Object.keys(commonHeaders).filter(x => x != "haveObjs" && x != "percentHeights").forEach(section => {
            let sectionData = teamData[section];

            commonHeaders[section].forEach(header => {
                let data = sectionData[header];
                let type = statTableFormat[section][header]["TYPE"];
                
                if (type == "PERCENT" || type == "YESNO") {
                    if (data == "DONT SHOW") {
                    sectionData[header] = {
                        "ND": 100,
                        "TYPE": type
                    }
                    }
                    
                    //PERCENT
                    let diff = commonHeaders["percentHeights"][section][header] - Object.values(sectionData[header]).filter(x => typeof x == "number").length;
                    for (let i = 0; i < diff; i++) {
                    sectionData[header]["EXTRA_" + i] = 1;
                    }
                } else if (type == "COMPLEX" && data["DONT SHOW"]) {
                    //COMPLEX
                    teamData[section][header] = "ND";
                } else if (type == "HAVE") {
                    //HAVE
                    let diff = commonHeaders["haveObjs"][section][header] - Object.values(data).filter(x => x == true).length;
                    
                    Object.keys(data).filter(subHeader => data[subHeader] != true).forEach(subHeader => {
                    if (diff-- > 0) {
                        data[subHeader] = "ND";
                    }
                    });
                } else if (["string", "number"].includes(typeof data) && data == "DONT SHOW") {
                    teamData[section][header] = "ND";
                }
            });
        });

        newObj.push(teamData);
    });

    return newObj;
}