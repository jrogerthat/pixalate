class Control {
    constructor(container_id, features, dtypes, feature_values, score_col){
        this.container_id = container_id
        this.features = features
        this.dtypes = dtypes
        this.feature_values = feature_values
        this.score_col = score_col

        this.make_dropdowns()
        this.from_plot = false
    }

    get_dropdown(label, options){
        var container = document.createElement("div")
        container.className = "row dropdown-container"

        var dropdown_label = document.createElement("div")
        dropdown_label.className = "col-5 dropdown-label"
        dropdown_label.innerHTML = label
        container.appendChild(dropdown_label)

        var dropdown = document.createElement("select")
        dropdown.name = label
        dropdown.id = label
        dropdown.className = "col-7 dropdown"
        container.appendChild(dropdown)

        var default_option = document.createElement("option")
        default_option.value = ""
        dropdown.appendChild(default_option)
        for (var i=0; i<options.length; i++){
            var option = document.createElement("option")
            option.value = options[i]
            option.innerHTML = options[i]
            dropdown.appendChild(option)
        }
        return container
    }

    make_dropdowns(){
        var encoding_header = document.createElement("div")
        encoding_header.className = "header"
        encoding_header.innerHTML = "Encoding"
        var x_options = []
        for (var i=0; i<this.features.length; i++){
            if (this.features[i] != this.score_col){
                x_options.push(this.features[i])
            }
        }
        var x_dropdown = this.get_dropdown('x', x_options)

        var y_options = []
        for (var i=0; i<this.features.length; i++){
            if (!['nominal', 'date'].includes(this.dtypes[this.features[i]])){
                y_options.push(this.features[i])
            }
        }
        var y_dropdown = this.get_dropdown('y', y_options)
        $("#" + this.container_id).append(encoding_header)
        $("#" + this.container_id).append(x_dropdown)
        $("#" + this.container_id).append(y_dropdown)

        var marks_header = document.createElement("div")
        marks_header.className = "header"
        marks_header.innerHTML = "Marks"
        var mark_dropdown = this.get_dropdown('mark', ['bar', 'point', 'line'])
        var size_dropdown = this.get_dropdown('size', this.features)
        var color_dropdown = this.get_dropdown('color', this.features)
        var shape_dropdown = this.get_dropdown('shape', this.features)
        $("#" + this.container_id).append(marks_header)
        $("#" + this.container_id).append(mark_dropdown)
        $("#" + this.container_id).append(size_dropdown)
        $("#" + this.container_id).append(color_dropdown)
        $("#" + this.container_id).append(shape_dropdown)

        var filters_header = document.createElement("div")
        filters_header.className = "header"
        filters_header.innerHTML = "Filters"
        $("#" + this.container_id).append(filters_header)
    }

    get_filter_container(feature){
        var container = document.createElement("div")
        container.className = "filter-container"
        container.id = "filter-container-" + feature
        return container
    }

    get_remove_button(feature){
        var remove_button = document.createElement("button")
        remove_button.id = "remove-filter-button-" + feature
        remove_button.className = "btn remove-filter-button"
        var remove_icon = document.createElement("i")
        remove_icon.className = "fas fa-times"
        remove_button.appendChild(remove_icon)
        return remove_button
    }

    get_filter_nominal(feature, values){
        var all_values = this.feature_values[feature]
        var filter_values = document.createElement("select")
        filter_values.setAttribute('data-live-search', "true");
        filter_values.setAttribute('data-width', "70%");
        var multiple = document.createAttribute("multiple")
        filter_values.setAttributeNode(multiple)
        filter_values.id = "filter-" + feature
        filter_values.className = "filter-values-dropdown"
        for (var i=0; i<all_values.length; i++){
            var option = document.createElement("option")
            option.innerHTML = all_values[i]
            option.value = all_values[i]
            if (values.includes(all_values[i])){
                option.selected = true
            }
            filter_values.appendChild(option)
        }

        var container = this.get_filter_container(feature)
        container.appendChild(filter_values)
        var remove_button = this.get_remove_button(feature)
        container.appendChild(remove_button)
        $("#" + this.container_id).append(container)
        $("#filter-" + feature).selectpicker()
    }

    get_filter_values(feature){
        var filter_values = document.createElement("div")
        var slider_id = "filter-values-" + feature
        filter_values.id = slider_id
        filter_values.className = "filter-values-slider"
        return filter_values
    }

    make_slider(feature, min, max, values, step){
        var filter_values = this.get_filter_values(feature)
        var container = this.get_filter_container(feature)
        container.appendChild(filter_values)
        var remove_button = this.get_remove_button(feature)
        container.appendChild(remove_button)
        $("#" + this.container_id).append(container)
        $("#filter-values-" + feature).slider({
            range: true,
            min: min,
            max: max,
            step: step,
            values: values
        });
    }

    get_filter_date(feature, values){
        var all_values = this.feature_values[feature]
        var milli_to_days = 1000*60*60*24
        var min_date = Date.parse(all_values[0])
        var max_date = Date.parse(all_values[1])
        var days = (max_date - min_date) / milli_to_days

        var min_selected_date = Date.parse(values[0])
        var max_selected_date = Date.parse(values[1])
        var min_selected_days = (min_selected_date - min_date) / milli_to_days
        var max_selected_days = (max_selected_date - min_date) / milli_to_days

        this.make_slider(feature, 0, days, [min_selected_days, max_selected_days], 1)
    }

    get_filter_numeric(feature, values){
        var all_values = this.feature_values[feature]
        this.make_slider(feature, all_values[0], all_values[1], values, .1)

        // $("#remove-filter-button-" + feature).click(function(){
        //     this.specified_plot.plot.remove_filter(feature)
        //     $("#filter-container-" + feature).remove()
        // }.bind(this))
    }

    add_filter(feature, values){
        console.log("control add filter")
        var dtype = this.dtypes[feature]
        if (['numeric', 'ordinal'].includes(dtype)){
            this.get_filter_numeric(feature, values)
        } else if (dtype == 'date'){
            this.get_filter_date(feature, values)
        } else {
            this.get_filter_nominal(feature, values)
        }
    }

    remove_filter(feature){
        $("#filter-container-" + feature).remove()
    }

    set_from_plot(plot){
        this.update_plot = false
        var x = plot.x
        var x_values = plot.x_values
        var y = plot.y
        var agg = plot.agg
        var color = plot.color
        var filter = plot.filter
        var mark = plot.mark

        if (color == 'x_values'){
            $("#color option[value='x_values']").remove();
            if (this.dtypes[x] == 'numeric'){
                var x_values_text = [x_values[0].toFixed(2), x_values[1].toFixed(2)]
            } else if (this.dtypes[x] == 'nominal') {
                var x_values_text = x_values
            } else if (['ordinal', 'date'].includes(this.dtypes[x])){
                var x_values_text = [x_values[0], x_values[1]]
            }
            color = "x_values"
            $('#color').append($('<option>', {
                value: color,
                text: x + ': ' + x_values_text
            }));   
        }
        $("#x").val(x);
        $("#y").val(y);
        $("#color").val(color);
        $("#mark").val(mark);
        this.update_plot = true
    }

    set_controls(specified_plot){
        this.from_plot = true
        var plot = specified_plot.plot
        var x = plot.x
        var x_values = plot.x_values
        var y = plot.y
        var agg = plot.agg
        var color = plot.color
        var filter = plot.filter
        var mark = plot.mark

        if (color == 'x_values'){
            $("#color option[value='x_values']").remove();
            if (this.dtypes[x] == 'numeric'){
                var x_values_text = [x_values[0].toFixed(2), x_values[1].toFixed(2)]
            } else {
                var x_values_text = x_values
            }
            color = "x_values"
            $('#color').append($('<option>', {
                value: color,
                text: x+ ' in [' + x_values_text + ']'
            }));   
        }

        $("#x").val(x);
        $("#y").val(y);
        $("#color").val(color);
        $("#mark").val(mark);

        $(".filter-values-dropdown").remove()
        for (var feature in filter){
            this.add_filter(feature, filter[feature])
        }
        $(".filter-values-dropdown").selectpicker();
        this.from_plot = false
    }
}