class ScorePlot extends VegaLitePlot{

    constructor(container_id, data, score_col){
        super()
        this.container_id = container_id
        this.data = data
        this.score_col = score_col
    }

    get_spec(){
        var spec = {
            "config": {
                "legend": {"disable": true}
            },
            "mark": "area",
            "transform": [
                {
                    "density": this.score_col,
                    "groupby": ["predicate"],
                    "bandwidth": 0.49
                    // "steps": 100
                }
            ],
            "encoding": {
                "x": {"field": "value", "type": "quantitative", "title": this.score_col},
                "y": {"field": "density", "type": "quantitative", "stack": "zero"},
                "color": {
                    "field": "predicate", 
                    "scale": {
                        "domain": [true, false],
                        "range": ["#1f77b4", "#949494"]
                }}
            }
        }
        return spec
    }


    plot(width, height){
        $("#" + this.container_id).empty()
        var spec = this.get_spec()
        var container = document.createElement("div")
        container.id = "score-plot"
        container.style.width = "calc(100% - 10px)"
        container.style.height = "calc(100% - 10px)"
        container.style.marginTop = "10px"
        container.style.marginLeft = "10px"
        $("#" + this.container_id).append(container)
        this.plot_spec(this.data, null, null, null, spec, 'score-plot', width, height)
    }
}