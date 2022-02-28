import pandas as pd
from kloppy import metrica


def init_sequence_data(db):
    dataset = metrica.load_tracking_csv(
        home_data="https://raw.githubusercontent.com/metrica-sports/sample-data/master/data/Sample_Game_1/Sample_Game_1_RawTrackingData_Home_Team.csv",
        away_data="https://raw.githubusercontent.com/metrica-sports/sample-data/master/data/Sample_Game_1/Sample_Game_1_RawTrackingData_Away_Team.csv",
    )

    dataset.to_pandas().to_sql("tracking_data", db, if_exists="replace")
