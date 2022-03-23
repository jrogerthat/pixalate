class Control {
    constructor(container_id, features, dtypes, feature_values, score_col){
        this.container_id = container_id
        this.features = features
        this.dtypes = dtypes
        this.feature_values = feature_values
        this.score_col = score_col

        this.make_dropdowns()
        this.from_plot = false
        this.filter = {}
    }

    get_dropdown(label, options){
        var container = document.createElement("div")
        container.className = "row dropdown-container"

        var dropdown_label = document.createElement("div")
        dropdown_label.id = "dropdown-label-" + label
        dropdown_label.className = "col-5 dropdown-label"
        dropdown_label.innerHTML = label
        container.appendChild(dropdown_label)

        var dropdown = document.createElement("select")
        dropdown.name = label
        dropdown.id = label
        dropdown.className = "col-7 dropdown-value"
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
        this.num_x_options = x_options.length
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

        var color_container = document.createElement("div")
        color_container.id = "color-container"
        var color_header = document.createElement("div")
        color_header.className = "header"
        color_header.innerHTML = "Color"
        color_container.appendChild(color_header)
        $("#" + this.container_id).append(color_container)

        var filters_container = document.createElement("div")
        filters_container.id = "filters-container"
        var filters_header = document.createElement("div")
        filters_header.className = "header"
        // filters_header.innerHTML = "Filters"
        filters_header.id = "filters-header"
        var add_filter_dropdown = "<select id=add-filter-dropdown class='selectpicker' title='Filters' multiple data-width='50%'>"
        for (var i=0; i<this.features.length; i++){
            add_filter_dropdown += "<option>" + this.features[i] + "</option>"
        }
        add_filter_dropdown += "</select>"
        filters_container.appendChild(filters_header)
        $("#" + this.container_id).append(filters_container)
        $("#filters-header").append(add_filter_dropdown)
        $("#add-filter-dropdown").selectpicker()
        $("button[title='Filters']").removeClass("btn-light")
        $("button[title='Filters']").html('<div><div><div style="color: black; font-weight: bold;">Filters</div></div></div>')
        $("button[title='Filters']").css('padding', "0px")
        // $("button[title='Filters']").change(function(){
        //     console.log('add filter')
        // })

    }

    days_to_date(days, min_date){
        var value = new Date(min_date)
        value.setDate(value.getDate() + days)
        var value = new Date(value).toISOString().split('T')[0]
        return value
    }

    make_slider(container_id, feature, min, max, values, step, dtype, min_date){
        var min_input = document.createElement("input")
        min_input.type = "text"
        min_input.className = feature + "-slider slider col-6"
        min_input.setAttribute('data-index', 0);
        if (dtype == 'date'){
            min_input.value = this.days_to_date(values[0], min_date)
        } else {
            min_input.value = values[0]
        }

        var max_input = document.createElement("input")
        max_input.type = "text"
        max_input.className = feature + "-slider slider col-6"
        max_input.setAttribute('data-index', 1);
        if (dtype == 'date'){
            max_input.value = this.days_to_date(values[1], min_date)
        } else {
            max_input.value = values[1]
        }

        var slider_container = document.createElement("div")
        slider_container.id = container_id + "-slider"

        var slider_container_bar = document.createElement("div")
        var slider_container_bar_id = container_id + "-slider-bar"
        slider_container_bar.id = slider_container_bar_id
        slider_container.append(slider_container_bar)

        var slider_container_input = document.createElement("div")
        slider_container_input.className = "row slider-input"
        slider_container_input.id = container_id + "-slider-input"
        slider_container.append(slider_container_input)
        slider_container_input.append(min_input)
        slider_container_input.append(max_input)

        $("#" + container_id).append(slider_container)
        $("#" + slider_container_bar_id).slider({
            range: true,
            min: min,
            max: max,
            step: step,
            values: values,
            slide: function(event, ui) {
                for (var i = 0; i < ui.values.length; ++i) {
                    if (dtype == 'date'){
                        var value = new Date(min_date)
                        value.setDate(value.getDate() + ui.values[i])
                        var value = new Date(value).toISOString().split('T')[0]
                    } else {
                        var value = ui.values[i]
                    }
                    $("input." + feature + "-slider[data-index=" + i + "]").val(value);
                }
            }
        });
    }

    make_multi_dropdown(container_id, feature, values, selected_values, data_width){
        var dropdown = document.createElement("select")
        dropdown.setAttribute('data-live-search', "true");
        dropdown.setAttribute('data-width', data_width + "%");
        var multiple = document.createAttribute("multiple")
        dropdown.setAttributeNode(multiple)
        dropdown.id = "filter-" + feature
        dropdown.className = "filter-values-dropdown"
        for (var i=0; i<values.length; i++){
            var option = document.createElement("option")
            option.innerHTML = values[i]
            option.value = values[i]
            if (selected_values.includes(values[i])){
                option.selected = true
            }
            dropdown.appendChild(option)
        }
        $("#" + container_id).append(dropdown)
        $("#filter-" + feature).selectpicker()
    }

    get_filter_content(container_id, feature, values, dtype, data_width){
        if (dtype == 'numeric'){
            this.make_slider(container_id, feature, this.feature_values[feature][0], this.feature_values[feature][1], values, .1, dtype, null)
        } else if (dtype == 'date'){
            var all_values = this.feature_values[feature]
            var milli_to_days = 1000*60*60*24
            var min_date = Date.parse(all_values[0])
            var max_date = Date.parse(all_values[1])
            var days = (max_date - min_date) / milli_to_days

            var min_selected_date = Date.parse(values[0])
            var max_selected_date = Date.parse(values[1])
            var min_selected_days = (min_selected_date - min_date) / milli_to_days
            var max_selected_days = (max_selected_date - min_date) / milli_to_days
            this.make_slider(container_id, feature, 0, days, [min_selected_days, max_selected_days], 1, dtype, min_date)
        } else if (dtype == 'nominal'){
            this.make_multi_dropdown(container_id, feature, this.feature_values[feature], values, data_width)
        }
    }

    get_remove_button(feature){
        var remove_button = document.createElement("button")
        remove_button.id = "remove-filter-button-" + feature
        remove_button.className = "btn remove-filter-button col-4"
        var remove_icon = document.createElement("i")
        remove_icon.className = "fas fa-times"
        remove_button.appendChild(remove_icon)
        return remove_button
    }

    make_filter(parent, feature, values, dtype, add_remove, data_width){
        var container = document.createElement("div")
        container.className = "filter-container"
        var container_id = "filter-container-" + feature
        container.id = container_id

        var label_container = document.createElement("div")
        label_container.className = "row"
        var label = document.createElement("div")
        label.className = "filter-label col-8"
        label.innerHTML = feature
        label_container.append(label)

        if (add_remove){
            var remove_button = this.get_remove_button(feature)
            label_container.append(remove_button)
        }
        container.append(label_container)

        $("#" + parent).append(container)
        this.get_filter_content(container_id, feature, values, dtype, data_width)
    }

    clear_filter_features(){
        $("#add-filter-dropdown").val([])
    }

    add_filter_feature(feature){
        var val = $("#add-filter-dropdown").val()
        val.push(feature)
        $("#add-filter-dropdown").val(val)
    }

    make_filters(filter){
        this.clear_filter_features()
        for (var feature in filter){
            this.make_filter('filters-container', feature, filter[feature], this.dtypes[feature], true, "100")
            this.add_filter_feature(feature)
        }
    }

    make_color_filter(feature, values, plot){
        this.make_filter('color-container', feature, values, this.dtypes[feature], false, '100')
    }

    get_filter_container(feature){
        var container = document.createElement("div")
        container.className = "filter-container"
        container.id = "filter-container-" + feature
        return container
    }

    get_filter_nominal(feature, values, data_width){
        var all_values = this.feature_values[feature]
        var filter_values = document.createElement("select")
        filter_values.setAttribute('data-live-search', "true");
        filter_values.setAttribute('data-width', data_width + "%");
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
        var label = document.createElement('div')
        label.innerHTML = feature
        container.appendChild(label)
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

    // make_slider(feature, min, max, values, step){
    //     var filter_values = this.get_filter_values(feature)
    //     var container = this.get_filter_container(feature)
    //     var label = document.createElement('div')
    //     label.innerHTML = feature
    //     container.appendChild(label)
    //     container.appendChild(filter_values)
    //     var remove_button = this.get_remove_button(feature)
    //     container.appendChild(remove_button)
    //     $("#" + this.container_id).append(container)
    //     $("#filter-values-" + feature).slider({
    //         range: true,
    //         min: min,
    //         max: max,
    //         step: step,
    //         values: values
    //     });
    // }

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

        this.clear_filters()
        this.update_plot = true
    }

    set_controls(plot){
        this.from_plot = true
        var x = plot.x
        var x_values = plot.x_values
        var y = plot.y
        var agg = plot.agg
        var color = plot.color
        var filter = plot.filter
        var mark = plot.mark

        $("#x").val(x);
        $("#y").val(y);
        // $("#color").val(color);
        $("#mark").val(mark);

        $(".filter-container").remove()
        this.make_filters(filter)
        this.make_color_filter(x, x_values, plot)
        this.from_plot = false
    }

    // set_controls(plot){
    //     this.from_plot = true
    //     var x = plot.x
    //     var x_values = plot.x_values
    //     var y = plot.y
    //     var agg = plot.agg
    //     var color = plot.color
    //     var filter = plot.filter
    //     var mark = plot.mark

    //     if(color == x + '_values'){
    //         if (document.getElementById("color").length > this.num_x_options + 2){
    //             $("select[name=color] option:last").remove();
    //         }
    //         if (this.dtypes[x] == 'numeric'){
    //             var x_values_text = x + ' between ' + [x_values[0].toFixed(2), x_values[1].toFixed(2)]
    //         } else if (this.dtypes[x] == 'nominal') {
    //             var x_values_text = x + ' in ' + x_values
    //         } else if (['ordinal', 'date'].includes(this.dtypes[x])){
    //             var x_values_text = x + ' between ' + [x_values[0], x_values[1]]
    //         } else if (this.dtypes[x] == 'binary'){
    //             var x_values_text = x + ' = ' + x_values[0]
    //         }
    //     }
    //     $('#color').append($('<option>', {
    //         value: color,
    //         text: x_values_text
    //     }));

    //     $("#x").val(x);
    //     $("#y").val(y);
    //     $("#color").val(color);
    //     $("#mark").val(mark);

    //     $(".filter-container").remove()
    //     this.make_filters(filter)
    //     this.from_plot = false
    // }

}