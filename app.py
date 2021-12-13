from flask import Flask, render_template, request
import os
import json
import pandas as pd
from pandas.core.dtypes import dtypes
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import r2_score
import numpy as np

app = Flask(__name__)
app.secret_key = ''
app.config['SESSION_TYPE'] = 'filesystem'
path = os.path.dirname(os.path.realpath(__file__))

@app.route("/")
def index():
    name = "sales"
    score_col = "lof"
    random_seed = 34231

    with open(f'{path}/static/data/{name}_predicate_masks.json', 'r') as f:
        predicate_feature_masks = json.load(f)
    with open(f'{path}/static/data/{name}_predicates.json', 'r') as f:
        predicates = json.load(f)
    with open(f'{path}/static/data/{name}_nodes_links.json', 'r') as f:
        nodes_links = json.load(f)
    with open(f'{path}/static/data/{name}_dtypes.json', 'r') as f:
        dtypes = json.load(f)
    predicate_masks = {k: [bool(val) for val in pd.DataFrame(v).all(axis=1)] for k,v in predicate_feature_masks.items()}

    print(predicate_masks.keys())
    
    # with open(f'{path}/static/data/predicate_masks.json', 'r') as f:
    #     predicate_masks = json.load(f)
    # with open(f'{path}/static/data/predicates.json', 'r') as f:
    #     predicates = json.load(f)
    # with open(f'{path}/static/data/predicate_nodes.json', 'r') as f:
    #     predicate_nodes = json.load(f)
    # with open(f'{path}/static/data/grouped_predicate_nodes.json', 'r') as f:
    #     grouped_predicate_nodes = json.load(f)
    # with open(f'{path}/static/data/dtypes.json', 'r') as f:
    #     dtypes = json.load(f)
    # with open(f'{path}/static/data/feature_values.json', 'r') as f:
    #     feature_values = json.load(f)
    # with open(f'{path}/static/data/predicate_stats.json', 'r') as f:
    #     predicate_stats = json.load(f)

    data = pd.read_csv(f'{path}/static/data/{name}_{random_seed}_data.csv')#.head(50)
    features = list(data.columns)
    feature_values = {}
    for feature in features:
        if dtypes[feature] in ['numeric', 'ordinal']:
            feature_values[feature] = [data[feature].min(), data[feature].max()]
        elif dtypes[feature] == 'date':
            feature_values[feature] = [str(data[feature].min()).split(' ')[0], str(data[feature].max()).split(' ')[0]]
        else:
            feature_values[feature] = list(sorted(data[feature].unique()))
    data_dict = data.to_dict('records')

    return render_template("pixalate.html", predicate_masks=json.dumps(predicate_masks), predicates=predicates, nodes_links=nodes_links, data=json.dumps(data_dict),
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

def get_recommendations(data, encoded_data, dtypes, predicate, x_feature, agg):
    # res = []
    # mask = predicate[[col for col in predicate.columns if col != x_feature]].all(axis=1)
    # for y_feature in data.columns:
    #     if y_feature in dtypes and dtypes[y_feature] == 'numeric':
    #         print(y_feature)
    #         score = get_model_score(data.loc[mask], encoded_data.loc[mask], dtypes, x_feature, y_feature)
    #         direction = ['high', 'low'][
    #             data.loc[mask].groupby(predicate.loc[mask].all(axis=1))[y_feature].agg(agg).idxmax()]
    #         res.append({'feature': y_feature, 'score': score, 'direction': direction})
    # res = pd.DataFrame(res)
    # res = res.sort_values('score', ascending=False)

    # res = pd.DataFrame([
    #     {'feature': 'sales', 'direction': 'low', 'score': 1},
    #     {'feature': 'profit', 'direction': 'low', 'score': 1}
    # ])

    res = pd.DataFrame([
        {'feature': 'sales', 'direction': 'low', 'score': 1},
        {'feature': 'profit', 'direction': 'low', 'score': 1}
    ])
    return res

@app.route("/get_recommendations", methods=['POST'])
def app_get_recommendations():
    data = pd.read_csv(f'{path}/static/data/superstore_data_43214123.csv')
    encoded_data = pd.read_csv(f'{path}/static/data/superstore_encoded_data_43214123.csv')
    with open(f'{path}/static/data/dtypes.json', 'r') as f:
        dtypes = json.load(f)
    with open(f'{path}/static/data/predicate_masks.json', 'r') as f:
        predicate_masks = json.load(f)

    request_data = request.get_json(force=True)
    predicate_id = request_data['predicate_id']
    predicate_mask = pd.DataFrame(predicate_masks[predicate_id])
    print(predicate_mask.all(axis=1).mean())
    print(encoded_data.shape)
    print(data.shape)
    feature = request_data['feature']
    agg = request_data['agg']

    res = get_recommendations(data, encoded_data, dtypes, predicate_mask, feature, agg)
    print(res)
    res = res[res.score > .01]
    return json.dumps({"recommendations": res.to_dict("records")})

if __name__ == "__main__":
    app.run(debug=True)