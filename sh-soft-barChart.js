
const mySvg = d3.select("#my-svg");


const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

const g = svg.append("g")
    .attr("transform", `translate(${margin.right},${margin.top})`);

const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .rangeRound([0, innerWidth])
    .paddingInner(0.9)
    .paddingOuter(0.4);

const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([innerHeight, 0]);


g.append("g")
    .attr("class", "gridlines-x")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(fc.axisOrdinalBottom(x)
        .ticks(data.length)
        .tickSize(-innerHeight)
        .tickFormat("")
    )
    .selectAll("line")
    .style("stroke", "#ccc")


g.selectAll("text").remove();


g.append("g")
    .attr("class", "gridlines-y")
    .attr("transform", `translate(${innerWidth}, 0)`)
    .call(d3.axisRight(y)
        .ticks(data.length)
        .tickSize(-innerWidth)
        .tickPadding(15)
    )
    .selectAll("line")
    .style("font-size", "15px")
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
        const tooltip = d3.select("#tooltip");
        tooltip.select(".name").text(`Name: ${d.name}`);
        tooltip.select(".count").text(`Count: ${d.count}`);
        tooltip.select(".color").style("background-color", d.color);
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .style("display", "block");
    })
    .on("mouseout", function () {
        const tooltip = d3.select("#tooltip");
        tooltip.style("display", "none");
    })
    .transition()
    .duration(1000)
    .attr("y", d => y(d.count))
    .attr("height", d => innerHeight - y(d.count))
    .attr("class", "bar");



let selectedColumn = [];

function updateBars() {
    g.selectAll("rect")
        .transition()
        .duration(400)
        .attr("y", d => selectedColumn.length === 0 || !selectedColumn.includes(d.name) ? y(d.count) : innerHeight)
        .attr("height", d => selectedColumn.length === 0 || !selectedColumn.includes(d.name) ? innerHeight - y(d.count) : 0);
}


function updateLegend(data) {
    const legendItems = d3.select("#legend-container")
        .selectAll(".legend-item")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .style("cursor", "pointer")
        .on("click", function (event, d) {
            const isSelected = selectedColumn.includes(d.name)
            if (!isSelected) {
                selectedColumn.push(d.name)
            } else {
                selectedColumn = selectedColumn.filter(column => column !== d.name)
            }
            d3.select(this).select(".legend-text").classed("selected-text", !isSelected);

            updateBars();
        });

    legendItems.append("div")
        .attr("class", "legend-color")
        .style("background-color", d => d.color);


    legendItems.append("div")
        .attr("class", "legend-text")
        .text(d => d.name)
        .on("mouseover", function (event, d) {
            d3.select(this).append("div")
                .attr("class", "legend-tooltip")
                .html(d.name)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            // Hide tooltip on mouseout
            d3.select(".legend-tooltip").remove();
        });

}

updateLegend(data);
