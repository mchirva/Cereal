<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
// Optionally reference your vis JS file here, or define in a script tag
//<script type="text/javascript" src="js/my-vis.js"></script> -->
d3.csv('scatterplot.csv', function (data) {
    data.forEach(function(d) { // convert strings to numbers
        d.LifeExpectancy = +d.LifeExpectancy;
        d.HealthExpPerCapita = +d.HealthExpPerCapita;
    });
    makeVis(data);
});

var makeVis = function(data) {
    // Common pattern for defining vis size and margins
    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width  = 1024 - margin.left - margin.right,
        height = 768 - margin.top - margin.bottom;

    // Add the visualization svg canvas to the vis-container <div>
    var canvas = d3.select("#vis-container").append("svg")
        .attr("width",  width  + margin.left + margin.right)
        .attr("height", height + margin.top  + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define our scales
    var colorScale = d3.scale.category10();

    var xScale = d3.scale.linear()
        .domain([10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000])
        .range([0, 91, 227, 318, 409, 545, 636, 727, 863, 954]);
        
    var yScale = d3.scale.linear()
        .domain([ 40,
                d3.max(data, function(d) { return d.LifeExpectancy; }) + 1 ])
        .range([height, 0]); // flip order because y-axis origin is upper LEFT

    // Define our axes
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues([10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000])
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    // Add x-axis to the canvas
    canvas.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")") // move axis to the bottom of the canvas
        .call(xAxis)
    .append("text")
        .attr("class", "label")
        .attr("x", width) // x-offset from the xAxis, move label all the way to the right
        .attr("y", -6)    // y-offset from the xAxis, moves text UPWARD!
        .style("text-anchor", "end") // right-justify text
        .text("Avg. Health Exp/Capita (in US $)");

    // Add y-axis to the canvas
    canvas.append("g")
        .attr("class", "y axis") // .orient('left') took care of axis positioning for us
        .call(yAxis)
    .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)") // although axis is rotated, text is not
        .attr("y", 15) // y-offset from yAxis, moves text to the RIGHT because it's rotated, and positive y is DOWN
        .style("text-anchor", "end")
        .text("Avg. Life Expectancy (Years)");

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    var tooltip = d3.select("#vis-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip mouseover event handler
    var tipMouseover = function(d) {
        var color = colorScale(d.Region);
        var html  = "<div class='round'><b>Country:</b> " + d.Country + "<br/>" +
                    "<b>Region:</b> " + d.Region + "<br/>" +
                    "<b>Avg. Life Expectancy (years): </b>" + d.LifeExpectancy + "<br/>" + 
                    "<b>Avg. Health Exp/Capita (USD): </b>" + d.HealthExpPerCapita + "</div>";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
        .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!

    };
    // tooltip mouseout event handler
    var tipMouseout = function(d) {
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
    };

    // Add data points!
    canvas.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.5) // radius size, could map to another data dimension
    .attr("cx", function(d) { return xScale( d.HealthExpPerCapita ); })     // x position
    .attr("cy", function(d) { return yScale( d.LifeExpectancy ); })  // y position
    .style("stroke", function(d) { return colorScale(d.Region); })    // set the line colour
    .style("fill", "white")
    .on("mouseover", tipMouseover)
    .on("mouseout", tipMouseout);
    
    var legend = canvas.selectAll('.dot')
    .data(d3.map(data, function(d) {return d.Region}))
    .enter()
    .append('g')
    .attr('class', 'legend');

    legend.append('rect')
    .attr('x', width - 20)
    .attr('y', function(d, i) {
        return i * 20;
    })
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d) {
        return color(d.Region);
    });

    legend.append('text')
    .attr('x', width - 8)
    .attr('y', function(d, i) {
        return (i * 20) + 9;
    })
};
