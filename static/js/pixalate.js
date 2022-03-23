//TODO: remake predicates
//TODO: snap to predicate text
//TODO: hover graph/predcate list
//TODO: dynamic filters

class PixalAte{
    constructor(graph, text, specified_plot, recommended_plots, bookmarked_plots, score_plot_container_id, feature_plots_container_id, data, dtypes, score_col,
                predicates, predicate_masks, predicate_feature_masks){
        this.graph = graph
        this.text = text
        this.specified_plot = specified_plot
        this.recommended_plots = recommended_plots
        this.bookmarked_plots = bookmarked_plots

        this.score_plot_container_id = score_plot_container_id
        this.feature_plots_container_id = feature_plots_container_id

        this.data = data
        this.dtypes = dtypes
        this.score_col = score_col
        this.predicates = predicates
        this.predicate_masks = predicate_masks
        this.predicate_feature_masks = predicate_feature_masks

        this.score_plot = null
        this.selected_predicate_id = null
        this.selected_feature = null

        $(".predicate").click(function(elem){
            var predicate_id = elem.target.id.split('-')[2]
            this.select_predicate_id(predicate_id, false)
        }.bind(this))
        // $(".predicate").hover(function(elem){
        //     var predicate_id = elem.target.id.split('-')[2]
        //     this.select_predicate_id(predicate_id, true)
        // }.bind(this))
        $(".dropdown-value").change(function(){
            this.control_change()
        }.bind(this))
        $("#recommended-tab-button").click(function(){
            this.get_recommendations()
        }.bind(this))
        $("#bookmark-button").click(function(){
            this.bookmark()
        }.bind(this))
        $("#back-button").click(function(){
            this.specified_back()
        }.bind(this))
        $("#next-button").click(function(){
            this.specified_next()
        }.bind(this))
    }

    update_score_plot(predicate_mask){
        for (var i=0; i<this.data.length; i++){
            this.data[i]['predicate'] = predicate_mask[i]
        }
        this.score_plot = new ScorePlot(this.score_plot_container_id, this.data, this.score_col)
        this.score_plot.plot("container", "container")
    }

    update_feature_plots(predicate, predicate_text){
        this.feature_plots = new FeaturePlots(this.feature_plots_container_id, predicate, predicate_text, this.data, this.dtypes, this.score_col)
        this.feature_plots.plot("container", "container")
    }

    select_predicate_id(predicate_id, hover){
        if (predicate_id == this.selected_predicate_id){
            this.selected_predicate_id = null
        } else {
            this.selected_predicate_id = predicate_id
        }
        var predicate_mask = this.predicate_masks[predicate_id]
        var predicate = this.predicates[predicate_id]
        var predicate_text = this.text.predicates_text[predicate_id]

        this.graph.select_predicate(this.selected_predicate_id, hover)
        this.text.select_predicate(this.selected_predicate_id, hover)
        this.update_score_plot(predicate_mask)
        this.update_feature_plots(predicate, predicate_text)
        // this.text.scroll_to(predicate_id)

        $(".pivot-button").click(function(elem){
            var feature = elem.currentTarget.value
            this.select_feature(feature)
        }.bind(this))
    }

    get_recommendations(){
        if (this.recommended_plots.plots.length == 0){
            var plot = this.specified_plot.plot
            var predicate = this.predicates[this.selected_predicate_id]
            this.recommended_plots.get_recommendations(this.selected_predicate_id, predicate, this.selected_feature, "mean").then(function(resp){
                var recommendations = []
                for (var i=0; i<resp['recommendations'].length; i++){
                    var direction = this.get_direction(this.selected_feature, resp['recommendations'][i]['feature'], this.predicate_masks[this.selected_predicate_id], this.predicate_feature_masks[this.selected_predicate_id])
                    recommendations.push({'feature': resp['recommendations'][i]['feature'], 'direction': direction})
                }
                this.recommended_plots.plot_recommendations(plot, recommendations)
                $(".small-multiple").click(function(elem){
                    this.select_small_multiple(elem, true)
                }.bind(this))
            }.bind(this))
        }
    }

    toggle_back_next(){
        if (this.specified_plot.next != null){
            $('#next-button').prop('disabled', false)
        } else {
            $('#next-button').prop('disabled', true)
        }
        if (this.specified_plot.back != null){
            $('#back-button').prop('disabled', false)
        } else {
            $('#back-button').prop('disabled', true)
        }
    }

    remove_filter(feature){
        this.specified_plot = this.specified_plot.remove_filter(feature)
        this.plot_specified()
    }

    plot_specified(){
        this.specified_plot.plot.plot("container", "container")
        var is_bookmarked = this.bookmarked_plots.is_bookmarked(this.specified_plot.plot)
        this.specified_plot.is_bookmarked = is_bookmarked
        this.toggle_bookmark()
        this.toggle_back_next()
        $(".remove-filter-button").click(function(elem){
            var id_array = elem.currentTarget.id.split('-')
            var feature = id_array[id_array.length-1]
            this.remove_filter(feature)
        }.bind(this))
    }

    update_specified_plot(plot, update_control){
        this.specified_plot = this.specified_plot.update_plot(plot, update_control)
        this.plot_specified()
    }

    select_feature(feature){
        var plot = this.feature_plots.plots[feature]
        this.update_specified_plot(plot, true)
        this.selected_feature = feature
        var active_tab = $("ul#tabs a.active")[0].id.split('-')[0]
        if (active_tab == 'recommended'){
            $('[href="#null-tab"]').tab('show');
        }
        this.recommended_plots.clear_recommendations()
        $('#filter-' + feature).change(function(){
            this.control_change()
        }.bind(this))
    }

    specified_back(){
        this.specified_plot = this.specified_plot.go_back()
        this.plot_specified()
    }

    specified_next(){
        this.specified_plot = this.specified_plot.go_next()
        this.plot_specified()
    }

    control_change(){
        var plot = this.specified_plot.control_change()
        this.update_specified_plot(plot, false)
    }

    get_direction(x, y, predicate, predicate_feature_mask){
        console.log('get_direction')
        var in_count = 0
        var out_count = 0
        var in_sum = 0
        var out_sum = 0

        for (var i=0; i<this.data.length; i++){
            if (predicate[i]){
                var in_predicate = predicate_feature_mask[x][i]
                if (in_predicate){
                    in_count++
                    in_sum += this.data[i][y]
                } else {
                    out_count++
                    out_sum += this.data[i][y]
                }
            }
        }

        console.log(out_mean)
        console.log(out_count)
        var in_mean = in_sum / in_count
        var out_mean = out_sum / out_count
        if (in_mean > out_mean){
            var direction = 'high'
        } else {
            var direction = 'low'
        }
        return {'direction': direction, 'in_mean': in_mean, 'out_mean': out_mean}
    }

    toggle_bookmark(){
        $('#bookmark-button').prop('disabled', false)
        if (this.specified_plot.is_bookmarked){
            $("#bookmark-button").removeClass("btn-outline-secondary")
            $("#bookmark-button").addClass("btn-primary")
        } else {
            $("#bookmark-button").addClass("btn-outline-secondary")
            $("#bookmark-button").removeClass("btn-primary")
        }
    }

    bookmark(){
        $('[href="#bookmarked-tab"]').tab('show');
        var plot = this.specified_plot.plot
        if (plot != null){
            if (this.specified_plot.is_bookmarked){
                this.bookmarked_plots.remove_bookmark(plot)
                this.specified_plot.is_bookmarked = false
                
            } else {
                var predicate_feature_mask = this.predicate_feature_masks[this.selected_predicate_id]
                var predicate = this.predicates[this.selected_predicate_id]
                console.log(predicate)
                var direction = this.get_direction(plot.x, plot.y, predicate, predicate_feature_mask)
                this.bookmarked_plots.add_bookmark(plot, direction)
                this.specified_plot.is_bookmarked = true
            }
            this.toggle_bookmark()
            $(".small-multiple").click(function(elem){
                this.select_small_multiple(elem, false)
            }.bind(this))
        }
    }

    get_plot_from_container_id(container_id){
        if (container_id.split('-')[0] == 'boomarked'){
            return this.bookmarked_plots.get_plot_from_container_id(container_id)
        }
    }

    select_small_multiple(elem, is_recommended){
        var content_id = elem.currentTarget.id
        var content_id_array = content_id.split('-')
        content_id_array.splice(content_id_array.length-1, 1)
        var container_id = content_id_array.join('-')
        if (is_recommended){
            var plot = this.recommended_plots.get_plot_from_container_id(container_id)
        } else {
            var plot = this.bookmarked_plots.get_plot_from_container_id(container_id)
        }
        this.update_specified_plot(plot, true)

        // this.specified_plot.plot_copy(plot)
        // var is_bookmarked = this.bookmarked_plots.is_bookmarked(plot)
        // this.specified_plot.is_bookmarked = is_bookmarked
        // this.toggle_bookmark()
    }

    add_filter(feature, values){
        this.control.add_filter(feature, values)
    }

    set_remove_filter_button(){
        $(".remove-filter-button").click(function(elem){
            var id_array = elem.currentTarget.id.split('-')
            var feature = id_array[id_array.length-1]
            this.remove_filter(feature)
        }.bind(this))
    }

    add_filters(filters){
        for (var feature in filters){
            this.specified_plot.control.add_filter(feature, filters[feature])
        }
        this.set_remove_filter_button()
    }
}