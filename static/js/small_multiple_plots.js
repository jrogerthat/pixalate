class SmallMultiplePlots{
    constructor(container_id, original_plot){
        this.container_id = container_id
        this.original_plot = original_plot
        this.plot = null
    }

    create_container(container_id){
        var container = document.createElement("div")
        container.id = container_id
        container.className = "row small-multiple"

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

    get_feature_value_text(feature, values, dtype){
        if (dtype == "nominal"){
            var a = " is " + values.join(" or ")
        } else if (dtype == 'binary'){
            var a = " is " + values[0]
        } else if (dtype == 'numeric') {
            var a = " between " + values[0].toFixed(2) + " and " + values[1].toFixed(2)
        } else {
            var a = " between " + values[0] + " and " + values[1]
        }
        var text = feature + a
        return text
    }

    get_filter_text(filters){
        var filters_text_list = []
        for (var feature in filters){
            var t = this.get_feature_value_text(feature, filters[feature], dtypes[feature])
            filters_text_list.push(t)
        }
        if (filters_text_list.length > 0){
            var text = " if " + (filters_text_list.join(" and "))
        } else {
            var text = ""
        }
        return text
    }

    get_x_filter_text(filters, x, x_values, dtypes){
        var x_text = document.createElement("span")
        x_text.className = "x-text"
        var t = this.get_feature_value_text(x, x_values, dtypes[x])
        x_text.innerHTML = " when " + t

        var filters_text = document.createElement("span")
        filters_text.id = this.container_id + "-filters-text"
        filters_text.className = "filters-text"
        filters_text.innerHTML = this.get_filter_text(filters)
        return {'x': x_text, 'filters': filters_text}
    }

    get_plot_text(direction){
        var text_container = document.createElement("div")
        var y_text = document.createElement("span")
        var agg_to_text = {"mean": "Average", "sum": "total"}
        var agg_text = agg_to_text[this.original_plot.agg]
        y_text.innerHTML = agg_text + " " + this.original_plot.y + " is " + direction
        y_text.id = this.container_id + "-y-text"
        y_text.className = "y-text"
        text_container.appendChild(y_text)

        var x_filter_text = this.get_x_filter_text(this.original_plot.filter, this.original_plot.x, this.original_plot.x_values, this.original_plot.dtypes)

        text_container.appendChild(x_filter_text['x'])
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
        this.plot.update_plot(null, y, null, null, null, null)
    }

    change_text_y(y, direction){
        var agg_to_text = {"mean": "Average", "sum": "total"}
        var agg_text = agg_to_text[this.plot.agg]
        document.getElementById(this.container_id + "-y-text").innerHTML = agg_text + " " + y + " is " + direction
    }
}