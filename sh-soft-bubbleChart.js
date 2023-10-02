function initializeChart(config, data) {

    const width = config.width || 800;
    const height = config.height || 500;
    const margin = 30;
    const options = config.options;
    const optionConfig = options.tooltip && options.label;
    const labelConfig = options.label;
    const tooltipConfig = options.tooltip;
    const labelSize = labelConfig.labelFont || "8px";
    const tooltipBackgroundColor = tooltipConfig.backgroundColor || "white";
    const tooltipBorderRadius = tooltipConfig.borderRadius || "1px solid #ccc";
    const tooltipColor = tooltipConfig.color || "black";



    const chart = d3.select("#chart")
        .style("width", "800px")
        .style("margin", "0 auto")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");


    // set the pack layout
    const pack = d3.pack()
        .size([width - margin, height - margin])
        .padding(1);

    // create the root node
    const root = d3.hierarchy({ children: data })
        .sum(function (d) { return d.time; });

    // create the nodes
    const nodes = pack(root).leaves();


    // ===================   Option Config   =========================


    if (optionConfig) {

        const tooltipDiv = d3.select("#chart").append("div")
            .attr("id", "tooltip")


        tooltipDiv.append("div")
            .attr("class", "tooltip-content")
            .append("span")
            .attr("class", "name");

        tooltipDiv.select(".tooltip-content")
            .append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "5px")
            .append("span")
            .attr("class", "count");


        tooltipDiv.select(".tooltip-content")
            .select("div")
            .append("span")
            .attr("class", "color");

        const tooltip = d3.select("#tooltip")
            .style("position", "absolute")
            .style("background-color", tooltipBackgroundColor)
            .style("border", tooltipBorderRadius)
            .style("padding", "5px")
            .style("display", "none");

        tooltip.select(".tooltip-content")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("gap", "5px");

        tooltip.select(".name")
            .style("font-weight", "bold")
            .style("overflow", "hidden")
            .style("transition", "0.3s ease-out")
            .style("width", "120px")
            .style("color", tooltipColor)
            .style("white-space", "nowrap")
            .style("text-overflow", "ellipsis");

        tooltip.select(".count")
            .style("font-weight", "bold")
            .style("color", tooltipColor)


        tooltip.select(".color")
            .style("display", "inline-block")
            .style("width", "15px")
            .style("height", "15px")
            .style("border-radius", "50%");



        // create a filter for the inner shadow
        const filter = chart.append("defs")
            .append("filter")
            .attr("id", "drop-shadow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");

        filter.append("feComponentTransfer")
            .attr("in", "SourceAlpha")
            .append("feFuncA")
            .attr("type", "table")
            .attr("tableValues", "1 0");

        filter.append("feGaussianBlur")
            .attr("stdDeviation", 8);

        filter.append("feOffset")
            .attr("dx", 5)
            .attr("dy", 5)
            .attr("result", "offsetblur");

        filter.append("feFlood")
            .attr("flood-color", "rgba(75, 72, 72, 0.3)")
            .attr("result", "color");

        filter.append("feComposite")
            .attr("in2", "offsetblur")
            .attr("operator", "in");

        filter.append("feComposite")
            .attr("in2", "SourceAlpha")
            .attr("operator", "in");

        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
        feMerge.append("feMergeNode")
            .attr("in", "comp");

        // create the bubbles
        const bubbles = chart.selectAll(".bubble")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", function (d) { return d.r; })
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .style("fill", function (d) { return d.data.color; })
            .style("position", "relative")
            .style("filter", "url(#drop-shadow)")
            .on("mouseover", function (event, d) {
                tooltip.select(".name").text(`Name: ${d.data.name}`);
                tooltip.select(".count").text(`Count: ${d.data.count}`);
                tooltip.select(".color").style("background-color", d.data.color);
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .style("display", "block");
                d3.select(this).transition()
                    .duration(200)
                    .attr("r", d.r + 5);
            })
            .on("mousemove", function (event, d) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
                d3.select(this).transition()
                    .duration(200)
                    .attr("r", function (d) { return d.r; });
            })

        const labels = chart.selectAll(".label")
            .data(nodes)
            .enter()
            .append("text")
            .attr("dy", ".3em")
            .style("font-size", labelSize)
            .attr("fill", "#ffffff")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .text(d => `${d.data.time}분`)

        const shadowDivs = d3.select("#chart").append("div")
            .attr("class", "fill-shadow")
            .style("position", "relative")
            .selectAll(".b-shadow")
            .data(nodes);

        shadowDivs.enter()
            .append("div")
            .attr("class", "b-shadow")
            .merge(shadowDivs)
            .style("left", d => `${d.x}px`)
            .style("width", d => `${2 * d.r}px`)
            .style("position", "absolute")
            .style("height", "25px")
            .style("border-radius", "50%")
            .style("background", "rgb(247, 247, 247)")
            .style("transform", "translateX(-50%)");

        shadowDivs.exit().remove();
    }
}
