package core;

//The interface class for Jobs.
public interface StreamJob {

    //Name of the kafka input class.
    String getInputChannel();

    String getApplicationId();
    //Name of the kafka output class.
    String getOutputChannel();

    //Name of the ElasticSearch index
    String getDBIndex();

    //Name of document type
    String getDocType();

    //Business logic, the return value is propagated to Output channel
    String myProcess(String value);

    String getKafkaIp();

    String getElasticIp();
}
