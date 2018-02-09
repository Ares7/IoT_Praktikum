import telegram.ext
from kafka import KafkaConsumer
import json, threading

#credentials
CHAT_ID="" 
TOKEN=""

def kafka_consumer():
    KAFKA="141.40.254.2"
    consumer = KafkaConsumer('streams-sensor-output',bootstrap_servers=KAFKA+":29092")
    
    for msg in consumer:
        line=""
        data=json.loads(msg.value)
        for sensor in data["devices"]["sensors"]:
            for values in sensor["values"]:
                name,unit,value=values["name"],values["unit"],values["value"]

                response="%s: %s %s"%(name,value,unit)
                line+=response+"\n" 
        if FLOW:
            b.sendMessage(chat_id=CHAT_ID,text=response)
            print(line)



updater = telegram.ext.Updater(token=TOKEN)

print("Started")
b=updater.bot
response="Listening to Kafka now..."
b.sendMessage(chat_id=CHAT_ID,text=response)

t=threading.Thread(target=kafka_consumer)
t.start()
#updater.start_polling()

