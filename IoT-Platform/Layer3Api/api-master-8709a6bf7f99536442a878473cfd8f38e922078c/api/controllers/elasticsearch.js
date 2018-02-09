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
    requestTimeout: 10000,
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
        type: environment.dataType,
        from: 0,
        size: 10000,
        _source: ["id"],
    }, function (error, response, status) {
        if (error)
            return res.status(500).json(new models.ErrorMessage("Unable to retrieve list of boards!"));
        let result = [];
        let hits = response.hits.hits;
        for (let i = 0; i < hits.length; ++i) {
            if (hits[i]._source.id)
                result.push(hits[i]._source.id);
        }
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
        from: 0,
        size: 10000,
        body: {
            query: {
                match: { "id": req.swagger.params.board_id.value }
            },
        }
    }, function (error, response, status) {
        res.set('Content-Type', 'application/json');
        if (error || response.hits.total == 0)
            return res.status(500).json(new models.ErrorMessage("Unable to get board: " + req.swagger.params.board_id.value));
        let boards = response.hits.hits;
        console.log(boards[0]);
        let sensors = [];
        for (let i = 0; i < boards.length; i++)
            if (boards[i]._source.id == req.swagger.params.board_id.value)
                for (let j = 0; j < boards[i]._source.devices.sensors.length; ++j)
                    sensors.push(boards[i]._source.devices.sensors[j].id);
        sensors = sensors.filter((v, i, a) => a.indexOf(v) === i);
        let result = new models.Board(boards[0]._source.id, sensors);
        return res.status(200).json(result);
    });
};

function getSensorData(req, res) {
    console.log('DEBUG', 'board-id: ' + req.swagger.params.board_id.value, 'sensor-id: ' + req.swagger.params.sensor_id.value);
    client.search({
        index: environment.mainIndex,
        type: environment.dataType,
        from: 0,
        size: 10000,
        body: {
            query: {
                match: { "id": req.swagger.params.board_id.value }
            },
        }
    }, function (error, response, status) {
        res.set('Content-Type', 'application/json');
        if (error || response.hits.total == 0)
            return res.status(500).json(new models.ErrorMessage("Unable to get board: " + req.swagger.params.board_id.value));
        let boards = response.hits.hits;
        let result = [];
        for (let i = 0; i < boards.length; i++)
            if (boards[i]._source.id == req.swagger.params.board_id.value)
                for (let j = 0; j < boards[i]._source.devices.sensors.length; ++j) {
                    let sensor = boards[i]._source.devices.sensors[j];
                    if (sensor.id == req.swagger.params.sensor_id.value)
                        result.push(new models.Sensor(sensor.timestamp, ...sensor.values));
                }
        return res.status(200).json(result);
    });
}

function getSensorDataFrom(req, res) {
    console.log('DEBUG', 'board-id: ' + req.swagger.params.board_id.value, 'sensor-id: ' + req.swagger.params.sensor_id.value, 'from: ' + req.swagger.params.from.value);
    client.search({
        index: environment.mainIndex,
        type: environment.dataType,
        from: 0,
        size: 10000,
        body: {
            query: {
                match: { "id": req.swagger.params.board_id.value }
            },
        }
    }, function (error, response, status) {
        res.set('Content-Type', 'application/json');
        if (error || response.hits.total == 0)
            return res.status(500).json(new models.ErrorMessage("Unable to get board: " + req.swagger.params.board_id.value));
        let boards = response.hits.hits;
        let result = [];
        for (let i = 0; i < boards.length; i++)
            if (boards[i]._source.id == req.swagger.params.board_id.value)
                for (let j = 0; j < boards[i]._source.devices.sensors.length; ++j)
                    if (boards[i]._source.devices.sensors[j].id == req.swagger.params.sensor_id.value) {
                        let sensor = boards[i]._source.devices.sensors[j];
                        let fromTimestamp = new Date(req.swagger.params.from.value * 1000);
                        let timetamp = new Date(sensor.timestamp * 1000);
                        if (timetamp >= fromTimestamp)
                            result.push(new models.Sensor(sensor.timestamp, ...boards[i]._source.devices.sensors[j].values));
                    }
        return res.status(200).json(result);
    });
}

function getSensorDataFromTo(req, res) {
    console.log('DEBUG', 'board-id: ' + req.swagger.params.board_id.value, 'sensor-id: ' + req.swagger.params.sensor_id.value, 'from: ' + req.swagger.params.from.value, 'to: ' + req.swagger.params.to.value);
    client.search({
        index: environment.mainIndex,
        type: environment.dataType,
        from: 0,
        size: 10000,
        body: {
            query: {
                match: { "id": req.swagger.params.board_id.value }
            },
        }
    }, function (error, response, status) {
        res.set('Content-Type', 'application/json');
        if (error || response.hits.total == 0)
            return res.status(500).json(new models.ErrorMessage("Unable to get board: " + req.swagger.params.board_id.value));
        let boards = response.hits.hits;
        let result = [];
        for (let i = 0; i < boards.length; i++)
            if (boards[i]._source.id == req.swagger.params.board_id.value)
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
        return res.status(200).json(result);
    });
}