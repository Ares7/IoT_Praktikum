#!/usr/bin/env python
# -*- coding: utf-8 -*-


KAFKA=("141.40.254.141","KAFKA")
ELASTIC=("141.40.254.44","ELASTICSEARCH")

import os,threading,time
from kafka import KafkaConsumer,KafkaProducer
import json,requests

check_mark="+"
cross_mark="-"


def run_kafka_consumer(threadName):
  consumer = KafkaConsumer('streams-sensor-output',bootstrap_servers=KAFKA[0]+":9092")
  msg=next(consumer)
  for msg in consumer:
    print (msg)

def ping_vm(vm):
  response = os.system("ping -c 1 " + vm[0]+ "> /dev/null 2>&1")
  if response == 0:
     print check_mark+" "+ vm[1] +" is up!"
     return True
  else:
     print cross_mark+" "+vm[1]+" down"
     return False

def check_kafka():
  t=threading.Thread(target=run_kafka_consumer,args=("consumer",))
  t.start()
  producer = KafkaProducer(api_version=(0,10),bootstrap_servers=KAFKA[0]+":9092")
  time.sleep(0.5)
  producer.send('sensor-input', data)
  producer.close()

def check_elastic():
  url="http://"+ELASTIC[0]+":9200/myclient2/sensor/_search?q=0001-0002-0003-0004"
  res=requests.get(url)

  res=res.json()


  elastic_data=res["hits"]["hits"][0]["_source"]
  if elastic_data==json.loads(data):
    print check_mark+" ELASTICSEARCH works!"
  #delete the new data
    for el in res["hits"]["hits"]:
      idx=el["_id"]
      r=requests.delete("http://"+ELASTIC[0]+":9200/myclient2/sensor/"+idx)



def main():

  is_kafka_up=ping_vm(KAFKA)
  is_elastic_up=ping_vm(ELASTIC)

  if is_kafka_up:
    check_kafka()
    time.sleep(1)
    if is_elastic_up:
      check_elastic()




if __name__=="__main__":
  data=open("data.json").read()
  main()

"""
url="http://"+ELASTIC[0]+":9200/myclient2/sensor/_search?q=0001-0002-0003-0004"
res=requests.get(url)

res=res.json()
elastic_data=res["hits"]["hits"][0]["_source"]
for el in res["hits"]["hits"]:
      idx=el["_id"]
      print idx
      delete_url="http://"+ELASTIC[0]+":9200/myclient2/sensor/"+idx
      print delete_url
      r=requests.delete(delete_url)
"""