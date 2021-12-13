class BookmarkedPlots{
    constructor(container_id){
        this.container_id = container_id
        this.plots = []
        this.is_selected = true
    }

    add_bookmark(plot, direction){
        var new_plot = new SmallMultiplePlots(this.container_id, plot)
        new_plot.create_plot_and_text(direction)
        new_plot.plot.plot("container", "container")
    }
}