class FeaturePlots extends VegaLitePlot{

    constructor(container_id, predicate, predicate_text, data, dtypes, score_col){
        super()
        this.container_id = container_id
        this.predicate = predicate
        this.predicate_text = predicate_text
        this.data = data
        this.dtypes = dtypes
        this.score_col = score_col
        this.plots = {}
    }

    make_feature_container(feature, i){
        var container = document.createElement("div")
        container.className = "feature-plot-container"
        var header = document.createElement("div")
        header.className = "feature-plot-header"
        container.appendChild(header)
        var plot_container = document.createElement("div")
        var plot_container_id = "feature-plot-" + i
        plot_container.id = plot_container_id
        plot_container.className = "feature-plot"
        container.appendChild(plot_container)

        var feature_text = document.createElement("span")
        feature_text.className = "feature-text"
        feature_text.innerHTML = feature + ": " + this.predicate_text[feature]
        header.appendChild(feature_text)

        var pivot_button = document.createElement("input")
        pivot_button.type = "radio"
        pivot_button.className = "pivot-button"
        pivot_button.name = "pivot-feature"
        pivot_button.value = feature
        header.appendChild(pivot_button)
        return {'container': container, 'plot_container_id': plot_container_id}
    }

    plot_feature(feature, plot_container_id, width, height){
        var filter = {}
        for (var f in this.predicate){
            if (f != feature){
                filter[f] = this.predicate[f]
            }
        }

        var plot = new Plot(feature, this.predicate[feature], this.score_col, "mean", feature + "_values", filter, 'bar', this.data, this.dtypes, plot_container_id)
        plot.plot(width, height)
        return plot
    }

    plot(width, height){
        $("#" + this.container_id).empty()
        var i=0
        for (var feature in this.predicate){
            var container_plot_container_id = this.make_feature_container(feature, i)
            $("#" + this.container_id).append(container_plot_container_id['container'])
            var plot = this.plot_feature(feature, container_plot_container_id['plot_container_id'], width, height)
            this.plots[feature] = plot
            i++
        }
    }
}