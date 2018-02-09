/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package core;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.Topology;
import org.apache.kafka.streams.kstream.KStream;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.transport.InetSocketTransportAddress;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Properties;
import java.util.concurrent.CountDownLatch;

public class KafkaNode {


    /**
     * Configures the Kafka Stream and ElasticSearch.
     * <p>
     *     This method builds a kafka stream application that connects to the
     *     Kafka broker given with StreamJob Interface. It processes the data
     *     according to myProcess and sends the data to ElasticSearch also configured by StreamJob.
     * </p>
     * @see StreamJob
     * @param myJob - Configuration class for the Kafka Streams Job.
     */
    public static void runKafkaStreams(final StreamJob myJob) {

        //Config Start
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, myJob.getApplicationId()); //this string has no importance
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, myJob.getKafkaIp()+":19092,"+myJob.getKafkaIp()+":29092,"+myJob.getKafkaIp()+":39092"); //this will change eventually
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.producerPrefix(ProducerConfig.COMPRESSION_TYPE_CONFIG),"gzip");
		props.put(StreamsConfig.COMMIT_INTERVAL_MS_CONFIG,"5000");
        //Config End

        final StreamsBuilder builder = new StreamsBuilder(); //will use this to build the stream


	System.out.println(myJob.getInputChannel());
	System.out.println(myJob.getOutputChannel());
	System.out.println(myJob.getElasticIp());
	System.out.println(myJob.getKafkaIp());

        KStream<String, String> source = builder.stream(myJob.getInputChannel()); //name of the input topic

            source.mapValues(value -> myJob.myProcess(value)) //For every value I get, call MyValueMapper, returns string


                    //get returned string and send it to output channel

                    .through(myJob.getOutputChannel())

                    .mapValues(value -> {
                                try {
                                    WriteToElastic(value, myJob);
                                } catch (Exception e) {
                                    e.printStackTrace();

                                }
                                return value;
                            });


        //write value to elastic search
        //Above I used through() function, so that the delay to add the data to elasticsearch is not present when sending it output channel.
        //We first send the processed data to output, then save it to database.


        final Topology topology = builder.build(); //config


        final KafkaStreams streams = new KafkaStreams(topology, props);

        final CountDownLatch latch = new CountDownLatch(1);

        // attach shutdown handler to catch control-c
        Runtime.getRuntime().addShutdownHook(new Thread("streams-shutdown-hook") {
            @Override
            public void run() {
                streams.close();
                latch.countDown();
            }
        });

        try {
            streams.cleanUp();
            streams.start(); //Start the stream
            latch.await();
        } catch (Throwable e) {
            streams.start();
            System.exit(1);
        }
        System.exit(0);
    }


    /**
     * Sends data to ES 2.4
     * @param value Value to send to ES.Must be in JSON format.
     * @param myJob Configures ElasticSearch from StreamJob
     * @return unprocessed value
     * @see StreamJob
     */
    private static String WriteToElastic (String value,StreamJob myJob) throws Exception{


        TransportClient client; //Same as flink,localhost will change eventually
        try {

            /*
            FOR ELASTICSEARCH 6
            client = new PreBuiltTransportClient(Settings.EMPTY)
                    .addTransportAddress(new TransportAddress(InetAddress.getByName(myJob.getElasticIp()), 9300))
                    ;
            IndexResponse response=client.prepareIndex(myJob.getDBIndex(),myJob.getDocType())
                    .setSource(value, XContentType.JSON)
                    .get();
               */

            //FOR ELASTICSEARCH 2.4
            client = TransportClient.builder().build()
                    .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName(myJob.getElasticIp()), 9300));
            IndexRequest indexRequest = new IndexRequest(myJob.getDBIndex(), myJob.getDocType()); //index is kafka,type is rocks //the id of the element
            indexRequest.source(value); //the source is our processed data
            IndexResponse esResponse = client.index(indexRequest).actionGet(); //Add the data to index


        } catch (UnknownHostException e) {
            e.printStackTrace();
            throw new Exception("Something wrong with elasticSearch");
        }


        return value; //return processed value
    }

}
