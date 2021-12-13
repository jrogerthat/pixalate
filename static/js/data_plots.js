class SpecifiedControl {
    constructor(control_container_id, features, dtypes, feature_values, score_col, specified_plot){
        this.control_container_id = control_container_id
        this.features = features
        this.dtypes = dtypes
        this.feature_values = feature_values
        this.score_col = score_col
        this.specified_plot = specified_plot

        this.from_plot = false
        this.make_control()
    }

    get_filter_nominal(feature, values){
        var all_values = this.feature_values[feature]
        var filter_values = document.createElement("select")
        filter_values.setAttribute('data-live-search', "true");

        filter_values.setAttribute('data-width', "70%");
        var multiple = document.createAttribute("multiple")
        filter_values.setAttributeNode(multiple)
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

        var container = document.createElement("div")
        container.className = "filter-container"
        container.id = "filter-container-" + feature
        container.appendChild(filter_values)

        var remove_button = document.createElement("button")
        remove_button.id = "remove-filter-button-" + feature
        remove_button.className = "btn remove-filter-button"
        var remove_icon = document.createElement("i")
        remove_icon.className = "fas fa-times"
        remove_button.appendChild(remove_icon)
        container.appendChild(remove_button)
        $("#" + this.control_container_id).append(container)

        $("#remove-filter-button-" + feature).click(function(){
            this.specified_plot.plot.remove_filter(feature)
            $("#filter-container-" + feature).remove()
        }.bind(this))
    }

    get_filter_date(feature, values){
        var all_values = this.feature_values[feature]
        var filter_values = document.createElement("div")
        slider_id = "filter-values-" + feature
        filter_values.id = filter_values
        filter_values.id = slider_id
        filter_values.className = "filter-values-slider"

        $("#" + this.control_container_id).append(filter_values)

        var milli_to_days = 1000*60*60*24
        var min_date = Date.parse(all_values[0])
        var max_date = Date.parse(all_values[1])
        var days = (max_date - min_date) / milli_to_days

        var min_selected_date = Date.parse(values[0])
        var max_selected_date = Date.parse(values[1])
        var min_selected_days = (min_selected_date - min_date) / milli_to_days
        var max_selected_days = (max_selected_date - min_date) / milli_to_days

        var container = document.createElement("div")
        container.className = "filter-container"
        container.id = "filter-container-" + feature
        container.appendChild(filter_values)

        var remove_button = document.createElement("button")
        remove_button.id = "remove-filter-button-" + feature
        remove_button.className = "btn remove-filter-button"
        var remove_icon = document.createElement("i")
        remove_icon.className = "fas fa-times"
        remove_button.appendChild(remove_icon)
        container.appendChild(remove_button)
        $("#" + this.control_container_id).append(container)

        $("#" + slider_id).slider({
            range: true,
            min: 0,
            max: days,
            step: 1,
            values: [min_selected_days, max_selected_days]
        });	
    }

    get_filter_numeric(feature, values){
        var all_values = this.feature_values[feature]
        var filter_values = document.createElement("div")
        var slider_id = "filter-values-" + feature
        filter_values.id = slider_id
        filter_values.className = "filter-values-slider"

        var container = document.createElement("div")
        container.className = "filter-container"
        container.id = "filter-container-" + feature
        container.appendChild(filter_values)

        var remove_button = document.createElement("button")
        remove_button.id = "remove-filter-button-" + feature
        remove_button.className = "btn remove-filter-button"
        var remove_icon = document.createElement("i")
        remove_icon.className = "fas fa-times"
        remove_button.appendChild(remove_icon)
        container.appendChild(remove_button)
        $("#" + this.control_container_id).append(container)

        $( "#" + slider_id).slider({
            range: true,
            min: all_values[0],
            max: all_values[1],
            values: [values[0], values[1]]
        });

        $("#remove-filter-button-" + feature).click(function(){
            this.specified_plot.plot.remove_filter(feature)
            $("#filter-container-" + feature).remove()
        }.bind(this))
    }

    add_filter(feature, values){
        console.log("control add filter")
        var dtype = this.dtypes[feature]
        if (dtype == 'numeric'){
            this.get_filter_numeric(feature, values)
        } else if (dtype == 'date'){
            this.get_filter_date(feature, values)
        } else {
            this.get_filter_nominal(feature, values)
        }
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

    make_control(){
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
            if (this.dtypes[this.features[i]] != 'nominal'){
                y_options.push(this.features[i])
            }
        }
        var y_dropdown = this.get_dropdown('y', y_options)
        $("#" + this.control_container_id).append(encoding_header)
        $("#" + this.control_container_id).append(x_dropdown)
        $("#" + this.control_container_id).append(y_dropdown)
        // var encoding_br = document.createElement("br")
        // $("#" + this.control_container_id).append(encoding_br)

        var marks_header = document.createElement("div")
        marks_header.className = "header"
        marks_header.innerHTML = "Marks"
        var mark_dropdown = this.get_dropdown('mark', ['bar', 'point', 'line'])
        var size_dropdown = this.get_dropdown('size', this.features)
        var color_dropdown = this.get_dropdown('color', this.features)
        var shape_dropdown = this.get_dropdown('shape', this.features)
        $("#" + this.control_container_id).append(marks_header)
        $("#" + this.control_container_id).append(mark_dropdown)
        $("#" + this.control_container_id).append(size_dropdown)
        $("#" + this.control_container_id).append(color_dropdown)
        $("#" + this.control_container_id).append(shape_dropdown)
        // var marks_br = document.createElement("br")
        // $("#" + this.control_container_id).append(marks_br)

        var filters_header = document.createElement("div")
        filters_header.className = "header"
        filters_header.innerHTML = "Filters"
        $("#" + this.control_container_id).append(filters_header)
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

class SpecifiedPlot{
    constructor(plot_container_id, control, bookmarked, recommended_plots_container_id, recommended_plots_button_id){
        this.plot_container_id = plot_container_id
        this.control = control
        this.bookmarked = bookmarked
        this.recommended_plots_container_id = recommended_plots_container_id
        this.recommended_plots_button_id = recommended_plots_button_id

        this.selected_recommendation_plots_index = null
        this.recommended_plots = []
        $(".dropdown").change(function(){
            if (!this.control.from_plot){
                console.log('change dropdown')
                this.control_change()
            }
        }.bind(this))
    }

    toggle_bookmark(){
        var direction = 'low'
        this.bookmarked.toggle_bookmark(this.plot, direction)
    }

    create_plot(x, x_values, y, agg, color, filter, mark, data, dtypes){
        this.plot = new Plot(x, x_values, y, agg, color, filter, mark, data, dtypes, this.plot_container_id)
        this.plot.plot("container", "container")
        this.reset_button()
    }

    toggle_recommended(){
        if (this.selected_recommendation_plots_index+1 < this.recommended_plots.length){
            for (var j=this.selected_recommendation_plots_index+1; j<this.recommended_plots.length; j++){
                this.recommended_plots.splice(this.recommended_plots.length-1, 1)
                $("#recommended-plots-container-" + j).remove()
            }
            var new_recommended_plots = []
            for (var j=0; j<selected_recommendation_plots_index+1; j++){
                new_recommended_plots.push(this.recommended_plots[j])
            }
            this.recommended_plots = new_recommended_plots
        }
        if (this.selected_recommendation_plots_index == null){
            $("#recommended-plots-container-").toggle()
            this.selected_recommendation_plots_index = 0
        } else {
            $("#recommended-plots-container-" + this.selected_recommendation_plots_index).toggle()
            this.selected_recommendation_plots_index++
        }

        if (this.selected_recommendation_plots_index == this.recommended_plots.length){
            $("#recommendations-next").prop("disabled",true)
        } else {
            $("#recommendations-next").prop("disabled",false)
        }
        if (this.selected_recommendation_plots_index == 0){
            $("#recommendations-back").prop("disabled",true)
        } else {
            $("#recommendations-back").prop("disabled",false)
        }
    }

    plot_recommendations(recommendations, verbose){
        var level = this.recommended_plots.length
        if (level > 0){
            $("#" + this.recommended_plots_container_id + '-' + (level-1)).toggle()
        }

        var container_id = this.recommended_plots_container_id + '-' + level
        var container = document.createElement("div")
        container.id = container_id
        container.className = this.recommended_plots_container_id
        $("#" + this.recommended_plots_container_id).append(container)

        var plots = new RecommendedPlots(container_id, this.recommended_plots_button_id, this)
        plots.plot_recommendations(this.plot, recommendations, this.recommended_plots.length)
        this.recommended_plots.push(plots)
    }

    scroll_recommendations(index_change){
        $("#recommended-plots-container-" + this.selected_recommendation_plots_index).toggle()
        this.selected_recommendation_plots_index += index_change
        $("#recommended-plots-container-" + this.selected_recommendation_plots_index).toggle()

        if (index_change == -1){
            $("#recommendations-next").prop("disabled",false)
        }
        if (this.selected_recommendation_plots_index+1 == this.recommended_plots.length-1){
            $("#recommendations-next").prop("disabled",true)
        }
        if (this.selected_recommendation_plots_index == 0){
            $("#recommendations-back").prop("disabled",true)
        } else {
            $("#recommendations-back").prop("disabled",false)
        }
    }

    swap_plot(plot){
        this.plot = plot
        this.plot.plot_container_id = this.plot_container_id
        this.plot.plot("container", "container", true)
        this.reset_button()
        $(".filter-container").remove()
    }

    select_recommended(plot_index){
        var plot = this.recommended_plots[this.selected_recommendation_plots_index].plots[plot_index]
        this.swap_plot(plot)
        // $("#" + this.recommendation_plots[this.selected_recommendation_plots_index].plots_container_id).empty()
        // this.plot_recommendations(this.recommendation_plots[this.selected_recommendation_plots_index].plots_container_id,
        //                           this.recommendation_plots[this.selected_recommendation_plots_index].recommendations, true)
        this.control.set_controls(this)
    }

    control_change(){
        console.log('control_change')
        var x = $('#x').val()
        var y = $('#y').val()
        var mark = $('#mark').val()
        var size = $('#size').val()
        var color = $('#color').val()
        var shape = $('#shape').val()

        this.plot.update_plot(x, y, null, color, null, mark)
        this.reset_button()
    }

    reset_button(){
        $("#save-button").addClass("btn-outline-secondary")
        $("#save-button").removeClass("btn-primary")
    }

    set_button(){
        $("#save-button").removeClass("btn-outline-secondary")
        $("#save-button").addClass("btn-primary")
    }
}

class SmallMultiplePlots{
    constructor(plot_container_id, plot){
        this.plot_container_id = plot_container_id
        this.plot = plot
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
        } else {
            var a = " between " + values[0].toFixed(2) + " and " + values[1].toFixed(2)
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
        filters_text.id = this.plot_container_id + "-filters-text"
        filters_text.className = "filters-text"
        filters_text.innerHTML = this.get_filter_text(filters)
        return {'x': x_text, 'filters': filters_text}
    }

    get_plot_text(plot, direction){
        var text_container = document.createElement("div")
        var y_text = document.createElement("span")
        var agg_to_text = {"mean": "Average", "sum": "total"}
        var agg_text = agg_to_text[plot.agg]
        y_text.innerHTML = agg_text + " " + plot.y + " is " + direction
        y_text.id = this.plot_container_id + "-y-text"
        y_text.className = "y-text"
        text_container.appendChild(y_text)

        var x_filter_text = this.get_x_filter_text(plot.filter, plot.x, plot.x_values, plot.dtypes)

        text_container.appendChild(x_filter_text['x'])
        text_container.appendChild(x_filter_text['filters'])
        return text_container
    }

    create_plot(plot, container_id){
        var new_plot = plot.copy(container_id)
        new_plot.plot("container", "container")
        return new_plot
    }

    create_plot_and_text(plot, direction){
        var container_id = this.plot_container_id + "-content"
        var container = this.create_container(container_id)
        $("#" + this.plot_container_id).append(container)

        this.plot = this.create_plot(plot, container_id + "-plot")
        var text = this.get_plot_text(this.plot, direction)
        $("#" + container_id + "-text").append(text)
    }

    add_plot_filter(feature, value){
        this.plot.add_filter(feature, value)
    }

    add_text_filter(feature, value){
        var filters = {}
        for (var f in plot.filter){
            filters[f] = plot.filter[f]
        }
        filters[feature] = [value]
        var text = this.get_filter_text(filters)
        document.getElementById(this.plot_container_id + "-filters-text-").innerHTML = text
    }

    change_plot_y(y){
        this.plot.update_plot(null, y, null, null, null, null)
    }

    change_text_y(y, direction){
        var agg_to_text = {"mean": "Average", "sum": "total"}
        var agg_text = agg_to_text[this.plot.agg]
        document.getElementById(this.plot_container_id + "-y-text").innerHTML = agg_text + " " + y + " is " + direction
    }
}

class RecommendedPlots{
    constructor(plots_container_id, button_container_id, specified){
        this.plots_container_id = plots_container_id
        this.button_container_id = button_container_id
        this.specified = specified
        this.plots = []
    }

    plot_recommendations(specified_plot, recommendations, value){
        this.recommendations = recommendations
        var plot_index = 0

        for (var i=0; i<recommendations.length; i++){
            var direction = recommendations[i]['direction']
            var feature = recommendations[i]['feature']
            var container_id = this.plots_container_id + '-' + plot_index
            var container = document.createElement("div")
            container.id = container_id
            container.className = this.plots_container_id
            $("#" + this.plots_container_id).append(container)

            var plot = new SmallMultiplePlots(container_id, this.specified)
            plot.create_plot_and_text(specified_plot, direction)
            plot.change_plot_y(feature)
            plot.change_text_y(feature, direction)
            this.plots.push(plot.plot)
            plot_index++
        }
        this.add_button(value)
        $("." + this.plots_container_id).click(function(elem){
            console.log('click recommended')
            var id = elem.currentTarget.id.split('-')[4]
            var plot = this.plots[id]
            this.specified.swap_plot(plot)
        }.bind(this))
    }

    add_button(value){
        var radio = document.createElement("input")
        radio.id = this.plots_container_id + '-button-' + value
        radio.name = "recommendation-button"
        radio.className = "recommendation-button"
        radio.value = value
        radio.type = 'radio'
        $("#" + this.button_container_id).append(radio)
        $('input:radio[name="recommendation-button"]').filter('[value="' + value + '"]').attr('checked', true);

        $(".recommendation-button").click(function(){
            console.log("click recommendation-button")
            var val = parseInt($('input[name="recommendation-button"]:checked').val())
            $(".recommended-plots-container").hide()
            $("#recommended-plots-container-" + val).show()
        })
    }
}

class BookmarkedPlots{
    constructor(plots_container_id, specified){
        this.plots_container_id = plots_container_id
        this.specified = specified
        this.bookmarked_plots = []
        this.bookmarked_plots_index = []
        this.plot_index = 0
    }

    bookmark(plot, direction){
        var container_id = this.plots_container_id + '-' + this.plot_index
        var container = document.createElement("div")
        container.id = container_id
        $("#" + this.plots_container_id).append(container)

        var new_plot = new SmallMultiplePlots(container_id, this.specified)
        new_plot.create_plot_and_text(plot, direction)
        this.bookmarked_plots.push(plot)
        this.bookmarked_plots_index.push(this.plot_index)
        this.plot_index++

        $("#" + container_id).click(function(elem){
            var id = elem.currentTarget.id.split('-')[3]
            var plot_index = this.bookmarked_plots_index.indexOf(parseInt(id))
            var plot = this.bookmarked_plots[plot_index]
            this.specified.swap_plot(plot)
            this.specified.set_button()
        }.bind(this))
    }

    unbookmark(plot){
        var index = this.bookmarked_plots.indexOf(plot)
        var plot_index = this.bookmarked_plots_index[index]
        $("#" + this.plots_container_id + '-' + plot_index).remove()
        this.bookmarked_plots.splice(index, 1)
        this.bookmarked_plots_index.splice(index, 1)
    }

    toggle_bookmark(plot, direction){
        if (this.bookmarked_plots.includes(plot)){
            this.unbookmark(plot)
        } else {
            this.bookmark(plot, direction)
        }
    }
}

class RecommendedPlotsOlds{
    constructor(plots_container_id){
        this.plots_container_id = plots_container_id
        this.container_ids = []
        this.plots = []
    }

    create_container(container_id){
        $("#" + container_id).empty()
        var container = document.createElement("div")
        container.id = container_id
        container.className = "row recommended-plots-container"

        var plot_container = document.createElement("div")
        plot_container.id = container_id + "-plot"
        plot_container.className = "recommended-plot-container"
        var text_container = document.createElement("div")
        text_container.id = container_id + '-text'
        text_container.className = "recommended-text-container"

        container.appendChild(text_container)
        container.appendChild(plot_container)
        this.container_ids.push(container_id)
        return container
    }

    get_feature_value_text(feature, values, dtype){
        if (dtype == "nominal"){
            var a = " is " + values.join(" or ")
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

    get_x_filter_text(plot_index, filters, x, x_values, dtypes){
        var x_text = document.createElement("span")
        x_text.className = "x-text"
        var t = this.get_feature_value_text(x, x_values, dtypes[x])
        x_text.innerHTML = " when " + t

        var filters_text = document.createElement("span")
        filters_text.id = "filters-text-" + plot_index
        filters_text.className = "filters-text"
        filters_text.innerHTML = this.get_filter_text(filters)
        return {'x': x_text, 'filters': filters_text}
    }

    get_plot_text(selected_recommendation_plots_index, plot_index, plot, direction){
        var text_container = document.createElement("div")
        var y_text = document.createElement("span")
        var agg_to_text = {"mean": "Average", "sum": "total"}
        var agg_text = agg_to_text[plot.agg]
        y_text.innerHTML = agg_text + " " + plot.y + " is " + direction
        y_text.id = "y-text-" + selected_recommendation_plots_index + '-' + plot_index
        y_text.className = "y-text"
        text_container.appendChild(y_text)

        var x_filter_text = this.get_x_filter_text(selected_recommendation_plots_index, plot_index, plot.filter, plot.x, plot.x_values, plot.dtypes)

        text_container.appendChild(x_filter_text['x'])
        text_container.appendChild(x_filter_text['filters'])
        return text_container
    }

    create_plot(specified_plot, container_id){
        var plot = specified_plot.plot.copy(container_id)
        plot.plot("container", "container")
        this.plots.push(plot)
        return plot
    }

    create_plot_and_text(specified_plot, plot_index, direction){
        var container_id = this.plots_container_id + "-" + plot_index
        var container = this.create_container(container_id)
        $("#" + this.plots_container_id).append(container)

        var plot = this.create_plot(specified_plot, container_id + "-plot")
        var text = this.get_plot_text(specified_plot.selected_recommendation_plots_index, plot_index, plot, direction)
        $("#" + container_id + "-text").append(text)
    }

    add_plot_filter(plot_index, feature, value){
        var plot = this.plots[plot_index]
        plot.add_filter(feature, value)
    }

    add_text_filter(plot_index, feature, value){
        var plot = this.plots[plot_index]
        var filters = {}
        for (var f in plot.filter){
            filters[f] = plot.filter[f]
        }
        filters[feature] = [value]
        var text = this.get_filter_text(filters)
        document.getElementById("filters-text-" + plot_index).innerHTML = text
    }

    change_plot_y(plot_index, y){
        var plot = this.plots[plot_index]
        plot.update_plot(null, y, null, null, null, null)
    }

    change_text_y(selected_recommendation_plots_index, plot_index, y, direction){
        var agg_to_text = {"mean": "Average", "sum": "total"}
        var plot = this.plots[plot_index]
        var agg_text = agg_to_text[plot.agg]
        document.getElementById("y-text-" + selected_recommendation_plots_index + '-' + plot_index).innerHTML = agg_text + " " + y + " is " + direction
    }

    remove_container(plot_index){
        var container_id = "recommendation-"+ plot_index
        $("#" + container_id).remove()
        this.container_ids.splice(plot_index, 1)
        this.plots.splice(plot_index, 1)
    }

    clear_recommendations(){
        for (var i=0; i<this.container_ids.length; i++){
            this.remove_container(i)
        }
    }

    plot_recommendations(specified_plot, recommendations){
        this.recommendations = recommendations
        var plot_index = 0
        // for (var header in recommendations){
        //     var header_div = document.createElement("div")
        //     header_div.innerHTML = header
        //     header_div.className = "header"
        //     $("#" + this.plots_container_id).append(header_div)

        for (var i=0; i<recommendations.length; i++){
            var direction = recommendations[i]['direction']
            // var type = recommendations[header][i]['type']
            var feature = recommendations[i]['feature']
            // var value = recommendations[header][i]['value']

            console.log(feature)
            this.create_plot_and_text(specified_plot, plot_index, direction)
            this.change_plot_y(plot_index, feature)
            this.change_text_y(specified_plot.selected_recommendation_plots_index, plot_index, feature, direction)
            plot_index++

            // if (type == 'filter' && !specified_plot.plot.filter[feature] != [value]){
            //     this.create_plot_and_text(specified_plot, plot_index, direction)
            //     this.add_plot_filter(plot_index, feature, value)
            //     this.add_text_filter(plot_index, feature, value)
            //     plot_index++
            // } else if (type == 'y' && specified_plot.plot.y != value){
            //     this.create_plot_and_text(specified_plot, plot_index, direction)
            //     this.change_plot_y(plot_index, value)
            //     this.change_text_y(plot_index, value, direction)
            //     plot_index++
            // }
        }
        // }
    }
}

class FeaturePlots extends VegaLitePlot{

    constructor(container_id, predicate, data, dtypes, score_col){
        super()
        this.container_id = container_id
        this.predicate = predicate
        this.data = data
        this.dtypes = dtypes
        this.score_col = score_col
        this.plots = {}
    }

    make_feature_container(feature, values, i){
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
        if (['numeric', 'ordinal'].includes(this.dtypes[feature])){
            feature_text.innerHTML = feature + ': ' + values[0].toFixed(2) + ',' + values[1].toFixed(2)
        } else {
            feature_text.innerHTML = feature + ': ' + values
        }
        feature_text.className = "feature-text"
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
            var container_plot_container_id = this.make_feature_container(feature, this.predicate[feature], i)
            $("#" + this.container_id).append(container_plot_container_id['container'])
            var plot = this.plot_feature(feature, container_plot_container_id['plot_container_id'], width, height)
            this.plots[feature] = plot
            i++
        }
    }
}