"""Sample code to use the IBM Watson Speech to Text API.
See more at https://blog.rmotr.com.
"""
import json
import unittest

from watson_developer_cloud import SpeechToTextV1
import watson_developer_cloud.natural_language_understanding.features.v1 \
  as Features
from watson_developer_cloud.natural_language_understanding_v1 import NaturalLanguageUnderstandingV1

from settings import NATURAL_LANGUAGE_UNDERSTANDING_SETTINGS as nlu_settings
from settings import VOICE_TO_TEXT_SETTINGS


class SpeechAnalyzer:
    filepath = ""  # Audio file path
    converted_text = ""
    nl_understanding = None # will store the understanding
    nl_understanding_nodestructure = None
    
    def __init__(self, filepath):
        self.filepath = filepath
        
    
    def convert_speech_to_text(self):

        stt = SpeechToTextV1(username=VOICE_TO_TEXT_SETTINGS.get("username"), password=VOICE_TO_TEXT_SETTINGS.get("password"))
        audio_file = open(self.filepath, "rb")
        return_json = stt.recognize(audio_file, content_type="audio/wav", speaker_labels=True)
        
        
        if "results" in return_json.keys() and "alternatives" in return_json.get("results")[0].keys() and "transcript" in return_json.get("results")[0].get("alternatives")[0].keys():
            self.converted_text = return_json.get("results")[0].get("alternatives")[0].get("transcript")

        return self.converted_text
    
    def understand_text(self):
        natural_language_understanding = NaturalLanguageUnderstandingV1(
            username=nlu_settings.get("username"),
            password=nlu_settings.get("password"),
            version="2017-02-27")

        self.nl_understanding = natural_language_understanding.analyze(
        text=self.converted_text,
        features=[
          Features.Entities(
            emotion=True,
            sentiment=True,
            limit=100
          ),
          Features.Keywords(
            emotion=True,
            sentiment=True,
            limit=100
          ),
          Features.Categories(),
          Features.Concepts(),
          Features.Sentiment(),
          Features.Emotion(),
        #     Features.Feature(),
        #     Features.MetaData(),
          Features.Relations(),
          Features.SemanticRoles(),
                  
        ]
        )
        
        return self.nl_understanding

    
    def generate_node_structure(self):
        
        list_of_cards = []
        emotions_card = ""
        if "emotion" in self.nl_understanding:
            try:
                emotions_html = "".join([ self.__get_emotions_html(item.get(), item.get("") ) for item in self.nl_understanding.get("emotion").get("document").get("emotion").items()])
                emotions_card = self.__generate_normal_card("Emotions", emotions_html)
            except:
                pass
        sentiment_card = ""
        if "sentiment" in self.nl_understanding:
            try:
                sentiment = self.nl_understanding.get("sentiment").get("document")
                sentiment_html = '<div class="sentiment-{}">Sentiment score: {}</div>'.format(sentiment.get("label"), sentiment.get("score") )
                sentiment_card = self.__generate_normal_card("Sentiment",sentiment_html) 
            except:
                pass

        keywords_card = ""
        if "keywords" in self.nl_understanding:
            try:
                keywords = self.nl_understanding.get("keywords")
                keywods_html = " ".join( [ "<span>{}</span>".format(item.get("text")) for item in keywords])
                keywords_card = self.__generate_normal_card("Keywords",keywods_html)
            except:
                pass
            
            
        categories_card = ""
        if "categories" in self.nl_understanding:
            try:
                categories_html = "".join([ "<span>{}</span> <span>{}</span>".format(item.get("label").split("/")[-1], item.get("score")) for item in self.nl_understanding.get("categories")])
                categories_card = self.__generate_normal_card("Categories", categories_html)
            except:
                pass

        if emotions_card:
            list_of_cards.append(emotions_card)
        if keywords_card:
            list_of_cards.append(keywords_card)
        if sentiment_card:
            list_of_cards.append(sentiment_card)
        if categories_card:
            list_of_cards.append(categories_card)
        
        self.nl_understanding_nodestructure = {
                "name": "Overview card",
                "slug": "fdfdfd_overview",
                "listOfNodes" : [],
                "listOfCards" : list_of_cards
            }
        
        
        return self.nl_understanding_nodestructure
    
    def __get_emotions_html(self, emo, val):
        return '<div class="emotion-{}"><span class="emotion-title">{}</span><span class="emotion-percent">{}%</span></div>'.format(emo,emo,val*100)

    def __generate_normal_card(self, name, html):
        return {
                "cardType": "normal",
                "name": name,
                "slug": "",
                "cardData": [
                    {
                        "dataType": "html",
                        "data": "<h1>{}</h1>{}".format(name, html)   
                    }
                ]
            }
class SpeechAnalyzerTest:
    def testSpeechToText(self):
        sa = SpeechAnalyzer("test/mohanbi.wav")
        sa.convert_speech_to_text()
        print json.dumps(sa.converted_text)
        pass
    
    def understand_text(self):
        pass
    pass


if __name__ == "__main__":

    sa = SpeechAnalyzer("test/mohanbi.wav")
#     sa.convert_speech_to_text()
    sa.converted_text = "I am calling regarding my cellphone details regarding the AD and D. center and %HESITATION my bills that's not in proper order can you get back to me "
    print json.dumps(sa.converted_text)
#     sa.understand_text()
    
    sa.nl_understanding = json.loads("""{"semantic_roles": [{"action": {"text": "calling", "verb": {"text": "call", "tense": "present"}, "normalized": "call"}, "sentence": "I am calling regarding my cellphone details regarding the AD and D. center and %HESITATION my bills that's not in proper order can you get back to me", "object": {"text": "regarding my cellphone details regarding the AD and D. center"}, "subject": {"text": "I"}}, {"action": {"text": "get", "verb": {"text": "get", "tense": "future"}, "normalized": "get"}, "sentence": "I am calling regarding my cellphone details regarding the AD and D. center and %HESITATION my bills that's not in proper order can you get back to me", "object": {"text": "to me"}, "subject": {"text": "you"}}], "emotion": {"document": {"emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}}}, "sentiment": {"document": {"score": -0.602607, "label": "negative"}}, "language": "en", "entities": [], "relations": [{"score": 0.941288, "type": "agentOf", "arguments": [{"text": "I", "entities": [{"text": "you", "type": "Person"}]}, {"text": "calling", "entities": [{"text": "calling", "type": "EventCommunication"}]}], "sentence": "I am calling regarding my cellphone details regarding the AD and D. center and %HESITATION my bills that's not in proper order can you get back to me"}], "keywords": [{"relevance": 0.986328, "text": "cellphone details", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}, {"relevance": 0.833305, "text": "proper order", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}, {"relevance": 0.670873, "text": "D. center", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}, {"relevance": 0.552041, "text": "HESITATION", "sentiment": {"score": -0.602607}}, {"relevance": 0.396277, "text": "bills", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}, {"relevance": 0.34857, "text": "AD", "emotion": {"anger": 0.128218, "joy": 0.023388, "sadness": 0.039954, "fear": 0.030219, "disgust": 0.022114}, "sentiment": {"score": -0.602607}}], "concepts": [], "usage": {"text_characters": 150, "features": 8, "text_units": 1}, "categories": [{"score": 0.301348, "label": "/finance/personal finance/lending/credit cards"}, {"score": 0.17561, "label": "/business and industrial"}, {"score": 0.165519, "label": "/technology and computing"}]}
    """)
    
    print json.dumps(sa.nl_understanding)
    
    sa.generate_node_structure()
    print "=" * 100
    print(json.dumps(sa.nl_understanding_nodestructure))
    
    
    
        
    
    
    
    