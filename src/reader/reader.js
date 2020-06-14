const fs = require('fs');
const Commit = require("./modal.commit");

function _readCommit(content, includeFiles) {
    let commit = _getCommitDescription(content[0]);

    // content changed
    for (let i = 1; i < content.length; i++) {
        const line = content[i].split("\t");
        const lines_add = line[0];
        const lines_del = line[1];
        const file = line[2];

        if (line && file) {
            // filter
            if (file.match(includeFiles) != null) 
                commit.addChange(lines_add, lines_del, file);
            }
        else {
            let commit2 = _getCommitDescription(content[i]);
            if (commit2 != null) 
                commit = commit2;
            }
        }

    return commit;
}

function _getCommitDescription(content) {

    const hash = (content.match(/(?<=\[)(.*?)(?=\])/));
    const date = (content.match(/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/))
    const author = content
        .substring(hash[0].length + 2, date['index'])
        .trim();
    const title = content.substring(date['index'] + date[0].length).trim();

    return new Commit(hash[0], author, date[0], title);
}

module.exports = {
    read(filePath, dateI, dateF, includeFile) {
        const file_content = fs.readFileSync(filePath, "utf-8");
        if (!file_content) 
            throw new Error("Error Reading File");
        
        // split into paragraphs
        const lines = file_content.split("\n");
        //
        let sum = 0;
        let commit_data = [];
        let commits = [];

        // create commit modal
        for (var i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (!line) {
                sum++;
                // create Commit
                let comi = _readCommit(commit_data, includeFile);
                if (comi.isValid(dateI, dateF)) 
                    commits.push(_readCommit(commit_data, includeFile));
                
                commit_data = [];
            } else {
                commit_data.push(line);
            }
        }

        return commits;
    }
};