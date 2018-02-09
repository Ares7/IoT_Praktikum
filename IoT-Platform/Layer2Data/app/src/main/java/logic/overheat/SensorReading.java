package logic.overheat;

//This is the java class for reading the coming sensor value.
//As sensor format changes, this file should also change.

public class SensorReading {

    String id;
    Device devices;

    protected class Device {

        Sensor[] sensors;
    }

    protected class Sensor {
        String id;
        Long timestamp;
        Value[] values;


    }

    protected class Value {
        String name;
        float value;
        String unit;

        public String toString() {

            return this.name + " : " + this.value + " " + this.unit;
        }
    }


}

