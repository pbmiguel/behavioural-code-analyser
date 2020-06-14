let args = [];
process
    .argv
    .forEach(function (val, index, array) {
        console.log(index + '=' + val);
        let vals = val.split("=");
        args[vals[0]] = vals[1];
    });

let commitsPath = args["commitsPath"];
/* read configuration parameters*/
let params = require('./conf');
/* read commits history */
let reader = require("./reader/reader");
let commits = reader.read(commitsPath, params.dateI, params.dateF, params.includeFiles);
console.log("commits.length=" + commits.length);
/* analyse history */
let parser = require("./parser/parse");
var filesHistory = parser.parse(commits, params.patterns, params.includeFiles)
console.log("filesHistory.length=" + filesHistory.length);
/* put into elastic search */
let toElastic = require("./toElastic/toElastic");
toElastic
    .toElastic(filesHistory, params.storageIndex)
    .then((wasSuccessful) => console.log(wasSuccessful
        ? "Successful"
        : "Errors Occurred"));