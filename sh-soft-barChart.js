function initializeChart(config, data) {
    const width = config.width || 500;
    const height = config.height || 300;
    const legendLimit = config.legendLimit || 6;
    const options = config.options;
    const optionConfig = options.legend && options.tooltip;
    const legendConfig = options.legend;
    const tooltipConfig = options.tooltip;
    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const legendColumns = legendConfig.columns || 2;
    const legendGap = legendConfig.gap || "8px 80px";
    const tooltipBackgroundColor = tooltipConfig.backgroundColor || "white";
    const tooltipBorderRadius = tooltipConfig.borderRadius || "1px solid #ccc";
    const tooltipColor = tooltipConfig.color || "black";
    let legendSelected = null;
    let isLegendExpanded = false;



    const mainDiv = d3.select("body")
        .style("text-align", "center")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center");


    const tooltipDiv = mainDiv.append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip");

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




    const svg = d3.select("#my-svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "auto");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.right},${margin.top})`);


    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .rangeRound([0, innerWidth])
        .paddingInner(0.9)
        .paddingOuter(0.47);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([innerHeight, 0]);


    // ===================   Option Config   =========================


    if (optionConfig) {

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


        g.append("g")
            .attr("class", "gridlines-x")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(fc.axisOrdinalBottom(x)
                .ticks(data.length)
                .tickSize(-innerHeight)
                .tickFormat("")
            )
            .selectAll("path")
            .style("stroke", "#ccc");


        g.selectAll("text").remove();

        g.append("g")
            .attr("class", "gridlines-y")
            .attr("transform", `translate(${innerWidth}, 0)`)
            .call(d3.axisRight(y)
                .ticks(data.length)
                .tickSize(-innerWidth)
                .tickPadding(10)
            )
            .selectAll("line")
            .style("stroke", "#ccc")

        g.selectAll(".gridlines-x path, .gridlines-y path")
            .style("stroke", "#ccc");

        g.selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("x", d => x(d.name))
            .attr("y", innerHeight)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", d => d.color)
            .on("mouseover", function (event, d) {
                tooltip.select(".name").text(`Name: ${d.name}`);
                tooltip.select(".count").text(`Count: ${d.count}`);
                tooltip.select(".color").style("background-color", d.color);
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .style("display", "block");
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
            })
            .transition()
            .duration(1000)
            .attr("y", d => y(d.count))
            .attr("height", d => innerHeight - y(d.count))
            .attr("rx", 5)
            .attr("ry", 5);



        function toggleBar(selectedData) {
            const selectedRect = g.selectAll("rect").filter(d => d === selectedData);

            selectedData.isAnimated = false;

            selectedRect.transition()
                .duration(500)
                .attr("y", innerHeight)
                .attr("height", 0)
                .on("end", function () {
                    selectedRect.transition()
                        .duration(400)
                        .attr("y", y(selectedData.count))
                        .attr("height", innerHeight - y(selectedData.count))
                        .on("end", function () {
                            selectedData.isAnimated = true;
                        });
                });
            if (legendSelected === selectedData) {
                legendSelected = null;
                legend.style("color", "black");
            } else {
                legendSelected = selectedData;
                legend.style("color", d => (d === selectedData) ? "#C70039" : "black");
            }
        }




        const legendDiv = mainDiv.append("div")
            .attr("class", "legend");

        const legendContainer = mainDiv.append("div")
            .attr("class", "legend-container");


        const legend = legendDiv.selectAll(".legend-item")
            .data(data)
            .enter().append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-right", "20px")
            .style("cursor", "pointer")
            .on("click", function (event, d) {
                toggleBar(d);
            });

        const legendTooltip = legendDiv.append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "10px")
            .style("border-radius", "5px");

        if (legendConfig.show) {
            if (legendConfig.showMore) {


                legendDiv.style("display", "grid")
                    .style("grid-template-columns", `repeat(${legendColumns}, 1fr)`)
                    .style("grid-gap", legendGap)
                    .style("justify-content", "center")
                    .style("align-items", "center")
                    .style("overflow", "hidden")
                    .style("white-space", "nowrap")

                legend.style("display", (d, i) => (i < legendLimit ? "flex" : "none"));

                const showMoreButton = legendContainer.append("button")
                    .attr("class", "show-more-button")
                    .style("margin-top", "20px")
                    .text("Show More")
                    .style("background-color", "#3498db")
                    .style("color", "white")
                    .style("padding", "8px")
                    .style("border", "none")
                    .style("border-radius", "5px")
                    .style("cursor", "pointer")
                    .style("margin-top", "15px")
                    .style("transition", "background-color 0.3s")
                    .on("click", function () {
                        isLegendExpanded = !isLegendExpanded;

                        legend.style("display", (d, i) => (isLegendExpanded || i < legendLimit ? "flex" : "none"));

                        showMoreButton.text(isLegendExpanded ? "Show Less" : "Show More");
                    })
                    .on("mouseover", function () {
                        d3.select(this).style("background-color", "#2980b9");
                    })
                    .on("mouseout", function () {
                        d3.select(this).style("background-color", "#3498db");
                    });
            } else {
                legendDiv.style("display", "grid")
                    .style("grid-template-columns", `repeat(${legendColumns}, 1fr)`)
                    .style("grid-gap", legendGap)
                    .style("justify-content", "center")
                    .style("align-items", "center")
                    .style("overflow", "hidden")
                    .style("white-space", "nowrap");
            }
        } else {
            legendDiv.style("display", "none");
        }



        legend.append("div")
            .attr("class", "legend-color")
            .style("width", "15px")
            .style("height", "15px")
            .style("border-radius", "50%")
            .style("margin-right", "5px")
            .style("background-color", d => d.color);


        legend.append("div")
            .attr("class", "legend-text")
            .text(d => d.name)
            .style("overflow", "hidden")
            .style("max-width", "80px")
            .style("white-space", "nowrap")
            .style("text-overflow", "ellipsis")
            .on("mouseover", function (event, d) {
                legendTooltip.html(d.name)
                    .style("visibility", "visible");
            })
            .on("mousemove", function (event) {
                legendTooltip.style("top", (event.pageY - 28) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                legendTooltip.style("visibility", "hidden");
            });
    } else {
        legendDiv.style("display", "none");
    }
}
