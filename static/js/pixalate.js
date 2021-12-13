class PixalAte{
    constructor(graph, text, specified_plot, recommended_plots, bookmarked_plots, score_plot_container_id, feature_plots_container_id, data, dtypes, score_col, predicates, predicate_masks){
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

        this.score_plot = null
        this.selected_predicate_id = null

        $(".predicate").click(function(elem){
            var predicate_id = elem.target.id.split('-')[2]
            this.select_predicate_id(predicate_id, false)
        }.bind(this))
        // $(".predicate").hover(function(elem){
        //     var predicate_id = elem.target.id.split('-')[2]
        //     this.select_predicate_id(predicate_id, true)
        // }.bind(this))
        $("#recommended-tab-button, #bookmarked-tab-button").click(function(){
            // this.toggle_recommended()
            // this.toggle_bookmarked()
        }.bind(this))
        $("#bookmark-button").click(function(){
            this.bookmark()
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
        $(".pivot-button").click(function(elem){
            var feature = elem.currentTarget.value
            this.select_feature(feature)
        }.bind(this))
    }

    select_feature(feature){
        var plot = this.feature_plots.plots[feature]
        this.specified_plot.plot_copy(plot)
        var predicate = this.predicates[this.selected_predicate_id]
        this.recommended_plots.get_plots(plot, this.selected_predicate_id, predicate, feature, "mean")
        if (this.is_recommended){
            this.recommended_plots.plot()
        }
    }

    get_direction(x, y, predicate_mask){
        var in_count = 0
        var out_count = 0
        var in_sum = 0
        var out_sum = 0
        for (var i=0; i<this.data; i++){
            var in_predicate = true
            for (var feature in predicate_mask){
                if (feature != x){
                    if (!predicate_mask[feature][i]){
                        in_predicate = false
                    }
                }
            }
            if (in_predicate){
                in_count++
                in_sum += this.data[i][y]
            } else {
                out_count++
                out_sum += this.data[i][y]
            }
        }
        var in_mean = in_sum / in_count
        var out_mean = out_sum / out_count
        if (in_mean > out_mean){
            return 'high'
        } else {
            return 'low'
        }
    }

    bookmark(){
        console.log('bookmark')
        var plot = this.specified_plot.plot
        if (plot != null){
            var predicate_mask = this.predicate_masks[this.selected_predicate_id]
            var direction = this.get_direction(plot.x, plot.y, predicate_mask)
            this.bookmarked_plots.add_bookmark(plot, direction)
        }
    }

    select_small_multiple(plot){

    }

    // toggle_recommended(){
    //     console.log('toggle_recommended')
    //     if (this.recommended_plots.is_selected){
    //         this.recommended_plots.is_selected = false
    //     } else {
    //         console.log('select')
    //         this.recommended_plots.plot()
    //         this.recommended_plots.is_selected = true
    //     }
    // }

    add_filter(feature, values){
        this.control.add_filter(feature, values)
    }

    remove_filter(feature){
        this.control.remove_filter(feature)
    }

    update_specified_plot_control(){

    }


    recommend_plot(plot){

    }

    plot_recommendations(recommendations){

    }

    update_specified_plot(plot){

    }

    update_specified_plot_recommended(){

    }

    update_specified_plot_bookmarked(){

    }
}