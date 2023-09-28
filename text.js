// Dữ liệu cho biểu đồ cột
const data = [
    { name: "채용공고", count: 6500, color: "#613dd5" },
    { name: "주말농장", count: 5000, color: "#7fdbe7" },
    { name: "선별진료", count: 7500, color: "#98b0fc" },
    { name: "보건소홈", count: 1500, color: "#67b8ec" },
];

// Kích thước của SVG và biểu đồ
const width = 500;
const height = 300;
const margin = { top: 20, right: 40, bottom: 40, left: 40 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const legendWidth = 500;
const legendHeight = 100;
const itemsPerRow = 2;
let selectedColumn = null; // Cột đang được chọn

// Tạo phần tử SVG
const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

const g = svg.append("g")
    .attr("transform", `translate(${margin.right},${margin.top})`);

// Định nghĩa scale cho trục x
const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .rangeRound([0, innerWidth])
    .paddingInner(0.9)
    .paddingOuter(0.4);

// Định nghĩa scale cho trục y
const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([innerHeight, 0]);

// Vẽ lưới trục x
g.append("g")
    .attr("class", "gridlines-x")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(fc.axisOrdinalBottom(x)
        .ticks(data.length)
        .tickSize(-innerHeight)
        .tickFormat("")
    )
    .selectAll("line")
    .style("stroke", "#ccc");

g.selectAll("text").remove(); // Xóa các văn bản trên trục x

// Vẽ lưới trục y
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

// Vẽ các cột
g.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("x", d => x(d.name))
    .attr("y", innerHeight)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", d => d.color)
    .on("mouseover", function (event, d) {
        // Hiển thị tooltip khi di chuột vào
        const tooltip = d3.select("#tooltip");
        tooltip.select(".name").text(`Name: ${d.name}`);
        tooltip.select(".count").text(`Count: ${d.count}`);
        tooltip.select(".color").style("background-color", d.color);
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .style("display", "block");
    })
    .on("mouseout", function () {
        // Ẩn tooltip khi di chuột ra khỏi cột
        const tooltip = d3.select("#tooltip");
        tooltip.style("display", "none");
    })
    .transition()
    .duration(1000)
    .attr("y", d => y(d.count))
    .attr("height", d => innerHeight - y(d.count))
    .attr("class", "bar"); // Đặt class cho các cột

// Hàm cập nhật cột khi có thay đổi
function updateBars() {
    g.selectAll("rect")
        .transition()
        .duration(500)
        .attr("y", d => (selectedColumn === null || selectedColumn === d.name ? y(d.count) : innerHeight))
        .attr("height", d => (selectedColumn === null || selectedColumn === d.name ? innerHeight - y(d.count) : 0))
        .attr("class", d => "bar" + (selectedColumn === d.name ? " selected" : ""));
}

// Hàm cập nhật hình chú thích
function updateLegend(data) {
    const legendItems = d3.select("#legend-container")
        .selectAll(".legend-item")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .style("cursor", "pointer")
        .on("click", function (event, d) {
            // Xóa class selected-text từ tất cả các .legend-text
            d3.selectAll(".legend-text").classed("selected-text", false);

            if (selectedColumn === d.name) {
                selectedColumn = null;
            } else {
                selectedColumn = d.name;

                // Thêm class selected-text cho .legend-text của legend được click
                d3.select(this).select(".legend-text").classed("selected-text", true);
            }

            updateBars();
        });

    // Thêm màu nền cho hình chú thích
    legendItems.append("div")
        .attr("class", "legend-color")
        .style("background-color", d => d.color);

    // Thêm văn bản cho hình chú thích
    legendItems.append("div")
        .attr("class", "legend-text")
        .text(d => d.name);
}

// Cập nhật hình chú thích ban đầu
updateLegend(data);

