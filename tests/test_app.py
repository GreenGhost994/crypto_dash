import unittest
from app import app

class TestApp(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def test_get_data_valid_input(self):
        response = self.app.post('/get_data', json={'crypto': 'BTC-USD'})
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue('close_value' in data)
        self.assertTrue('open_value' in data)

    def test_get_data_invalid_input(self):
        response = self.app.post('/get_data', json={'crypto': 'INVALID_CRYPTO'})
        self.assertEqual(response.status_code, 200)
        error_message = response.get_json().get('error')
        self.assertEqual(error_message, "No data found")

if __name__ == '__main__':
    unittest.main()