class RecommendedPlots{
    constructor(container_id){
        this.container_id = container_id
        this.plots = []
        this.is_selected = true
    }

    plot_recommendations(plot, recommendations){
        $("#" + this.container_id).empty()
        this.recommendations = recommendations
        for (var i=0; i<recommendations.length; i++){
            var direction = recommendations[i]['direction']
            var feature = recommendations[i]['feature']

            var container_id = this.container_id + '-' + i
            var container = document.createElement("div")
            container.id = container_id
            container.className = this.container_id
            $("#" + this.container_id).append(container)

            var rec_plot = new SmallMultiplePlots(container_id, plot)
            rec_plot.create_plot_and_text(direction)
            rec_plot.change_plot_y(feature)
            rec_plot.change_text_y(feature, direction)
            // if (this.is_selected){
            rec_plot.plot.plot("container", "container")
            // }
            this.plots.push(rec_plot.plot)
        }
    }

    get_recommendations(predicate_id, predicate, feature, agg){
        return $.ajax({
            url: '/get_recommendations',
            type: "POST",
            dataType: "JSON",
            data: JSON.stringify({'predicate_id': predicate_id, 'predicate': predicate, 'feature': feature, 'agg': agg}),
            success: function(resp){
                if (resp != null){
                    return resp
                }
            }
        });
    }

    get_plots(plot, predicate_id, predicate, feature, agg){
        this.get_recommendations(predicate_id, predicate, feature, agg).then(function(resp){
            this.plot_recommendations(plot, resp['recommendations'])
        }.bind(this))
    }

    plot(){
        for (var i=0; i<this.plots.length; i++){
            this.plots[i].plot('container', 'container')
        }
    }

    // plot_recommendations(specified_plot, recommendations, value){
    //     this.recommendations = recommendations
    //     var plot_index = 0

    //     for (var i=0; i<recommendations.length; i++){
    //         var direction = recommendations[i]['direction']
    //         var feature = recommendations[i]['feature']
    //         var container_id = this.plots_container_id + '-' + plot_index
    //         var container = document.createElement("div")
    //         container.id = container_id
    //         container.className = this.plots_container_id
    //         $("#" + this.plots_container_id).append(container)

    //         var plot = new SmallMultiplePlots(container_id, this.specified)
    //         plot.create_plot_and_text(specified_plot, direction)
    //         plot.change_plot_y(feature)
    //         plot.change_text_y(feature, direction)
    //         this.plots.push(plot.plot)
    //         plot_index++
    //     }
    //     this.add_button(value)
    //     $("." + this.plots_container_id).click(function(elem){
    //         console.log('click recommended')
    //         var id = elem.currentTarget.id.split('-')[4]
    //         var plot = this.plots[id]
    //         this.specified.swap_plot(plot)
    //     }.bind(this))
    // }

    // add_button(value){
    //     var radio = document.createElement("input")
    //     radio.id = this.plots_container_id + '-button-' + value
    //     radio.name = "recommendation-button"
    //     radio.className = "recommendation-button"
    //     radio.value = value
    //     radio.type = 'radio'
    //     $("#" + this.button_container_id).append(radio)
    //     $('input:radio[name="recommendation-button"]').filter('[value="' + value + '"]').attr('checked', true);

    //     $(".recommendation-button").click(function(){
    //         console.log("click recommendation-button")
    //         var val = parseInt($('input[name="recommendation-button"]:checked').val())
    //         $(".recommended-plots-container").hide()
    //         $("#recommended-plots-container-" + val).show()
    //     })
    // }
}