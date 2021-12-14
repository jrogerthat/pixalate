class Text {

    constructor(container_id, graph_data, predicates, dtypes){
        this.container_id = container_id
        this.graph_data = graph_data
        this.predicates = predicates
        this.dtypes = dtypes

        this.predicates_text = this.predicates_to_text(this.predicates, this.dtypes)
        this.make_predicate_cards(this.predicates_text, this.graph_data.nodes)
    }

    predicates_to_text(predicates, dtypes){
        var predicates_text = {}
        for (var i in predicates){
            predicates_text[i] = this.predicate_to_text(predicates[i], dtypes)
        }
        return predicates_text
    }

    predicate_to_text(predicate, dtypes){
        var predicate_text = {}
        for (var feature in predicate){
            predicate_text[feature] = this.clause_to_text(predicate[feature], dtypes[feature])
        }
        return predicate_text
    }

    clause_to_text(values, dtype){
        if (dtype == 'numeric'){
            var values_text = [values[0].toFixed(2), values[1].toFixed(2)].join(" to ")
        } else if (['ordinal', 'date'].includes(dtype)){
            var values_text = [values[0], values[1]].join(" to ")
        } else if (dtype == 'nominal'){
            var values_text = values.join(", ")
        } else if (dtype == 'binary'){
            var values_text = values[0]
        }
        return values_text
    }

    make_predicate_card(predicate_text, id){
        var predicate_div = document.createElement("div")
        predicate_div.className = "predicate predicate-text"
        predicate_div.id = "predicate-text-" + id
        for (var feature in predicate_text){
            var feature_span = document.createElement("span")
            feature_span.className = "predicate-feature"
            feature_span.id = "predicate-feature-" + id
            feature_span.innerHTML = feature + ": " + predicate_text[feature]
            predicate_div.appendChild(feature_span)
        }
        return predicate_div
    }

    make_predicate_cards(predicates_text, nodes){
        nodes.sort(function(x, y){ return d3.ascending(x.group, y.group); })
        var prev_group = 0
        for (var i=0; i<nodes.length; i++){
            var predicate_card = this.make_predicate_card(predicates_text[nodes[i].id], nodes[i].id)
            if (nodes[i].group != prev_group){
                prev_group = nodes[i].group
                var br = document.createElement("br")
                $("#" + this.container_id).append(br)
            }
            $("#" + this.container_id).append(predicate_card)
        }
    }

    select_predicate(predicate_id){
        $(".predicate-text").removeClass("selected-predicate-text")
        if (predicate_id != null){
            $("#predicate-text-" + predicate_id).addClass("selected-predicate-text")
        }
    }

    scroll_to(predicate_id){
        $("#" + this.container_id).animate({
            scrollTop: $("#predicate-text-" + predicate_id).offset().top
        }, 2000)
    }
}