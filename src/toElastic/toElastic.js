var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [
        {
            type: 'stdio',
            levels: ['error', 'warning'] // change these options
        }
    ],
    apiVersion: '7.6', // use the same version of your Elasticsearch instance
});

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});

module.exports = {
    async toElastic(filesHistory, indexName = 'commits') {
        let errors = 0;

        for (let i = 0; i < filesHistory.length; i++) {
            if (i % 20 == 0) 
                console.log(`Still going ${i}/${filesHistory.length}`);
            
            try {
                var bulkList = [];

                // overall / info await client.index({index: indexName, body: filesHistory[i]});
                bulkList.push({
                    index: {
                        _index: indexName
                    }
                });
                bulkList.push(filesHistory[i]);

                /* todo authors */
                let bodyAuthors = filesHistory[i].bodyAuthors;
                let indexNameAuthors = `${indexName}-authors`;
                /*for (let j = 0; j < bodyAuthors.length; j++) {
                    await client.index({index: indexNameAuthors, body: bodyAuthors[j]});
                }*/
                for (let j = 0; j < bodyAuthors.length; j++) {
                    bulkList.push({
                        index: {
                            _index: indexNameAuthors
                        }
                    });
                    bulkList.push(bodyAuthors[j]);
                }

                /* todo code churn */
                let bodyChanges = filesHistory[i].bodyChanges;
                let indexNameChanges = `${indexName}-changes`;
                /*for (let j = 0; j < bodyChanges.length; j++) {
                    await client.index({index: indexNameChanges, body: bodyChanges[j]});
                }*/
                for (let j = 0; j < bodyChanges.length; j++) {
                    bulkList.push({
                        index: {
                            _index: indexNameChanges
                        }
                    });
                    bulkList.push(bodyChanges[j]);
                }

                /* todo coupling */
                let bodyCoupling = filesHistory[i].bodyCoupling;
                let indexNameCoupling = `${indexName}-coupling`;
                /*for (let j = 0; j < bodyCoupling.length; j++) {
                    await client.index({index: indexNameCoupling, body: bodyCoupling[j]});
                }*/
                for (let j = 0; j < bodyCoupling.length; j++) {
                    bulkList.push({
                        index: {
                            _index: indexNameCoupling
                        }
                    });
                    bulkList.push(bodyCoupling[j]);
                }

                //
                if (bodyCoupling.length > 0) {
                    await client.bulk({body: bulkList});
                }

            } catch (error) {
                errors++;
                console.log("ERROR:" + error);
            }
        }

        return errors == 0;
    }
}