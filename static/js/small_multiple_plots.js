class SmallMultiplePlots{
    constructor(container_id, original_plot, feature_values, classname){
        this.container_id = container_id
        this.original_plot = original_plot
        this.feature_values = feature_values
        this.classname = classname
        this.plot = null
    }

    create_container(container_id){
        var container = document.createElement("div")
        container.id = container_id
        container.className = "row small-multiple " + this.classname

        var plot_container = document.createElement("div")
        plot_container.id = container_id + "-plot"
        plot_container.className = "small-multiple-plot"
        var text_container = document.createElement("div")
        text_container.id = container_id + '-text'
        text_container.className = "small-multiple-text"

        container.appendChild(text_container)
        container.appendChild(plot_container)
        return container
    }

    get_feature_value_text(feature, values, dtype, val_only){
        if (dtype == "nominal"){
            var a = " is "
            var b = values.join(", ")
            b = b.replace(/,([^,]*)$/, " or" + '$1')
        } else if (dtype == 'binary'){
            var a = " is "
            var b = values[0]
        } else if (dtype == 'numeric') {
            var a = " is between "
            var b = values[0].toFixed(2) + " and " + values[1].toFixed(2)
        } else {
            var a = " is between " 
            var b = values[0] + " and " + values[1]
        }

        if (val_only){
            return b
        } else {
            return feature + a + b
        }
    }

    get_filter_text(filters){
        var filters_text_list = []
        for (var feature in filters){
            var t = this.get_feature_value_text(feature, filters[feature], dtypes[feature])
            filters_text_list.push(t)
        }
        if (filters_text_list.length > 0){
            var text = " when " + (filters_text_list.join(" and "))
        } else {
            var text = ""
        }
        return text
    }

    get_x_filter_text(filters, x, x_values, dtypes){
        var in_text = document.createElement("span")
        in_text.className = "in-text"
        var in_t = this.get_feature_value_text(x, x_values, dtypes[x])
        in_text.innerHTML = " when " + in_t

        var out_text = document.createElement("span")
        out_text.className = "out-text"

        if (['date', 'numeric'].includes(dtypes[x])){
            var left_t = this.get_feature_value_text(x, [this.feature_values[x][0], x_values[0]], dtypes[x], false)
            var right_t = this.get_feature_value_text(x, [x_values[1], this.feature_values[x][1]], dtypes[x], true)
            var out_t = left_t + " or " + right_t
        } else if (dtypes[x] == "nominal"){
            var out_values = []
            for (var i=0; i<this.feature_values[x].length; i++){
                if (!x_values.includes(this.feature_values[x][i])){
                    out_values.push(this.feature_values[x][i])
                }
            }
            var out_t = this.get_feature_value_text(x, out_values, dtypes[x])
        } else if (dtypes[x] == 'binary'){
            var out_t = this.get_feature_value_text(x, x_values, dtypes[x])
        }

        if (this.feature_values[x].length - x_values.length > 5){
            out_text.innerHTML = " other " + x + 's'
        } else {
            out_text.innerHTML = " when " + out_t
        }

        var filters_text = document.createElement("span")
        filters_text.id = this.container_id + "-filters-text"
        filters_text.className = "filters-text"
        filters_text.innerHTML = this.get_filter_text(filters)
        return {'in_text': in_text, 'out_text': out_text, 'filters': filters_text}
    }

    get_plot_text(direction){
        var in_mean = direction['in_mean']
        var out_mean = direction['out_mean']
        var d = direction['direction']
        var text_container = document.createElement("div")

        var y_text = document.createElement("span")
        var agg_to_text = {"mean": "Average", "sum": "total"}
        var agg_text = agg_to_text[this.original_plot.agg]

        y_text.innerHTML = agg_text + " " + this.original_plot.y + " is " + d
        y_text.id = this.container_id + "-y-text"
        y_text.className = "y-text"
        text_container.appendChild(y_text)
        var y_in_mean_text = document.createElement("span")
        y_in_mean_text.innerHTML = " (" + in_mean.toFixed(2) + ") "
        y_in_mean_text.className = "in-mean-text"
        text_container.appendChild(y_in_mean_text)

        var x_filter_text = this.get_x_filter_text(this.original_plot.filter, this.original_plot.x, this.original_plot.x_values, this.original_plot.dtypes)
        text_container.appendChild(x_filter_text['in_text'])

        if (x_filter_text['out_text'] == null){
            var out_text = 'compared to other ' + this.original_plot.x
            text_container.appendChild(out_text)
        } else {
            var compared_to_text = document.createElement("span")
            compared_to_text.innerHTML = " compared to"
            text_container.appendChild(compared_to_text)
            text_container.appendChild(x_filter_text['out_text'])
        }

        var y_out_mean_text = document.createElement("span")
        y_out_mean_text.innerHTML = " (" + out_mean.toFixed(2) + ") "
        y_out_mean_text.className = "out-mean-text"
        text_container.appendChild(y_out_mean_text)

        text_container.appendChild(x_filter_text['filters'])
        return text_container
    }

    create_plot(container_id){
        var plot = this.original_plot.copy(container_id)
        // plot.plot("container", "container")
        return plot
    }

    create_plot_and_text(direction){
        var container_id = this.container_id + "-content"
        var container = this.create_container(container_id)
        $("#" + this.container_id).append(container)

        this.plot = this.create_plot(container_id + "-plot")
        var text = this.get_plot_text(direction)
        $("#" + container_id + "-text").append(text)
    }

    add_plot_filter(feature, value){
        this.plot.add_filter(feature, value)
    }

    add_text_filter(feature, value){
        var filters = {}
        for (var f in this.plot.filter){
            filters[f] = this.plot.filter[f]
        }
        filters[feature] = [value]
        var text = this.get_filter_text(filters)
        document.getElementById(this.container_id + "-filters-text-").innerHTML = text
    }

    change_plot_y(y){
        this.plot = this.plot.update_plot(null, null, y, null, null, null, null)
        this.plot.plot("container", "container")
    }

    change_text_y(y, direction){
        var agg_to_text = {"mean": "Average", "sum": "total"}
        var agg_text = agg_to_text[this.plot.agg]
        document.getElementById(this.container_id + "-y-text").innerHTML = agg_text + " " + y + " is " + direction
    }
}