class Graph{
    constructor(container_id, graph_data, score_col){
        this.container_id = container_id
        this.graph_data = graph_data
        this.score_col = score_col

        this.width = $("#" + this.container_id).width()
        this.height = $("#" + this.container_id).height()
        this.max_distance = this.width / 2

        this.node_color = this.get_node_color_scale(this.graph_data.nodes, this.score_col)
        this.link_color = this.get_link_color_scale(this.graph_data.links)
        this.radius = this.get_radius_scale(this.graph_data.nodes)

        this.svg = this.make_svg(this.width, this.height)
        this.links = this.make_links(this.svg, this.graph_data)
        this.nodes = this.make_nodes(this.svg, this.graph_data, this.score_col)
        this.simulation = this.simulate(this.graph_data, this.max_distance, this.links, this.nodes)
    }

    get_node_color_scale(nodes, score_col){
        var color = d3.scaleLinear()
                          .domain(d3.extent(nodes, function(d) { return d[score_col] }))
                          .range(["#b8b8b8", "#4f4f4f"]);
        return color
    }

    get_link_color_scale(links){
        var color = d3.scaleLinear()
                          .domain([0, d3.max(links, function(d) { return d.group })])
                          .range(d3.schemeCategory10);
        return color
    }

    get_radius_scale(nodes){
        var radius = d3.scaleLinear()
        .range([15, 30])
        .domain(d3.extent(nodes, function(d) {return d.id}))
        return radius
    }

    make_svg(width, height){
        var svg = d3.select("#" + this.container_id)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
        return svg
    }

    make_links(svg, graph_data){
        var links = svg
            .selectAll("line")
            .data(graph_data.links)
            .enter()
            .append("line")
            .attr('stroke-width', function(d) { return d.similarity>0? 2 : 0 })
            .style("stroke", "#aaa")
            // .style("stroke", function(d) { console.log(d.group); return this.link_color(d.group) }.bind(this))
        return links
    }

    make_nodes(svg, graph_data, score_col){
        var nodes = svg
            .selectAll("circle")
            .data(graph_data.nodes)
            .enter()
            .append("circle")
            .attr("class", "predicate predicate-node")
            .attr("id", function(d) { return "predicate-node-" + d.id}.bind(this))
            .attr("r", function(d) {return this.radius(d.id) }.bind(this))
            .style("fill", function(d) {return this.node_color(d[score_col]) }.bind(this))
        return nodes
    }

    simulate(graph_data, max_distance, links, nodes){
        var simulation = d3.forceSimulation(graph_data.nodes)
            .force("link", d3.forceLink()
                    .id(function(d) { return d.id; })
                    .links(graph_data.links)
                    .distance(function(d) { return max_distance / (Math.exp(d.similarity)*1.55) })

            )
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .on("end", ticked)

            function ticked() {
                links
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });
    
                nodes
                    .attr("cx", function (d) { return d.x+6; })
                    .attr("cy", function(d) { return d.y-6; });
            }
        return simulation
    }

    select_predicate(predicate_id, hover){
        $(".predicate-node").removeClass("selected-predicate-node")
        $(".predicate-node").removeClass("hovered-predicate-node")
        if (predicate_id != null){
            if (hover){
                $("#predicate-node-" + predicate_id).addClass("hovered-predicate-node")
            } else {
                $("#predicate-node-" + predicate_id).addClass("selected-predicate-node")
            }
        }
    }
}