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

@app.route("/")
def index():
    name = "superstore"
    score_col = "iforest_score"
    random_seed = 34231

    with open(f'{path}/static/data/{name}_predicate_masks.json', 'r') as f:
        predicate_feature_masks = json.load(f)
    with open(f'{path}/static/data/{name}_predicates.json', 'r') as f:
        predicates = json.load(f)
    with open(f'{path}/static/data/{name}_nodes_links.json', 'r') as f:
        nodes_links = json.load(f)
    with open(f'{path}/static/data/{name}_dtypes.json', 'r') as f:
        dtypes = json.load(f)

    predicate_masks = {k: list(pd.DataFrame({ki: list(vi.values()) for ki, vi in v.items()}).all(axis=1).values) for k,v in predicate_feature_masks.items()}
    predicate_masks = {k: [bool(vi) for vi in v] for k, v in predicate_masks.items()}
    data = pd.read_csv(f'{path}/static/data/{name}_data.csv')#.head(50)
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

    # return render_template("pixalate.html", predicate_masks=json.dumps(predicate_masks), predicates=predicates, predicate_nodes=predicate_nodes, grouped_predicate_nodes=grouped_predicate_nodes, data=json.dumps(data_dict),
    #                         dtypes=dtypes, features=features, feature_values=feature_values, predicate_stats=predicate_stats)

def get_model_score(data, encoded_data, dtypes, x_feature, y_feature):
    if dtypes[x_feature] == 'nominal':
        X = encoded_data[[col for col in encoded_data.columns if f'{x_feature}_' in col]]
    elif dtypes[x_feature] == 'numeric':
        X = data[[x_feature]]
    elif dtypes[x_feature] == 'date':
        X = encoded_data[[x_feature]]
    y = data[[y_feature]]
    
    if dtypes[x_feature] == 'nominal':
        lr = LinearRegression(fit_intercept=False)
    else:
        lr = LinearRegression()

    lr.fit(X, y)
    predy = lr.predict(X)
    score = r2_score(y, predy)
    return score

def get_recommendations(predicate_id, feature):
    # all_res = {
    #     ('0', 'product'): pd.DataFrame([
    #         {'feature': 'profit', 'score': 1}
    #     ]),
    #     ('1', 'state'): pd.DataFrame([
    #         {'feature': 'units', 'score': 1},
    #          {'feature': 'sales', 'score': 1},
    #           {'feature': 'profit', 'score': 1}
    #     ])
    # }
    # res = all_res[(predicate_id, feature)]
    res = pd.DataFrame([
            {'feature': 'units', 'score': 1},
            {'feature': 'unit_price', 'score': 1},
            {'feature': 'unit_cost', 'score': 1},
            {'feature': 'sales', 'score': 1},
            {'feature': 'profit', 'score': 1}
        ]) 
    return res

def get_recommendations_(x, x_values, filters):
    name = "superstore"
    score_col = "iforest_score"
    random_seed = 34231

    with open(f'{path}/static/data/{name}_dtypes.json', 'r') as f:
        dtypes = json.load(f)
    data = pd.read_csv(f'{path}/static/data/{name}_data.csv')

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
    return res

@app.route("/get_recommendations", methods=['POST'])
def app_get_recommendations():
    request_data = request.get_json(force=True)
    x = request_data['x']
    x_values = request_data['x_values']
    filters = request_data['filters']

    res = get_recommendations_(x, x_values, filters)
    return {'recommendations': res}
    # data = pd.read_csv(f'{path}/static/data/superstore_data_43214123.csv')
    # encoded_data = pd.read_csv(f'{path}/static/data/superstore_encoded_data_43214123.csv')
    # with open(f'{path}/static/data/dtypes.json', 'r') as f:
    #     dtypes = json.load(f)
    # with open(f'{path}/static/data/predicate_masks.json', 'r') as f:
    #     predicate_masks = json.load(f)

    request_data = request.get_json(force=True)
    predicate_id = request_data['predicate_id']
    # predicate_mask = pd.DataFrame(predicate_masks[predicate_id])
    # print(predicate_mask.all(axis=1).mean())
    # print(encoded_data.shape)
    # print(data.shape)
    feature = request_data['feature']
    # agg = request_data['agg']

    res = get_recommendations(predicate_id, feature)#data, encoded_data, dtypes, predicate_mask, feature, agg)
    print(res)
    res = res[res.score > .01]
    return json.dumps({"recommendations": res.to_dict("records")})

if __name__ == "__main__":
    app.run(debug=True)