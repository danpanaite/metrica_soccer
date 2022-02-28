import json
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import cross_origin
from . import db


def to_json(df):
    return jsonify(json.loads(df.to_json(orient="records")))


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(SECRET_KEY="dev", DATABASE="database.db")

    @app.route("/data")
    @cross_origin()
    def get_data():
        limit = 500
        start_index = int(request.args.get("start_index")) if request.args.get("start_index") else 0

        return to_json(
            pd.read_sql_query(
                f"SELECT * from tracking_data WHERE `index` >= {start_index} and `index` <= {start_index + limit}",
                db.get_db(),
            )
        )

    db.init_app(app)

    return app
