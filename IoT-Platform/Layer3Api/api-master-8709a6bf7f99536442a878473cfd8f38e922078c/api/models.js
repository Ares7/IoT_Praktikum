function SensorValues() {
    this.name = "";
    this.value = 0;
    this.unit = "";
}

function Sensor(timestamp, values) {
    this.timestamp = timestamp;
    this.values = values;
}

function Board(id, sensors) {
    this.id = id;
    this.sensors = sensors;
}

function ErrorMessage(error) {
    this.message = error;
}

module.exports = {
    SensorValues: SensorValues,
    Sensor: Sensor,
    Board: Board,
    ErrorMessage: ErrorMessage
}