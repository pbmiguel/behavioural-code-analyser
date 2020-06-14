const FileHistory = require("./file.history")

module.exports = {
    parse(commits, patterns, includeFiles) {
        let filesHistory = [];
        const files = [..._getAllFiles(commits)];

        for (let i = 0; i < files.length; i++) {
            let file = files[i];

            // get all commits of file
            let commitsOfFile = _getAllCommitsOfFile(file, commits);

            // get the file history
            let fileHistory = new FileHistory(file, commitsOfFile, patterns);

            // insert file if valid
            if (fileHistory.isValid(includeFiles)) 
                filesHistory.push(fileHistory);
            }
        
        return filesHistory;
    }
}

function _getAllFiles(array) {
    // get all files
    let out = new Set();
    for (let i = 0; i < array.length; i++) {
        let commit = array[i];
        for (let j = 0; j < commit.changes.length; j++) {
            const filename = commit.changes[j].file;

            out.add(filename);
        }
    }
    return out;
}

function _getAllCommitsOfFile(filename, array) {
    let out = [];
    for (let i = 0; i < array.length; i++) {
        let commit = array[i];

        if (_getFileFromCommit(filename, commit)) {
            out.push(commit);
        }
    }
    return out;
}

function _getFileFromCommit(filename, commit) {
    for (let j = 0; j < commit.changes.length; j++) {
        const filenameOfChange = commit.changes[j].file;
        if (filenameOfChange == filename) 
            return true;
        }
    return false;
}