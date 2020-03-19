from json2xml import json2xml
from json2xml.utils import readfromjson, readfromstring
import lxml.etree as ET
import pandas as pd


def json_2_xml(data):
    data = readfromstring(data)
    response = json2xml.Json2xml(data).to_xml()
    return ET.tostring(ET.fromstring(response))


def json_2_csv(data):
    df = pd.DataFrame(data)
    return df.to_csv()
