package apps;

import core.StreamJob;
import core.KafkaNode;
import logic.overheat.Overheat;
import logic.proximity.Proximity;

public class RunKafka {

    /**
     * Runs the Kafka Streams Application.
     * @param args does nothing
     */
    public static void main(String args[]){

        StreamJob myJob=new Overheat();
        KafkaNode.runKafkaStreams(myJob);
    }
}
