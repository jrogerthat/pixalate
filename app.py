from flask import Flask, render_template, request
import os
import json
import pandas as pd
from pandas.core.dtypes import dtypes
import numpy as np
from predicate_induction_main import Predicate

app = Flask(__name__)
app.secret_key = ''
app.config['SESSION_TYPE'] = 'filesystem'
path = os.path.dirname(os.path.realpath(__file__))

name = 'augmented_superstore_all'
# name = 'sensor'
score_col = 'iforest_score'

@app.route("/")
def index():
    with open(f'{path}/static/data/{name}_predicate_masks.json', 'r') as f:
        predicate_feature_masks = json.load(f)
    with open(f'{path}/static/data/{name}_predicates.json', 'r') as f:
        predicates = json.load(f)
    with open(f'{path}/static/data/{name}_nodes_links.json', 'r') as f:
        nodes_links = json.load(f)
    with open(f'{path}/static/data/{"_".join(name.split("_")[:2])}_dtypes.json', 'r') as f:
        dtypes = json.load(f)

    predicate_masks = {k: list(pd.DataFrame({ki: list(vi.values()) for ki, vi in v.items()}).all(axis=1).values) for k,v in predicate_feature_masks.items()}
    predicate_masks = {k: [bool(vi) for vi in v] for k, v in predicate_masks.items()}
    data = pd.read_csv(f'{path}/static/data/{"_".join(name.split("_")[:2])}_data.csv')
    features = list(data.columns)
    print(data.head())
    feature_values = {}
    for feature in features:
        if dtypes[feature] in ['numeric', 'ordinal']:
            feature_values[feature] = [data[feature].min(), data[feature].max()]
        elif dtypes[feature] == 'date':
            feature_values[feature] = [str(data[feature].min()).split(' ')[0], str(data[feature].max()).split(' ')[0]]
        else:
            feature_values[feature] = list(sorted(data[feature].unique()))
    data_dict = data.to_dict('records')

    return render_template("pixalate.html", predicate_masks=json.dumps(predicate_masks), predicate_feature_masks=json.dumps(predicate_feature_masks),  predicates=predicates,
                            nodes_links=nodes_links, data=json.dumps(data_dict),
                            dtypes=dtypes, features=features, feature_values=feature_values, score_col=score_col)

def get_recommendations_(x, x_values, filters):
    with open(f'{path}/static/data/{"_".join(name.split("_")[:2])}_dtypes.json', 'r') as f:
        dtypes = json.load(f)
    data = pd.read_csv(f'{path}/static/data/{"_".join(name.split("_")[:2])}_data.csv')

    p1 = Predicate(filters, dtypes)
    p2 = Predicate({x: x_values}, dtypes)
    p1.fit(data)
    if len(filters) == 0:
        p1.mask = pd.Series(np.ones(len(data))).astype(bool)
    p2.fit(data)
    in_d = data.loc[p1.mask & p2.mask]
    out_d = data.loc[p1.mask & ~p2.mask]
    res = {feature: [in_d[feature].mean(), out_d[feature].mean()] for feature, dtype in dtypes.items() if dtype in ['numeric', 'ordinal'] and feature != score_col}
    res = [{'feature': k, 'in_mean': v[0], 'out_mean': v[1], 'direction': ['low', 'high'][v[0] > v[1]]} for k,v in res.items()]
    res = sorted(res, key=lambda x: x['feature'])
    return res

def get_direction(x, x_values, y, filters):
    with open(f'{path}/static/data/{"_".join(name.split("_")[:2])}_dtypes.json', 'r') as f:
        dtypes = json.load(f)
    data = pd.read_csv(f'{path}/static/data/{"_".join(name.split("_")[:2])}_data.csv')

    p1 = Predicate(filters, dtypes)
    p2 = Predicate({x: x_values}, dtypes)
    p1.fit(data)
    if len(filters) == 0:
        p1.mask = pd.Series(np.ones(len(data))).astype(bool)
    p2.fit(data)
    in_d = data.loc[p1.mask & p2.mask]
    out_d = data.loc[p1.mask & ~p2.mask]
    in_mean = in_d[y].mean()
    out_mean = out_d[y].mean()
    return {'feature': y, 'in_mean': in_mean, 'out_mean': out_mean, 'direction': ['low', 'high'][in_mean > out_mean]}

@app.route("/get_direction", methods=['POST'])
def app_get_direction():
    request_data = request.get_json(force=True)
    x = request_data['x']
    x_values = request_data['x_values']
    y = request_data['y']
    filters = request_data['filters']
    res = get_direction(x, x_values, y, filters)
    return res

@app.route("/get_recommendations", methods=['POST'])
def app_get_recommendations():
    request_data = request.get_json(force=True)
    x = request_data['x']
    x_values = request_data['x_values']
    filters = request_data['filters']

    res = get_recommendations_(x, x_values, filters)
    return {'recommendations': res}

if __name__ == "__main__":
    app.run(debug=True)