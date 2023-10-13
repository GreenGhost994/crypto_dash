from flask import Flask, render_template, jsonify, request
from yfinance import Ticker

app = Flask(__name__, template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_data', methods=['POST'])
def get_data():
    """
    Get data from yfinance about selected crypto
    """
    crypto = request.get_json()['crypto']
    try:
        df = Ticker(crypto).history(period='1y')
        if df.empty:
            return jsonify({'error': 'No data found'})
        return jsonify({'close_value': df.iloc[-1].Close, 'open_value': df.iloc[-1].Open})
    except Exception as e:
        return jsonify({'error': 'Error fetching data: ' + str(e)})

if __name__ == '__main__':
    app.run(debug=True)
