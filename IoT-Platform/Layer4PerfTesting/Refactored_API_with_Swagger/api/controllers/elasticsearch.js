'use strict';

var util = require('util');
const http = require('http');

var environment = require('./../environment');
var models = require('./../models');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: environment.elasticSearchUrl,
});

client.ping({
    requestTimeout: 30000,
}, function (error) {
    if (error) {
        console.error(error);
        console.error('ElasticSearch cluster is down!');
    } else {
        console.log('Connected to ElasticSearch');
    }
});

module.exports = {
    getAllBoards,
    getBoard,
    getSensorData,
    getSensorDataFrom,
    getSensorDataFromTo
};

function getAllBoards(req, res) {
    client.search({
        index: environment.mainIndex,
        type: environment.dataType
    }, function (error, response, status) {
        if (error)
            return res.status(500).json({ error: "Unable to retrieve list of boards!" });
        let result = [];
        let hits = response.hits.hits;
        for (let i = 0; i < hits.length; ++i)
            result.push(hits[i]._source.id);
        result = result.filter((v, i, a) => a.indexOf(v) === i);

        // check if we found something
        if (result.length == 0)
            result = { error: "No boards found. The database index has to be adjusted!" };
        res.set('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
}

function getBoard(req, res) {
    console.log('DEBUG', 'board-id: ' + req.swagger.params.board_id.value);
    client.search({
        index: environment.mainIndex,
        type: environment.dataType,
        body: {
            query: {
                match: { "id": req.swagger.params.board_id.value }
            },
        }
    }, function (error, response, status) {
        console.log('DEBUG', response);

        if (error || response.hits.total == 0)
            return res.status(500).json({ error: "Unable to get board: " + req.swagger.params.board_id.value });
        let boards = response.hits.hits;
        let sensors = [];
        for (let i = 0; i < boards.length; i++)
            for (let j = 0; j < boards[i]._source.devices.sensors.length; ++j)
                sensors.push(boards[i]._source.devices.sensors[j].id);
        sensors = sensors.filter((v, i, a) => a.indexOf(v) === i);
        let result = new models.Board(boards[0]._source.id, sensors);
        res.set('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
};

function getSensorData(req, res) {
    console.log('DEBUG', 'board-id: ' + req.swagger.params.board_id.value, 'sensor-id: ' + req.swagger.params.sensor_id.value);
    client.search({
        index: environment.mainIndex,
        type: environment.dataType,
        body: {
            query: {
                match: { "id": req.swagger.params.board_id.value }
            },
        }
    }, function (error, response, status) {
        if (error || response.hits.total == 0)
            return res.status(500).json({ error: "Unable to get board: " + req.swagger.params.board_id.value });
        let boards = response.hits.hits;
        let result = [];
        for (let i = 0; i < boards.length; i++)
            for (let j = 0; j < boards[i]._source.devices.sensors.length; ++j) {
                let sensor = boards[i]._source.devices.sensors[j];
                if (sensor.id == req.swagger.params.sensor_id.value)
                    result.push(new models.Sensor(sensor.timestamp, ...sensor.values));
            }
        res.set('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
}

function getSensorDataFrom(req, res) {
    console.log('DEBUG', 'board-id: ' + req.swagger.params.board_id.value, 'sensor-id: ' + req.swagger.params.sensor_id.value, 'from: ' + req.swagger.params.from.value);
    client.search({
        index: environment.mainIndex,
        type: environment.dataType,
        body: {
            query: {
                match: { "id": req.swagger.params.board_id.value }
            },
        }
    }, function (error, response, status) {
        if (error || response.hits.total == 0)
            return res.status(500).json({ error: "Unable to get board: " + req.swagger.params.board_id.value });
        let boards = response.hits.hits;
        let result = [];
        for (let i = 0; i < boards.length; i++)
            for (let j = 0; j < boards[i]._source.devices.sensors.length; ++j)
                if (boards[i]._source.devices.sensors[j].id == req.swagger.params.sensor_id.value) {
                    let sensor = boards[i]._source.devices.sensors[j];
                    let fromTimestamp = new Date(req.swagger.params.from.value * 1000);
                    let timetamp = new Date(sensor.timestamp * 1000);
                    if (timetamp >= fromTimestamp)
                        result.push(new models.Sensor(sensor.timestamp, ...boards[i]._source.devices.sensors[j].values));
                }
        res.set('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
}

function getSensorDataFromTo(req, res) {
    console.log('DEBUG', 'board-id: ' + req.swagger.params.board_id.value, 'sensor-id: ' + req.swagger.params.sensor_id.value, 'from: ' + req.swagger.params.from.value, 'to: ' + req.swagger.params.to.value);
    client.search({
        index: environment.mainIndex,
        type: environment.dataType,
        body: {
            query: {
                match: { "id": req.swagger.params.board_id.value }
            },
        }
    }, function (error, response, status) {
        if (error || response.hits.total == 0)
            return res.status(500).json({ error: "Unable to get board: " + req.swagger.params.board_id.value });
        let boards = response.hits.hits;
        let result = [];
        for (let i = 0; i < boards.length; i++)
            for (let j = 0; j < boards[i]._source.devices.sensors.length; ++j)
                if (boards[i]._source.devices.sensors[j].id == req.swagger.params.sensor_id.value) {
                    let sensor = boards[i]._source.devices.sensors[j];
                    let fromTimestamp = new Date(req.swagger.params.from.value * 1000);
                    let toTimestamp = new Date(req.swagger.params.to.value * 1000);
                    let timetamp = new Date(sensor.timestamp * 1000);
                    if (timetamp >= fromTimestamp)
                        if (toTimestamp >= timetamp)
                            result.push(new models.Sensor(sensor.timestamp, ...boards[i]._source.devices.sensors[j].values));
                }
        res.set('Content-Type', 'application/json');
        return res.status(200).json(result);
    });
}