package logic.overheat;

import com.google.gson.Gson;
import core.StreamJob;

//This is a business logic for a client.

public class Overheat implements StreamJob {

    private String InputChannel = "sensor-input";
    private String OutputChannel = "streams-sensor-output";
    private String DBIndex = "myclient2";
    private String DBDocType = "sensor";
    private String AppId="streams.overheat";


    /**
     * Read temperature value from sensor, print OVERHEAT if it's more than 40.
     * @param value Json value coming from sensor
     * @return unprocessed value
     */
    @Override
    public String myProcess(String value) {
        

        Gson g = new Gson();
        SensorReading s = g.fromJson(value, SensorReading.class);

	for (int i=0;i<s.devices.sensors.length;i++){

		SensorReading.Value[] vals=s.devices.sensors[i].values;
		for (int k=0;k<vals.length;k++){
        	SensorReading.Value v = vals[k]; //read json data
        	System.out.println(v.toString());
		}
	}
    return value; //<--- unprocessed value
}


    @Override
    public String getInputChannel() {
        return readFromEnv("KAFKA_INPUT_CHANNEL",InputChannel);
    }

    @Override
    public String getOutputChannel() {
        return readFromEnv("KAFKA_OUTPUT_CHANNEL",OutputChannel);
    }

    @Override
    public String getDBIndex() {
        return readFromEnv("ELASTIC_DB_INDEX",DBIndex);
    }

    @Override
    public String getDocType() {
        return readFromEnv("ELASTIC_DOC_TYPE",DBDocType);
    }

    @Override
    public String getApplicationId(){return readFromEnv("KAFKA_APP_ID",AppId);}

    public String getKafkaIp(){return readFromEnv("KAFKA_IP","localhost");}

    public String getElasticIp(){return readFromEnv("ELASTIC_IP","141.40.254.44");}

    private String readFromEnv(String envName,String defaultValue){
        String envVariable=System.getenv(envName);
        return envVariable!=null ? envVariable:defaultValue;
    }
}
