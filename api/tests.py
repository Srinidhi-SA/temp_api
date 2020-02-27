from __future__ import print_function

from django.contrib.auth.models import User
from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIRequestFactory, APIClient

from api.views import StockDatasetView

'''
class APILoginTest(TestCase):
    def testLogin(self):
        # factory = APIRequestFactory()
        # request = factory.post('/api-token-auth/', {'username': 'marlabs', "password" : ""}, format='json')
        from rest_framework.test import APIClient

        client = APIClient()
        response = client.post('/api-token-auth/', {'username': 'marlabs', "password" : ""}, format='json')

        print(response.data)

        pass

class APIDatasetsTest(TestCase):
    def testDatasetListing(self):
        self.assertIs(1+2,3, "addition failed")
'''


class StockSenseTest(TestCase):
    """Unit test cases for StockSense"""

    def setUp(self):
        # print("IN STOCKSENSE unit test EDITED 11111111-------")

        data = {
            "config": {
                "url1": "",
                "url2": "",
                "name": "TWTR",
                "stock_symbols": [
                    {
                        "id": 1,
                        "name": "name1",
                        "value": "TWTR"
                    }
                ]
            }
        }

        self.data = data

        self.credentials = {
            'username': 'dladmin',
            'password': 'thinkbig',
            'email': 'test@mail.com'}
        User.objects.create_superuser(**self.credentials)

        self.client = APIClient()
        url = reverse('api-token-auth')
        res = self.client.post(url, {'username': self.credentials['username'],
                                     'password': self.credentials['password']}, format='json')
        self.token = res.json()['token']
        self.client.credentials(HTTP_AUTHORIZATION=self.token)

    # def test_create_user(self):
    #     print("IN STOCKSENSE unit test create user")
    #     self.credentials = {
    #         'username': 'user1',
    #         'password': 'password',
    #         'email': 'user1@mail.com'}
    #     user = User.objects.create_user(**self.credentials)
    #
    #     self.assertEqual(user.email, self.credentials['email'])

    def test_create_stocksense(self):
        """Test case to ensure create Stock-sense API is working properly"""
        # url = reverse('')
        print("Inside ------- test_create_stocksense")

        url = "/api/stockdataset/"
        res = self.client.post(url, self.data, format='json')
        self.assertEqual(status.HTTP_200_OK, res.status_code)
        # print("--------- response name "+res.json()['name']+" data.config.name "+self.data['config']['name'])
        # print("SLUG  "+res.json()['slug'])
        self.assertEqual(res.json()['name'], self.data['config']['name'])

    def test_retrieve_stocksense(self):
        """yughjgj """
        print("Inside -------  test_retrieve_stocksense ")
        create_stock_response = self.client.post("/api/stockdataset/", self.data, format='json')
        slug = create_stock_response.json()['slug']
        url = "/api/stockdataset/"+slug+"/" #.join(slug).join('/')
        # print(url+" test_retrieve_stocksense 8888888888  ")
        retrieve_stock_response = self.client.get(url, format='json')
        self.assertEqual(status.HTTP_200_OK, retrieve_stock_response.status_code)
        self.assertEqual(retrieve_stock_response.json()['slug'], slug)

    def test_retrieve_non_existing_stocksense(self):
        """Test case to check non existing Stock-sense is returning nothing"""
        print("Inside -------  test_retrieve_non_existing_stocksense")
        create_stock_response = self.client.post("/api/stockdataset/", self.data, format='json')
        slug = create_stock_response.json()['slug']
        url = "/api/stockdataset/unknown-slug/"
        # print(url+" test_retrieve_non_existing_stocksense 8888888888  ")
        retrieve_stock_response = self.client.get(url, format='json')
        # self.assertEqual(status.HTTP_200_OK, retrieve_stock_response.status_code)
        self.assertEqual(retrieve_stock_response.json()['status'], False)

    def test_historical_data_from_alphavantage_api_is_working(self):
        """Check alphavantage API call is responding for the provided API_Key"""
        print("Inside ------- test_historical_data_from_alphavantage_api_is_working")
        apikey = "NZ4C53A0LJJU6MKM"
        function = "TIME_SERIES_DAILY"
        symbol = 'TWTR'
        url = "https://www.alphavantage.co/query?function={0}&symbol={1}&apikey={2}".format(
            function,
            symbol,
            apikey
        )
        retrieve_stock_response = self.client.get(url, format='json')
        print("In alphavantage API test --- Response "+str(retrieve_stock_response))
        print("In alphavantage API test --- Response code "+str(retrieve_stock_response.status_code))
        self.assertEqual(status.HTTP_200_OK, retrieve_stock_response.status_code)

    def test_stock_news_from_newsapi_is_working(self):
        """Check news API call is responding for the provided API_Key"""
        print("Inside ------- test_stock_news_from_newsapi_is_working")
        from newsapi import NewsApiClient
        API_KEY = "61b9fb7eac124c678dc2d6d8a0a9e9af"
        newsapi = NewsApiClient(api_key=API_KEY)

        # /v2/everything
        top_headlines = newsapi.get_everything(q=str("twtr"),
                                               language='en',
                                               page_size=100,
                                               domains='fool.com,bloomberg.com,nasdaq.com',
                                               sort_by='publishedAt',
                                               )
        print("In NEWS API test --- Response code "+top_headlines['status'])
        self.assertEqual(top_headlines['status'], 'ok')

    # def test_IBM_cloud_api_is_working(self):
    #     print("Inside ------- test_IBM_cloud_api_is_working")
    #     from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
    #     from ibm_watson import NaturalLanguageUnderstandingV1
    #     from ibm_watson import ApiException
    #     apikey = 'sK2KMSxYIyeQiYJpb9ugbMI5cjZRW6e2MSYLrWTtoIN1'
    #
    #     url = 'https://api.eu-gb.natural-language-understanding.watson.cloud.ibm.com/instances/9945cca0-ece4-45c8-903e-efbf3fcc61ff'
    #
    #     authenticator = IAMAuthenticator(apikey)
    #     natural_language_understanding = NaturalLanguageUnderstandingV1(version='2019-07-12',
    #                                                                     authenticator=authenticator)
    #     status = 200
    #     try:
    #         natural_language_understanding.set_service_url(url)
    #         print("------ Successful call")
    #     except ApiException as ex:
    #         print("Method failed with status code " + str(ex.code) + ": " + ex.message)
    #         status = ex.code
    #         self.assertEqual(status, 200)



