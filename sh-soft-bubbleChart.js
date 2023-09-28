const svg = d3.select("#my-svg");

const data = [
    { name: "분", value: 60, color: "#67b8ec" },
    { name: "분", value: 80, color: "#7fdbe7" },
    { name: "분", value: 45, color: "#98b0fc" },
    { name: "분", value: 30, color: "#613dd5" },
];

const width = +svg.attr("width");
const height = +svg.attr("height");

const simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.value - 8))
    .on('tick', ticked);

const circles = svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("r", d => d.value)
    .style("fill", d => d.color)
    .classed("bubble", true)
    .attr("filter", "url(#inner-shadow)")
    .text(d => `${d.value}${d.name}`)
    .on("mouseenter", handleMouseEnter)
    .on("mousemove", handleMouseMove)
    .on("mouseleave", handleMouseLeave);


const labels = svg.selectAll("text")
    .data(data)
    .enter().append("text")
    .attr("dy", ".3em")
    .style("font-size", "14px")
    .attr("fill", "#ffffff")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text(d => `${d.value}${d.name}`)
    .on("mouseenter", handleMouseEnter)
    .on("mousemove", handleMouseMove)
    .on("mouseleave", handleMouseLeave);


function handleMouseEnter(event, d) {
    const tooltip = d3.select("#tooltip");

    tooltip
        .text(`${d.value} ${d.name}`)
        .transition()
        .duration(200)
        .style("visibility", "visible")

    d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", d.value + 5);
}

function handleMouseMove(event) {
    const tooltip = d3.select("#tooltip");

    tooltip.style("left", `${event.pageX}px`)
        .style("top", `${event.pageY - 30}px`);
}

function handleMouseLeave(event, d) {
    const tooltip = d3.select("#tooltip");
    tooltip.transition()
        .duration(500)
        .on("end", () => {
            tooltip.style("visibility", "hidden");
        });
    d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", d.value);
}


function ticked() {
    circles
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}
