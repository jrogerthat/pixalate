class BookmarkedPlots{
    constructor(container_id){
        this.container_id = container_id
        this.plots = []
        this.container_ids = []
        this.num_plots = 0
        this.is_selected = true
    }

    add_bookmark(plot, direction){
        var div = document.createElement("div")
        var id = this.container_id + '-' + this.num_plots
        div.id = id
        $("#" + this.container_id).append(div)
        
        var new_plot = new SmallMultiplePlots(id, plot)
        new_plot.create_plot_and_text(direction)
        new_plot.plot.plot("container", "container")
        this.plots.push(new_plot.plot)
        this.container_ids.push(id)
        this.num_plots++
    }

    remove_bookmark(plot){
        console.log('remove_bookmark')
        var index = this.plots.indexOf(plot)

        console.log(this.plots[0])
        console.log(plot)
        console.log((this.plots[0].equals(plot)))
        console.log(index)
        var container_id = this.container_ids[index]
        $("#" + container_id).remove()
    }

    is_bookmarked(plot){
        return this.bookmarked_plots.plots.includes(plot)
    }
}