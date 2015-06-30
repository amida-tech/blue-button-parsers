/// <reference path="../../typings/node/node.d.ts"/>
'use strict';

var config = require('../config');
var http = require('http');
var debug = require('debug')('blue-button-parsers');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var childs = [];
var count = 0;

var parse_servers = [{
    server: 'localhost',
    port: 9615
}];

/* */
var bb = require('blue-button');
var bbm = require('blue-button-meta');
var _ = require('lodash');
var npi = require('npi-js');
/* */

function fix_dbg_port() {
    if (process._debugPort) {
        process._debugPort += (cluster.isMaster) ? 1 : 2 + cluster.worker.id;
    }
}

/**
 * @function
 * Parse incoming string
 * @param {String} inputRecord
 * @return {Object} with structure { error: true, result: <error>} or {error:false, result: {bbRecord:<parsed record>, bbType:<type detected> }}
 */
var processInput = function (inputRecord) {
    var bbRecord;
    var bbRecordType;

    try {
        bbRecordType = bb.senseString(inputRecord);
        if (bbRecordType.type === 'cms') {
            bbRecord = bb.parseText(inputRecord);
            //console.log(JSON.stringify(bbRecord, null, 4));
        } else if (bbRecordType.type === 'ccda' || bbRecordType.type === 'c32' || bbRecordType.type === 'cda') {
            bbRecord = bb.parseString(inputRecord);
        } else if (bbRecordType.type === 'blue-button.js') {
            bbRecord = {
                "type": "blue-button.js",
                "data": JSON.parse(inputRecord).data
            };
        } else if (bbRecordType.type === 'ncpdp') {
            bbRecord = bb.parse(inputRecord);
        }

        //console.log(bbRecord.meta);

    } catch (parseError) {
        return {
            error: true,
            result: parseError
        };
    }
    return {
        error: false,
        result: {
            'bbRecord': bbRecord,
            'bbRecordType': bbRecordType
        }
    };
};

/**
 * @function
 * Lunch a set of services on a shared port, number of servces equals number of CPU cores.
 * @param {Nuber} port - default 9615
 */
var lunch = function (port) {
    var i;
    if (cluster.isMaster) {
        fix_dbg_port();
        for (i = 0; i < numCPUs; i++) {
            childs.push(cluster.fork());
        }
    } else {
        fix_dbg_port();
        http.createServer(function (req, res) {
            if (req.method === 'POST') {
                if (req.headers.bearer !== (config.secret || config.defaultSecret)) {
                    res.statusCode = 401;
                    res.end();
                    return;
                }

                if (cluster.worker) {
                    debug("Worker " + cluster.worker.id + " pid is " + process.pid + " serving request " + (++count));
                }
                var req_body = '';
                req.on('data', function (chunk) {
                    req_body += chunk;
                });
                req.on('end', function () {

                    debug(req_body);

                    var result = processInput(req_body);

                    var body = new Buffer(JSON.stringify(result.result));
                    res.writeHead(((result.error) ? 400 : 200), {
                        'Content-Length': body.length,
                        'Content-Type': 'application/json'
                    });

                    res.end(body);
                    debug("Worker " + cluster.worker.id + " pid is " + process.pid + " done    request " + count);
                });

            } else {
                if (cluster.worker) {
                    res.end("Worker " + cluster.worker.id + " " + process.pid + ".");
                } else {
                    res.end("Master.");
                }
            }
        }).listen(port || config.port || config.defaultPort);
    }
};

if (require.main === module) {
    // Called directly, so spawn childs and create server

    lunch();

} else {
    // Used as module, export configuration
    exports = module.exports = {
        lunch: lunch
    };
}
