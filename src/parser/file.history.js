class FileHistory {
    constructor(filename, commits, patterns) {
        this.filename = filename;
        //this.commits = commits;

        /* age */
        this.ageDate = this.getRecentCommitDate(commits);
        this.ageDiff = this.getTimeDifference(this.ageDate);
        /* attributes */
        this.attributes = this.applyPatterns(this.filename, patterns);
        /* changes */
        this.changes = this.getLinesAdded(filename, commits);
        this.changesCount = this.changes.length;
        this.bodyChanges = this.transformChangesToArray(this.filename, this.changes, this.attributes, this.changesCount);
        /* authors */
        this.authors = this.getAuthors(commits);
        this.authorsCount = this.authors.length;
        this.bodyAuthors = this.transformAuthorsToArray(this.filename, this.authors, this.attributes, this.changesCount);
        /*changeCoupling */
        this.changeCoupling = this.getChangeCoupling(filename, commits);
        this.bodyCoupling = this.transformCouplingToArray(this.filename, this.changeCoupling, this.attributes, this.changesCount);
    }

    transformChangesToArray(filename, changeCoupling, attributes, changesCount) {
        /*
        IN
        {hash: commits[i].hash, date, lines_add, lines_del, lines_diff}
        OUT
        {filename: "", commitHash: "", date, lines_add: 100, lines_del:200, lines_diff: -100}
        */
        if (!changeCoupling) 
            return [];
        
        let out = [];

        for (let i = 0; i < changeCoupling.length; i++) {
            let value = changeCoupling[i];
            let object = {
                filename,
                commitHash: value.hash,
                date: value.date,
                lines_add: value.lines_add,
                lines_del: value.lines_del,
                lines_diff: value.lines_diff,
                attributes,
                changesCount
            }
            out.push(object);
        }

        return out;
    }

    transformCouplingToArray(filename, changeCoupling, attributes, changesCount) {
        /*
        IN
        {filename, nrTimes: value, couplingRatio: percentage}
        OUT
        {filename: "", couplingFilename: "", couplingRatio: 100}
        */
        if (!changeCoupling) 
            return [];
        let out = [];

        for (let i = 0; i < changeCoupling.length; i++) {
            let value = changeCoupling[i];
            let object = {
                filename,
                couplingFilename: value.filename,
                couplingRatio: value.couplingRatio,
                attributes,
                changesCount
            }
            out.push(object);
        }

        return out;
    }

    transformAuthorsToArray(filename, authors, attributes, changesCount) {
        //{authorName: key, nrCommits: value}
        /*
        [{filename: "", author: "", nrOfContributions: ""}]
        */
        if (!authors) 
            return [];
        let out = [];

        for (let i = 0; i < authors.length; i++) {
            let value = authors[i];
            let object = {
                filename,
                author: value.authorName,
                nrOfContributions: value.nrCommits,
                attributes,
                changesCount
            };
            out.push(object);
        }

        return out;
    }

    applyPatterns(filename, patterns) {
        var attributes = {};

        for (let i = 0; i < patterns.length; i++) {
            let patternName = patterns[i].name;
            let patternValue = patterns[i].value;

            if (filename.match(patternValue) != null) {
                attributes[patternName] = true;
            } else {
                attributes[patternName] = false;
            }
        }

        return attributes;
    }

    getTimeDifference(then) {
        var now = new Date();
        var thenDate = new Date(then);
        const diffTime = Math.abs(now - thenDate);
        // Days
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getChangeCoupling(filename, commits) {
        let files = {};
        // count all
        for (let i = 0; i < commits.length; i++) {
            let commit = commits[i];
            for (let j = 0; j < commit.changes.length; j++) {
                let change = commit.changes[j];
                if (change.file == filename) 
                    continue; //skip
                
                if (files[change.file] == null) {
                    files[change.file] = 1;
                } else {
                    files[change.file]++;
                }
            }
        }
        // measure percentage
        let keys = Object.keys(files);
        let out = [];
        for (let j = 0; j < keys.length; j++) {
            let key = keys[j];
            let filename = key;
            let value = files[key];
            let percentage = (value / commits.length) * 100;
            if (percentage > 75 && commits.length > 5) 
                out.push({filename, nrTimes: value, couplingRatio: percentage});
            }
        //
        return out;
    }

    _getChangeOfFile(filename, commit) {
        for (let j = 0; j < commit.changes.length; j++) {
            let change = commit.changes[j];
            if (change.file == filename) 
                return change;
            }
        return null;
    }

    getLinesAdded(filename, commits) {
        // date, and value
        let changes = [];
        for (let i = 0; i < commits.length; i++) {
            let change = this._getChangeOfFile(filename, commits[i]);
            let lines_add = Number(change.lines_add);
            let lines_del = Number(change.lines_del);
            let lines_diff = Number(lines_add - lines_del);

            let date = commits[i].date;

            changes.push({hash: commits[i].hash, date, lines_add, lines_del, lines_diff})
        }
        return changes;
    }

    getChanges(commits) {
        let changes = [];
        for (let i = 0; i < commits.length; i++) {
            changes.push({hash: commits[i].hash, date: commits[i].date, lines_add})
        }
        return changes;
    }

    getRecentCommitDate(commits) {
        let max = commits[0].date;
        for (let i = 0; i < commits.length; i++) {
            let date = commits[i].date;
            if (date > max) {
                max = date;
            }
        }
        return max;
    }

    getAuthors(commits) {
        let authors = {};
        for (let i = 0; i < commits.length; i++) {
            let author = commits[i].author;

            // clean FARFETCH/...
            author = author.replace("FARFETCH\\", "")

            if (authors[author] != null) {
                authors[author] = authors[author] + 1;
            } else {
                authors[author] = 1;
            }
        }

        //
        let authors2 = [];
        let keys = Object.keys(authors);
        for (let j = 0; j < keys.length; j++) {
            let key = keys[j];
            let value = authors[key];
            authors2.push({authorName: key, nrCommits: value});
        }

        return authors2;
    }

    isValid(includeFiles) {
        if (includeFiles && this.filename.match(includeFiles) == null) 
            return false;
        return true;
    }
}

module.exports = FileHistory;