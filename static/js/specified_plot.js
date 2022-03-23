class SpecifiedPlot{
    constructor(container_id, control, back, next){
        this.container_id = container_id
        this.control = control
        this.back = back
        this.next = next
        this.plot = null
        this.is_bookmarked = false
    }

    update_plot(plot, update_control){
        var new_plot = plot.copy(this.container_id)
        if (this.plot == null){
            self = this
        } else {
            var self = new SpecifiedPlot(this.container_id, this.control, this, null)
        }
        self.plot = new_plot
        if (update_control){
            self.control.set_controls(self.plot)
        }
        return self
    }

    remove_filter(feature){
        var plot = this.plot.remove_filter(feature)
        return this.update_plot(plot, true)
    }

    go_back(){
        if (this.back != null){
            var self = this.back
            self.next = this
            self.control.set_controls(self.plot)
            return self
        } else {
            return this
        }
    }

    go_next(){
        if (this.next != null){
            var self = this.next
            self.back = this
            self.control.set_controls(self.plot)
            return self
        } else {
            return this
        }
    }

    // $('#filter-' + feature).change(function(){
    //     var values = $('#filter-' + feature).val()
    //     console.log(values)
    //     plot.x_values = values
    //     console.log(plot)
    //     this.specified_plot = this.specified_plot.update_plot(plot)
    //     // var new_plot = plot.plot.update_plot(null, null, null, values, null, null)
    //     // plot.update_plot(new_plot, false)
    // }.bind(this))

    control_change(){
        var x = $('#x').val()
        var x_values = $('#filter-' + x).val()
        console.log('control_change')
        console.log(x)
        console.log(x_values)

        var y = $('#y').val()
        var mark = $('#mark').val()
        var size = $('#size').val()
        var color = $('#color').val()
        var shape = $('#shape').val()
        var plot = this.plot.update_plot(x, x_values, y, null, color, null, mark)
        return plot
    }
}