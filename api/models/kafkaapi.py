import json

from kafka import KafkaProducer
from server import settings

class Kafkadata:

    @classmethod
    def kafka_producer(cls,data):

        kafka_host = settings.KAFKA['host']
        kafka_port = settings.KAFKA['port']
        kafka_topic = settings.KAFKA['topic']

        status = None
        producer = KafkaProducer(bootstrap_servers=kafka_host+':'+kafka_port,
                                 value_serializer=lambda v: json.dumps(v).encode('utf-8'))
        try:
            producer.send(kafka_topic, json.loads(data))
            producer.flush()
            status = "Success: Kafka sent the message successfully!!"
        except Exception as e:
            status = "Error: Kafka failed to send the message"

        return status
