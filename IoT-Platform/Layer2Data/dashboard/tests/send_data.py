
import time
from kafka import KafkaProducer
KAFKA_SERVERS = ["141.40.254.2:19092","141.40.254.2:29092","141.40.254.2:39092"]
producer = KafkaProducer(api_version=(0,10),bootstrap_servers=KAFKA_SERVERS)

with open("data.json") as file:
	data=file.read()
while True:
	producer.send('sensor-input', data)
	print "sent!"
	time.sleep(2)
producer.close()
