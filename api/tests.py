from __future__ import print_function
from django.test import TestCase

# Create your tests here.
from rest_framework.test import APIRequestFactory

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
