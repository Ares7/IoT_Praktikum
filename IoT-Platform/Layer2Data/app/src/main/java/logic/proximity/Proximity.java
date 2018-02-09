package logic.proximity;

import core.StreamJob;

public class Proximity implements StreamJob {
    @Override
    public String getInputChannel() {
        return null;
    }

    @Override
    public String getOutputChannel() {
        return null;
    }

    @Override
    public String getDBIndex() {
        return null;
    }

    @Override
    public String getDocType() {
        return null;
    }

    @Override
    public String myProcess(String value) {
        return null;
    }

    @Override
    public String getApplicationId(){
        return null;
    }

    public String getKafkaIp(){return null;}

    public String getElasticIp(){return null;}

}
