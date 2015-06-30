/// <reference path="../../typings/mocha/mocha.d.ts"/>
/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../typings/mocha/mocha.d.ts"/>
/// <reference path="../../typings/supertest/supertest.d.ts""/>
/// <reference path="../../typings/superagent/superagent.d.ts"/>
'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');
var deploymentLocation = 'http://' + 'localhost' + ':' + '9615';
var extend = require('util')._extend;
var api = supertest.agent(deploymentLocation);
var fs = require('fs');
var path = require('path');
var url = require('url');

var https = require('https');

var xml = '';

function test(done) {

    api.post('/').send(xml).end(function (err, res) {
        if (err) {
            return done(err);
        }
        if (res.body && res.body.bbRecord) {
            return done();
        }
        done(res.body);
    });
}

before("Getting test XML", function (done) {

    var callback = function (response) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            xml = str;
            done();
        });

    };
    var req = https.get({
        host: 'raw.githubusercontent.com',
        path: '/amida-tech/DRE/master/test/artifacts/demo-r1.5/bluebutton-01-original.xml'
    }, callback);

    req.on('error', function (e) {
        done(e);
    });

});

describe("Test upload", function () {
    it("feed service with data (1)", function (done) {
        this.timeout(10000);
        test(done);
    });
    it("feed service with data (2)", function (done) {
        this.timeout(10000);
        test(done);
    });
    it("feed service with data (3)", function (done) {
        this.timeout(10000);
        test(done);
    });
    it("feed service with data (4)", function (done) {
        this.timeout(10000);
        test(done);
    });
    it("feed service with data (5)", function (done) {
        this.timeout(10000);
        test(done);
    });
    it("feed service with data (6)", function (done) {
        this.timeout(10000);
        test(done);
    });
});
