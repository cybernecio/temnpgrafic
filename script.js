fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(response => response.json())
  .then(data => {
    const baseTemperature = data.baseTemperature;
    const monthlyVariance = data.monthlyVariance;

    const width = 1200;
    const height = 500;
    const padding = 60;

    const svg = d3.select("#heatmap")
                  .attr("width", width)
                  .attr("height", height);

    const xScale = d3.scaleBand()
                     .domain(monthlyVariance.map(d => d.year))
                     .range([padding, width - padding]);

    const yScale = d3.scaleBand()
                     .domain(monthlyVariance.map(d => d.month))
                     .range([padding, height - padding]);

// Después de la creación de las escalas xScale y yScale
const xAxis = svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(d3.axisBottom(xScale));

const yAxis = svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B")));


    const colorScale = d3.scaleLinear()
                         .domain(d3.extent(monthlyVariance, d => baseTemperature + d.variance))
                         .range(["#2c7bb6", "#d7191c"]);

svg.selectAll(".cell")
       .data(monthlyVariance)
       .enter()
       .append("rect")
       .attr("class", "cell")
       .attr("x", d => xScale(d.year))
       .attr("y", d => yScale(d.month)) // Asegura que yScale refleje los meses directamente
       .attr("width", xScale.bandwidth())
       .attr("height", yScale.bandwidth())
       .attr("data-year", d => d.year)
       .attr("data-month", d => d.month - 1)
       .attr("data-temp", d => baseTemperature + d.variance)
       .attr("fill", d => colorScale(baseTemperature + d.variance))
       .on("mouseover", (event, d) => {
         const tooltip = document.getElementById("tooltip");
         tooltip.classList.remove("hidden");
         tooltip.style.left = event.pageX + 10 + "px";
         tooltip.style.top = event.pageY - 10 + "px";
         document.getElementById("year").textContent = d.year;
         document.getElementById("month").textContent = d3.timeFormat("%B")(new Date(0, d.month - 1));
         document.getElementById("temperature").textContent = (baseTemperature + d.variance).toFixed(2) + "℃";
         tooltip.setAttribute("data-year", d.year);
       })
       .on("mouseout", () => {
         const tooltip = document.getElementById("tooltip");
         tooltip.classList.add("hidden");
       });

    const legendWidth = 200;
    const legendHeight = 20;

    const legendSvg = d3.select("#legend")
                        .attr("width", legendWidth)
                        .attr("height", legendHeight);

    const legendScale = d3.scaleLinear()
                          .domain(d3.extent(monthlyVariance, d => baseTemperature + d.variance))
                          .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
                         .ticks(4);

    legendSvg.append("g")
             .attr("transform", `translate(0, ${legendHeight / 2})`)
             .call(legendAxis)
             .selectAll("rect")
             .data(legendScale.ticks(4).map(d => colorScale(d)))
             .enter()
             .append("rect")
             .attr("x", (d, i) => i * (legendWidth / 4))
             .attr("y", 0)
             .attr("width", legendWidth / 4)
             .attr("height", legendHeight / 2)
             .attr("fill", d => d);
  });
