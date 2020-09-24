from __future__ import print_function

from django.contrib.auth.models import User
from django.test import TestCase

# Create your tests here.
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIRequestFactory, APIClient

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
        data = {
            "config": {
                "domains": [
                    "cnbc.com",
                    "ft.com",
                    "wsj.com",
                    "marketwatch.com",
                    "in.reuters.com",
                    "investopedia.com",
                    "nytimes.com",
                    "economictimes.indiatimes.com",
                    "finance.yahoo.com",
                    "forbes.com",
                    "financialexpress.com",
                    "bloomberg.com",
                    "wsj.com",
                    "nasdaq.com",
                    "fool.com"
                ],
                "stock_symbols": [
                    {
                        "name": "J.P. Morgan Chase & Co.",
                        "ticker": "JPM"
                    }
                ],
                "analysis_name": "ms8"
            }
        }

        self.data = data

        self.credentials = {
            'username': 'user1',
            'password': 'user123',
            'email': 'user@gmail.com'}
        User.objects.create_superuser(**self.credentials)

        self.client = APIClient()
        # url = reverse('api-token-auth')
        res = self.client.post('http://localhost:8001/api-token-auth/', {'username': self.credentials['username'],
                                     'password': self.credentials['password']}, format='json')
        self.token = res.json()['token']
        self.client.credentials(HTTP_AUTHORIZATION=self.token)

    def test_create_stocksense(self):
        """Test case to ensure create Stock-sense API is working properly"""
        print("Inside ------- test_create_stocksense")

        url = "/api/stockdataset/"
        res = self.client.post(url, self.data, format='json')
        self.assertEqual(status.HTTP_200_OK, res.status_code)
        self.assertEqual(res.json()['name'], self.data['config']['analysis_name'])

    def test_retrieve_stocksense(self):
        """Test case to check read exiting stock-sense """
        create_stock_response = self.client.post("/api/stockdataset/", self.data, format='json')
        slug = create_stock_response.json()['slug']
        url = "/api/stockdataset/" + slug + "/"  # .join(slug).join('/')
        retrieve_stock_response = self.client.get(url, format='json')
        self.assertEqual(status.HTTP_200_OK, retrieve_stock_response.status_code)
        self.assertEqual(retrieve_stock_response.json()['slug'], slug)

    def test_retrieve_non_existing_stocksense(self):
        """Test case to check non existing Stock-sense is returning nothing"""
        create_stock_response = self.client.post("/api/stockdataset/", self.data, format='json')
        slug = create_stock_response.json()['slug']
        url = "/api/stockdataset/unknown-slug/"
        retrieve_stock_response = self.client.get(url, format='json')
        self.assertEqual(retrieve_stock_response.json()['status'], False)

    def test_historical_data_from_alphavantage_api_is_working(self):
        """Check alphavantage API call is responding for the provided API_Key"""
        from api.StockAdvisor.crawling.process import fetch_historical_data_from_alphavintage
        data = fetch_historical_data_from_alphavintage("JPM")
        self.assertGreater(len(data), 0)

    def test_stock_news_from_newsapi_is_working(self):
        """Check news API call is responding for the provided API_Key"""
        from newsapi import NewsApiClient
        API_KEY = settings.STOCK_SENSE_CREDS['newsapi']['api_key']
        newsapi = NewsApiClient(api_key=API_KEY)

        top_headlines = newsapi.get_everything(q=str("twtr"),
                                               language='en',
                                               page_size=100,
                                               domains='fool.com,bloomberg.com,nasdaq.com',
                                               sort_by='publishedAt',
                                               )
        self.assertEqual(top_headlines['status'], 'ok')


class TestAlgorithmSettings(TestCase):
    """
    class for unit test cases concerning Algorithm settings.
    """

    def setUp(self):
        # Every test needs access to the request factory.
        """
        Setup User and Authentication
        UserType: Superuser
        """

        self.credentials = {
            'username': 'dladmin',
            'password': 'thinkbig',
            'email': 'test@mail.com'}
        User.objects.create_superuser(**self.credentials)

        self.client = APIClient()
        response = self.client.post('http://localhost:8000/api-token-auth/',
                                    {'username': self.credentials['username'],
                                     "password": self.credentials['password']}, format='json')
        self.token = response.json()['token']
        self.client.credentials(HTTP_AUTHORIZATION=self.token)



    def test_classification_automl(self):
        """
        Unit test cases concerning Algorithm settings for classification autoML.
        """

        response = self.client.get('http://localhost:8000/api/get_app_algorithm_config_list/',
                                   {'app_type': 'CLASSIFICATION', 'mode': 'autoML'},
                                   format='json')

        self.assertEqual(response.json(), settings.AUTOML_ALGORITHM_LIST_CLASSIFICATION)
        self.assertEqual(status.HTTP_200_OK, response.status_code)



    def test_classification_analyst(self):
        """
        Unit test cases concerning Algorithm settings for classification analyst.
        """

        response = self.client.get('http://localhost:8000/api/get_app_algorithm_config_list/',
                                   {'app_type': 'CLASSIFICATION', 'mode': 'ananlyst'},
                                   format='json')

        algorithm_lists = []
        for case in response.json()['ALGORITHM_SETTING']:
            algorithm_lists.append(case['algorithmName'])

        # self.assertEqual(algorithm_lists,
        #                  ['Logistic Regression', 'Random Forest', 'XGBoost', 'naive bayes',
        #                   'Neural Network (TensorFlow)', 'Neural Network (PyTorch)'])
        self.assertEqual(algorithm_lists,
                         ['Logistic Regression', 'Random Forest', 'XGBoost', 'naive bayes', 'Neural Network (Sklearn)',
                          'Neural Network (TensorFlow)', 'Neural Network (PyTorch)'])
        self.assertEqual(status.HTTP_200_OK, response.status_code)



