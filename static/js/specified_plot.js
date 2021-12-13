class SpecifiedPlot{
    constructor(container_id, control){
        this.container_id = container_id
        this.control = control
        this.plot = null
        this.is_bookmarked = false
    }

    plot_copy(plot){
        this.plot = plot.copy(this.container_id)
        this.plot.plot("container", "container")
        this.control.set_from_plot(this.plot)
    }

    control_change(){
        var x = $('#x').val()
        var y = $('#y').val()
        var mark = $('#mark').val()
        var size = $('#size').val()
        var color = $('#color').val()
        var shape = $('#shape').val()
        this.plot.update_plot(x, y, null, color, null, mark)
        this.plot.plot("container", "container")
    }
}