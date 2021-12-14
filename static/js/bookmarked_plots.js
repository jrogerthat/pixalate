class BookmarkedPlots{
    constructor(container_id, feature_values){
        this.container_id = container_id
        this.plots = []
        this.container_ids = []
        this.num_plots = 0
        this.is_selected = true
        this.feature_values = feature_values
    }

    add_bookmark(plot, direction){
        var div = document.createElement("div")
        var id = this.container_id + '-' + this.num_plots
        div.id = id
        $("#" + this.container_id).append(div)
        
        var new_plot = new SmallMultiplePlots(id, plot, this.feature_values)
        new_plot.create_plot_and_text(direction)
        new_plot.plot.plot("container", "container")
        this.plots.push(new_plot.plot)
        this.container_ids.push(id)
        this.num_plots++
    }

    get_plot_index(plot){
        var index = -1
        for (var i=0; i<this.plots.length; i++){
            if (this.plots[i].equals(plot)){
                var index = i
            }
        }
        return index
    }

    remove_bookmark(plot){
        var index = this.get_plot_index(plot)
        var container_id = this.container_ids[index]
        $("#" + container_id).remove()
    }

    is_bookmarked(plot){
        var index = this.get_plot_index(plot)
        return index > -1
    }

    get_plot_from_container_id(container_id){
        console.log(this.container_ids)
        var index = this.container_ids.indexOf(container_id)
        return this.plots[index]
    }
}