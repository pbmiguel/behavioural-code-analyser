class Commit {
    constructor(hash, author, date, title) {
        this.hash = hash;
        this.author = author;
        this.date = date;
        this.title = title;
        this.changes = [];
    }

    addChange(lines_add, lines_del, file) {
        this
            .changes
            .push({file, lines_add, lines_del})
    }

    isValid(dateI, dateF) {
        if (dateI && this.date < dateI) 
            return false;
        if (dateF && this.date > dateF) 
            return false;
        return true;
    }
}

module.exports = Commit;