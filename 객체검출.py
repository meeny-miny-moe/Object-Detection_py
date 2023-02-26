#-*- coding:utf-8 -*-
import urllib3
import json
import base64
openApiURL = "http://aiopen.etri.re.kr:8000/ObjectDetect"
accessKey = "4154e7c7-e458-4031-b34b-4b871669a8ff"
imageFilePath = "/upload/image.png"
type = "png"
 
file = open(imageFilePath, "rb")
imageContents = base64.b64encode(file.read()).decode("utf8")
file.close()
 
requestJson = {
    "access_key": accessKey,
    "argument": {
        "type": type,
        "file": imageContents
    }
}

http = urllib3.PoolManager()
response = http.request(
    "POST",
    openApiURL,
    headers={"Content-Type": "application/json; charset=UTF-8"},
    body=json.dumps(requestJson)
)
 
print("[responseCode] " + str(response.status))
print("[responBody]")
#print(response.data)
#print("\n")


result=str(response.data,"utf-8")
#print(result)
d = json.loads(result)
count=len(d['return_object']['data'])
#print(count)
for i in range(2):
  print(d['return_object']['data'][i]['class'])   
               