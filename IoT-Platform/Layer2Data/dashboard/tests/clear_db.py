import json,requests

ELASTIC=("141.40.254.142","ELASTICSEARCH")
board_id_to_delete="123e4567-e89b-12d3-a456-426655442222"
#board_id_to_delete="0001-0002-0003-0004"
delete_size="400"
url="http://"+ELASTIC[0]+":9200/myclient2/sensor/_search?q="+board_id_to_delete+"&size="+delete_size
res=requests.get(url)

res=res.json()


count=0
  #delete the new data
for el in res["hits"]["hits"]:
    idx=el["_id"]
    #print idx
    count+=1
    r=requests.delete("http://"+ELASTIC[0]+":9200/myclient2/sensor/"+idx)
    print count
print count