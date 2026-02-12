#Miguel Antonio D. Chavez https://github.com/madchavez
import logging
#import context
import paho.mqtt.client as mqtt
import json
import mysql.connector



class MyMQTTClass(mqtt.Client):

	parsed_payload = None

	def on_connect(self, mqttc, obj, flags, rc):
		print("rc: "+str(rc))

	def on_connect_fail(self, mqttc, obj):
		print("Connect failed")

	def on_message(self, mqttc, obj, msg):
		print(msg.topic+" "+str(msg.qos)+" "+str(msg.payload))
		parsed_payload = json.loads(msg.payload)
		print(parsed_payload)
		mydb = mysql.connector.connect(
			host="localhost",
			user="ojtAdmin",
			password="801800",
			database="esd"
		)
		
		mycursor = mydb.cursor()
		print(mydb)
		print(parsed_payload)


		#Compose a string of quoted column names
		cols = ','.join([f'`{k}`' for k in parsed_payload.keys()])

		# Compose a string of placeholders for values
		vals = ','.join(['%s'] * len(parsed_payload))

		# Create the SQL statement
		stmt = f'INSERT INTO esd_log (logNo,{cols}) VALUES (NULL,{vals})'

		# Execute the statement, delegating the quoting of values to the connector
		mycursor.execute(stmt, tuple(parsed_payload.values()))
		mydb.commit()

		mydb.close()



	def on_publish(self, mqttc, obj, mid):
		print("mid: "+str(mid))

	def on_subscribe(self, mqttc, obj, mid, granted_qos):
		print("Subscribed: "+str(mid)+" "+str(granted_qos))

	#def on_log(self, mqttc, obj, level, string):
	#print(string)

	def run(self):
		self.connect("iot.ionics-ems.com", 1883, 60)
		self.subscribe("esd/#", 0)

		rc = 0
		while rc == 0:
			rc = self.loop()
	
		return rc


# If you want to use a specific client id, use
# mqttc = MyMQTTClass("client-id")
# but note that the client id must be unique on the broker. Leaving the client
# id parameter empty will generate a random id for you.
mqttc = MyMQTTClass()
rc = mqttc.run()

print("rc: "+str(rc))
# mqttc.connect("127.0.0.1", 1883, 60)
# mqttc.subscribe("Test/#", 0)

# mqttc.loop_forever()

# mqttc = mqtt.Client()

