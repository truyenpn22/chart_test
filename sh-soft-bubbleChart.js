const svg = d3.select("#my-svg");

const width = +svg.attr("width");
const height = +svg.attr("height");

const simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(110))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.value - 8))
    .on('tick', ticked);

const circles = svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("r", d => d.value)
    .style("fill", d => d.color)
    // .classed("bubble", true)
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
    .text(d => `${d.value}분`)
    .on("mouseenter", handleMouseEnter)
    .on("mousemove", handleMouseMove)
    .on("mouseleave", handleMouseLeave);


function handleMouseEnter(event, d) {
    const tooltip = d3.select("#tooltip");

    tooltip.select(".name").text(`Name: ${d.name}`);
    tooltip.select(".count").text(`Time: ${d.value}`);
    tooltip.select(".color").style("background-color", d.color);
    tooltip.style("visibility", "visible");  // Sử dụng visibility thay vì display

    d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", d.value + 5);
}

function handleMouseMove(event) {
    const tooltip = d3.select("#tooltip");

    tooltip.style("left", `${event.pageX + 10}px`)  // Thay đổi cách tính toán vị trí
        .style("top", `${event.pageY - 10}px`);
}

function handleMouseLeave(event, d) {
    const tooltip = d3.select("#tooltip");
    tooltip.style("visibility", "hidden");

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
