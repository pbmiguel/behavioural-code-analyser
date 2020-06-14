module.exports = {
    patterns: [
        {
            name: "isTest",
            value: /.*test.*$/gi
        }, {
            name: "isProductionCode",
            value: /.*\/src\/.*$/gi
        }, {
            name: "isShared",
            value: /.*\/shared\/.*$/gi
        }
    ],
    dateI: "2019-01-01",
    dateF: "2020-12-12",
    includeFiles: /^packages\/.*js$/gi,
    storageIndex: "react-commits"
}