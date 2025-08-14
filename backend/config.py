import os

class Config:
    ES_ENDPOINT = os.getenv('elasticsearchendpoint', 'https://a25cbf64ca0d465a9d3eb5d9479121b6.eastus2.azure.elastic-cloud.com:443')
    ES_API_KEY = os.getenv('elasticapikey', '')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    CACHE_DURATION = 3600  # 1 hour
