import os

from flask import Flask, send_from_directory

app = Flask(__name__)


@app.route("/")
def index():
    return send_from_directory("./", "index.html")


@app.route("/styles.css")
def styles():
    return send_from_directory("./", "styles.css")


@app.route("/app.js")
def js():
    return send_from_directory("./", "app.js")


@app.route("/actors.json")
def about():
    return send_from_directory("./", "actors.json")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
