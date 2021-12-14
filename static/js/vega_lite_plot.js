class VegaLitePlot {

    get_spec(x, y, agg, color, filter, mark){
        var transform = []
        var x_dtype = this.dtypes[x]
        if (x_dtype == 'numeric'){
            var encode_x = {'field': x, type:"quantitative"}
            if (mark == 'bar'){
                encode_x['bin'] = true
            }
        } else if (['nominal', 'ordinal', 'binary'].includes(x_dtype)){
            var encode_x = {'field': x, type: 'nominal'}
        } else if (x_dtype == 'date') {
            var encode_x = {"field": x,  "timeUnit": {"unit": "yearmonthdate", "step": 7}, 'type': 'temporal'}
            // var encode_x = {"field": x, "timeUnit": {"unit": "day", "step": 1}, 'type': 'temporal'}
        }

        if (y == null){
            var encode_y = {"aggregate": "count", "field": "*", "type": "quantitative"}
        } else {
            var encode_y = {"field": y, "type": "quantitative"}
            if (mark == 'bar'){
                encode_y['aggregate'] = agg
                encode_y['stack'] = 'false'
            }
        }

        if (color == null){
            var encode_color = null
        } else {
            var color_array = color.split('_')
            var color_is_value = color_array[color_array.length-1] == 'values'
            var encode_color = {"field": color}
            if (color_is_value){
                encode_color['scale'] = {
                    "domain": [true, false],
                    "range": ["#1f77b4", "#949494"]
                }
            }
        }

        if (filter != null) {
            for (var feature in filter){
                if (this.dtypes[feature] == 'numeric'){
                    transform.push({'filter': {'field': feature, 'range': filter[feature]}})
                } else if (['nominal', 'ordinal'].includes(this.dtypes[feature])){
                    transform.push({'filter': {'field': feature, 'oneOf': filter[feature]}})
                } else if (this.dtypes[feature] == 'binary'){
                    transform.push({'filter': {'field': feature, 'equal': filter[feature][0]}})
                } else if (this.dtypes[feature] == 'date'){
                    transform.push({'filter': {'timeUnit': 'yearmonthdate', 'field': feature, 'range': filter[feature], type: 'temporal'}})
                    // transform.push({'filter': {'field': feature, 'range': [this.parse_time(filter[feature][0]), this.parse_time(filter[feature][1])]}})
                    // var date_array_left = filter[feature][0].split('-')
                    // var date_array_right = filter[feature][1].split('-')
                    // var range = [{'year': parseInt(date_array_left[0]), 'month': parseInt(date_array_left[1]), 'day': parseInt(date_array_left[2])}, 
                    //              {'year': parseInt(date_array_right[0]), 'month': parseInt(date_array_right[1]), 'day': parseInt(date_array_right[2])}]
                    // transform.push({'filter': {"timeUnit": "year", 'field': feature, 'range': range}})
                }
            }
        }

        var spec = {
            "config": {
                "legend": {"disable": true},
                "axisX": {"labelAngle": 45}
            },
            "mark": mark,
            'transform': transform,
            "encoding": {
                "x": encode_x,
                "y": encode_y,
                "color": encode_color
            }
        }
        return spec
    }

    plot_spec(data, dtypes, x, x_values, spec, plot_container_id, width, height){
        if (x_values != null && dtypes[x] == 'date'){
            x_values = [this.parse_time(x_values[0]), this.parse_time(x_values[1])]
        }
        if (x_values != null){
            for (var i=0; i<data.length; i++){
                if (['nominal', 'binary', 'ordinal'].includes(dtypes[x])){
                    data[i][x + '_values'] = x_values.includes(data[i][x])
                } else if (dtypes[x] == 'numeric'){
                    data[i][x + '_values'] = data[i][x] >= x_values[0] && data[i][x] <= x_values[1]
                } else if (dtypes[x] == 'date'){
                    var val = this.parse_time(data[i][x])
                    data[i][x + '_values'] = val >= x_values[0] && val <= x_values[1]
                }
            }
        }

        var formatted_spec = {}
        formatted_spec['config'] = spec['config']
        if (width == null){
            formatted_spec['width'] = 'container'
        } else {
            formatted_spec['width'] = width
        }
        if (height == null){
            formatted_spec['height'] = 'container'
        } else {
            formatted_spec['height'] = height
        }

        // if (dtypes != null){
        //     var formatted_data = []
        //     for (var i=0; i<data.length; i++){
        //         var row = {}
        //         for (var col in data[i]){
        //             if (dtypes[col] == 'date'){
        //                 row[col] = this.parse_time(data[i][col])
        //             } else {
        //                 row[col] = data[i][col]
        //             }
        //         }
        //         formatted_data.push(row)
        //     }
        //     formatted_spec['data'] = {'values': formatted_data}
        // } else {
        //     formatted_spec['data'] = {'values': data}
        // }
        formatted_spec['data'] = {'values': data}
        for (var k in spec){
            if (!Object.keys(formatted_spec).includes(k)){
                formatted_spec[k] = spec[k]
            }
        }
        vegaEmbed('#' + plot_container_id, formatted_spec, {'resize': true, "actions": true})
    }
}

class Plot extends VegaLitePlot {
    constructor(x, x_values, y, agg, color, filter, mark, data, dtypes, plot_container_id){
        super()
        this.x = x
        this.x_values = x_values
        this.y = y
        this.agg = agg
        this.color = color
        this.filter = filter
        this.mark = mark
        this.data = data
        this.dtypes = dtypes
        this.plot_container_id = plot_container_id

        this.width = null
        this.height = null
        this.parse_time = d3.timeParse("%Y-%m-%d")
    }

    plot(width, height){
        this.width = width
        this.height = height
        $("#" + this.plot_container_id).empty()

        var spec = this.get_spec(this.x, this.y, this.agg, this.color, this.filter, this.mark)
        this.plot_spec(this.data, this.dtypes, this.x, this.x_values, spec, this.plot_container_id, width, height)
    }

    update_plot(x, y, agg, color, filter, mark){
        var plot = this.copy(this.plot_container_id)
        if (x != null){
            plot.x = x
        }
        if (y != null){
            plot.y = y
        }
        if (agg != null){
            plot.agg = agg
        }
        if (color != null){
            plot.color = color
        }
        if (filter != null){
            plot.filter = filter
        }
        if (mark != null){
            plot.mark = mark
        }
        return plot
    }

    remove_filter(feature){
        var plot = this.copy(this.plot_container_id)
        var filter = {}
        for (var f in this.filter){
            if (f != feature){
                filter[f] = this.filter[f]
            }
        }
        plot.filter = filter
        return plot
    }

    add_filter(feature, value){
        this.filter[feature] = [value]
        this.plot(this.width, this.height)
    }

    copy(plot_container_id){
        var filter = {}
        for (var feature in this.filter){
            filter[feature] = this.filter[feature]
        }
        if (this.x_values == null){
            var x_values = null
        } else {
            var x_values = []
            for (var i=0; i<this.x_values.length; i++){
                x_values.push(this.x_values[i])
            }
        }
        return new Plot(this.x, x_values, this.y, this.agg, this.color, filter, this.mark, this.data, this.dtypes, plot_container_id, this)
    }

    equals(plot){
        if (JSON.stringify(Object.keys(plot.filter)) != JSON.stringify(Object.keys(this.filter))){
            var filter_is_equal = false
        } else {
            var filter_is_equal = true
            for (var feature in this.filter){
                if (plot.filter[feature] != this.filter[feature]){
                    filter_is_equal = false
                }
            }
        }
        var is_equal = (this.x == plot.x) && (this.x_values = plot.x_values) && (this.y = plot.y) && (this.agg == plot.agg) && (this.color == plot.color) && (this.mark == plot.mark)
        return filter_is_equal && is_equal
    }
}