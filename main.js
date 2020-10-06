"use strict";

// import required modules
var d3 = require('d3');
var textwrap = require('d3-textwrap').textwrap;
var d3tip = require('d3-tip');
var colorLegend = require('d3-color-legend').legend;
var geoPolyhedralButterfly = require('d3-geo-polygon').geoPolyhedralButterfly;
d3.geoPolyhedralButterfly = geoPolyhedralButterfly;
d3.textwrap = textwrap;
d3.tip = d3tip;
d3.legend = colorLegend;
var dataprep = require('./data_prep');

// SECTION: prepare imported functions
var wrap = d3.textwrap().bounds({height: 175, width: 175});

const tip = d3.tip()
  .attr('class', "d3-tip")
  .style("color", "white")
  .style("padding", "6px")
  .offset([-10, 0])
  .html(function(d) {return `<div style='float: right'>${d.place}</div>`});

const zoom = d3.zoom()
    .translateExtent([[17, 100], [883, 580]])
    .extent([[17, 100], [883, 580]])
    .scaleExtent([1, 8])
    .on("zoom", function(event, d) {
        const { transform } = event;
        map.attr('transform', transform);
        map.selectAll("circle")
            .attr('r', d => {
              let radiusval = 4;
              buttonvalue != 1 ? radiusval=d.radius: radiusval=4;
              zoomscale = transform.k**.7;
              return radiusval / zoomscale;
            });
        }
    );

// set up dimensions for each svg
var height = 700;
var width = 900;

var cHeight = 700;
var cWidth = 600;
const cMargin = ({top: 150, right: 50, bottom: 200, left: 50})

// set up chart state
let rendSwitch = 0;

// set up map assets
const geooutline = ({type: "Sphere"});
const projection = d3.geoPolyhedralButterfly()
    .translate([width / 2, (height / 2)-20])
    .precision(.1);

const path = d3.geoPath()
    .projection(projection);

const radius = d3.scaleSqrt()
    .domain([0, d3.max(data, city => city.total_no)])
    .range([1, width / 50]);

// SECTION: prepare imported data
  // country sales flows
let countryflowobjs = new Map();
cfos.map(country => {countryflowobjs.set(country.country, country.total_no)});

const countryCapCoords = new Array();
d3.csv("countrycapitals.csv", function(data){
      countryCapCoords.push([data.Country, [data.Long, data.Lat]]);
});

  // genres
data.map((d) => { d.radius = radius(d.total_no); });


// SECTION: create svgs
const svg2 = d3.select("div#container")
    .append("svg")
    .attr("viewBox", `0 0 ${cWidth} ${cHeight}`)
    .classed("svg-content", true)
    .style("width", "40%")
    .style("height", "100%")
    .attr("preserveAspectRatio", "xMinYMin meet");

const svg = d3.select("div#container")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .classed("svg-content", true)
      .style("width", "60%")
      .style("height", "100%")
      .attr("preserveAspectRatio", "xMinYMin meet");

// SECTION: setting up map...
const map = svg.append("g")
    .attr("id", "map");

map.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "black");

map.append("path")
    .datum(topojson.feature(world50, world50.objects.land))
    .attr("fill", "white")
    .attr("d", path);

var customshape = `M0,700L233.92640648593908,329.99974719027483L170.64010748464213,293.46137520222373L125.88990164843437,267.6248420400352L81.1396984054818,241.78830015142614L17.853396810929667,205.2499368897957L81.13969840548174,168.71157362816518L125.88990164843432,142.87503173955602L170.64010748464204,117.03849857736752L233.92640648593894,80.50012658931637L233.92669840546478,80.50012658931635L297.21299740676176,117.03849857736746L341.9632032429694,142.87503173955594L386.71340648592206,168.71157362816504L449.9997080804742,205.2499368897955L450.0002919195258,205.2499368897955L513.2865935140779,168.71157362816507L558.0367967570305,142.875031739556L602.7870025932383,117.03849857736748L666.0733015945352,80.50012658931644L666.073593514061,80.50012658931638L729.359892515358,117.03849857736753L774.1100983515656,142.87503173955605L818.8603015945182,168.71157362816524L882.1466031890702,205.24993688979578L818.8603015945182,241.78830015142626L774.1100983515655,267.62484204003533L729.3598925153578,293.46137520222385L666.0735935140608,329.9997471902749L666.0733015945351,330.0002528097252L666.0732927406057,403.0769814503717L666.0733015945351,454.75006311020445L666.073301594535,506.4231468874228L666.073301594535,579.4998734106837L602.786999999983,542.9615101490532L558.0367967570304,517.1249682604441L513.2865997747522,491.2884197627998L450.00029191952575,454.7500631102044L449.9997080804742,454.75006311020445L386.7134002252477,491.2884197627998L341.9632032429695,517.1249682604441L297.2130000000169,542.9615101490532L233.92669840546483,579.4998734106837L233.92669840546483,506.4231468874227L233.9266984054648,454.75006311020445L233.92670725939428,403.0769814503717L233.92669840546478,330.00025280972517L233.9264064859390,329.9997471902748L0.000001,700L900,700L900,0L0,0L0,700Z`

svg.append("path")
    .attr("d", customshape)
    .attr("fill", "white");

svg.append("path")
    .attr("id", "butterflyborder")
    .datum(geooutline)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke-width", 1)
    .attr("stroke", "black");

svg.append('text')
    .text("Relative")
    .attr("id", "es")
    .attr("transform", `rotate(-30)`)
    .attr('class', 'displayopt')
    .attr('fill', 'red')
    .attr('x', 20)
    .attr('y', 180)
    .on('click', function() {
        buttonvalue = 1;
        d3.select("#cs")
          .attr("fill", "black");
        cityCircles.call(drawCircles, 1);
        if(rendSwitch == 1) {updateBars(placeHold, relHold)};
        d3.select(this)
          .attr('fill', 'red');
      });

svg.append('text')
      .text("Absolute")
      .attr("id", "cs")
      .attr('class', 'displayopt')
      .attr("transform", `rotate(30)`)
      .attr('x', 350)
      .attr('y', -55)
      .on('click', function() {
        buttonvalue = 2;
        if(rendSwitch == 1) {updateBars(placeHold, absHold)};
        d3.select("#es")
        .attr("fill", "black");
        d3.select(this)
        .attr('fill', 'red');
        cityCircles.call(drawCircles, 2);
      });

svg.append('text')
      .text("Sales Flows")
      .attr("id", "cv")
      .attr('class', 'displayopt')
      .attr("transform", `rotate(-30)`)
      .attr('x', 415)
      .attr('y', 398)
      .on('click', function() {
        buttonvalue = 2;
        if(rendSwitch == 1) {updateBars(placeHold, absHold)};
        d3.select("#es, #cs")
        .attr("fill", "black");
        d3.select(this)
        .attr('fill', 'red');
        cityCircles.call(drawCircles, 2);
      });

svg.append('text')
    .text("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and")
    .attr('x', 670)
    .attr('y', 345)
    .call(wrap);

let buttonvalue = 1;

let zoomscale = 1;
function drawCircles(selection, n) {
  let circleR = 5;
  if (n != "1") {
    buttonvalue = 2;
    selectedShapes.each(function() {
      d3.select(this)
      .attr('r', null)
    });
    circleR = selectedShapes.each(function() {
      d3.select(this)
          .attr("r", d => radius(d.total_no) / zoomscale);
    });
  }
  else {
    buttonvalue = 1;
    circleR = 5;
    selectedShapes.each(function() {
      d3.select(this)
      .attr('r', null)
    });
    selectedShapes.each(function() {
      d3.select(this)
        .attr("r", 4 / zoomscale);
    })
  };
}

const cityCircles = map.append("g");

const selectedShapes = cityCircles.selectAll("circles")
  .attr("id", "cityCircles")
  .data(data)
  //NOTE: Circle characteristics are set here
  .join("circle")
    .attr("transform", (d) => `translate(${projection(d.coords)})`)
    .attr("fill", "green")
    .attr('opacity', .7)
    //NOTE: mouseover behavior determined here
    .on('mouseenter', function(event, d) {
        // show tooltip on mouse enter
        tip.show(d, this);
        d3.select(this).attr('fill', "red");
    })
    .on('click', function(event, d) {
        let bars = null;
        if(rendSwitch == 0) {rendSwitch = 1};
            bars = d.rel_bars.slice(0,24);
            absHold = d.abs_bars.slice(0,24);
            relHold = d.rel_bars.slice(0,24);
            placeHold = d.place;
            d3.selectAll(".circSelect").attr("fill", "green").attr("opacity", .7);
            d3.selectAll("circle").classed('circSelect', false);
            d3.select(this).classed("circSelect", true).attr("fill", "red")
            .attr("opacity", 1);
      if(buttonvalue != 1) {bars = d.abs_bars.slice(0,24)};
      updateBars(placeHold, bars); //Updates the bar chart
    })
    .on('mouseout', function(event, d) {
      // hide tooltip on mouse out
      tip.hide();
      if($(this).attr("class") != "circSelect") {d3.select(this).attr('fill', "green")}
    });

// SECTION: Load circle toggle

d3.select(window).on("load", function() {
    cityCircles.call(drawCircles, buttonvalue);
});

// SECTION: setting up chart...
const chart = svg2.append("g");

chart.append("g")
    .attr("stroke-opacity", .9)
    .attr("id", "chartlabel")
    .append('text')
      .text('Cities and Their Genres')
      .style("font-family", "orion")
      .attr('class', 'title')
      .classed("axis", true)
      .attr("font-size", "30px")
      .attr('x', cWidth / 2 )
      .attr('y', cHeight / 10 )
      .attr('text-anchor', 'middle');

chart.append("g")
    .attr("id", "y_axis");

let nullset = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

let absHold = nullset;
let relHold = nullset;
let placeHold = "";

let xScale = d3.scaleBand()
    .domain(d3.range(nullset.length))
    .rangeRound([cMargin.left, cWidth - cMargin.right])
    .padding(0.1);

let yScale = d3.scaleLinear()
    .domain([0, d3.max(nullset)]).nice()
    .range([1.75 * cMargin.top, cMargin.bottom]);

chart.append("g")
    .attr("id", "x_axis");

chart.append("g")
    .attr("id", "bars")
    .selectAll("rect")
    .data(nullset)
    .enter()
    .append("rect")
      .attr("x", (data, i) => xScale(i))
      .attr("y", data => yScale(data))
      .attr("rx", 1)
      .attr("fill-opacity", 0.6);

function updateBars(place, bars) {
    let searchval = "relative";
    if(buttonvalue != 1) {searchval = "count"};

    let scene = new Map();
    bars.map(value => {scene.set(value.genre, value[searchval])});
    let scenemax = bars[0][searchval];
    var t = d3.transition()
        .duration(600)
        .ease(d3.easePolyInOut.exponent(4));

    let yScale = d3.scaleLinear()
        .domain([scenemax, 0]).nice()
        .range([cHeight - cMargin.bottom, cMargin.top]);

    let yAxis = g => g
        .attr("transform", `translate(${cMargin.left},0)`)
        .transition(t)
        .call(d3.axisLeft(yScale));

    let xScale = d3.scaleBand()
      .domain([...scene.keys()])
      .range([cMargin.left, cWidth - cMargin.right])
      .padding(0.1);

    let xAxis = function(g) {
      g.call(d3.axisTop(xScale)
          .tickSizeOuter(0));
    }

    chart
        .select("g#x_axis")
        .attr("class", "axis")
        .attr("transform", `translate(0,${cMargin.top})`)
        .transition(t).duration(500)
        .call(xAxis)
        .selectAll("text")
            .style("font-family", "cinetype")
            .style("text-anchor", "start")
            .attr("transform", `rotate(-40)`);

    chart
        .select("g#y_axis")
        .attr("class", "axis")
        .call(yAxis);

    chart
        .select("g#chartlabel")
        .select("text")
        .text(place);

    let scenearray = [];

    scene.forEach((v, k) => scenearray.push({x:[k], y:v}));

    chart.selectAll("rect")
        .data(scenearray)
        .transition() // <---- Here is the transition
        .duration(500) // .5 seconds
        .attr("fill", "red") //(d) => genreColors(d.x)
        .attr("x", data => xScale(data.x))
        .attr("y", cMargin.top)
        .attr("width", xScale.bandwidth())
        .attr("height", data => yScale(data.y) - yScale(0));
}

// SECTION: Styling the svg
d3.selectAll(".displayopt")
    .style("font-family", "orion")
    .style("text-anchor", "middle")
    .on('mouseover', function(d, i) {
        d3.select(this)
          .style('font-weight', 'bold');
      })

    .on('mouseout', function(d, i) {
        d3.select(this)
          .style('font-weight', '');
      });

// SECTION: call additional functions
let zoomed = svg.call(zoom);

map.call(tip);






// const tip2 = d3.tip()
//     .attr('class', "d3-tip")
//     .style("color", "white")
//     .style("padding", "6px")
//     // .offset([-10, 0])
//     .html(d => `<span class='details'>${d.properties.name}<br></span>`);

const svg3 = d3.select("div#container")
    .append("svg")
    .style("width", `${width}px`) //need "px" after the number for Firefox
    .style("height", `${height}px`);

var color = d3.scaleSequentialLog()
    .domain(d3.extent(Array.from(countryflowobjs.values())))
    .interpolator(d3.interpolateYlGnBu)
    .unknown("#ccc")

const flowmap = svg3.append("g")
    .attr("id", "flowmap");

flowmap.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "black");

flowmap.append("path")
    .datum(topojson.feature(countries50, countries50.objects.land))
    .attr("fill", "white")
    .attr("d", path);

svg3.append("path")
    .attr("d", customshape)
    .attr("fill", "white");

svg3.append("path")
    .attr("id", "butterflyborder")
    .datum(geooutline)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke-width", 1)
    .attr("stroke", "black");


svg3.append('text')
    .text("Click on a country to see its domestic and international Bandcamp sales.")
    .attr("id", "li")
    .attr('x', 670)
    .attr('y', 345);
    // .call(wrap);

d3.select('#li').call(wrap);

const defs = svg3.append("defs");

defs.append("path")
    .attr("id", "outline")
    .attr("d", path(outline));

// defs.append("clipPath")
//     .attr("id", "clip")
//   .append("use")
//     .attr("xlink:href", new URL("#outline", location));

const g = flowmap.append("g")
    .attr("clip-path", `url(${new URL("#clip", location)})`);

g.append("use")
    .attr("xlink:href", new URL("#outline", location))
    .attr("fill", "white");

var countriesGroup = g.append("g")
    .selectAll("path")
    .data(countries.features)
    .join("path")
        .attr("fill", d => color(countryflowobjs.get(d.properties.name)))
        .attr("d", path)
        .attr("class", "countrypath")
        .on('mouseenter', function(event, d) {
            var target = d3.select(`#${d.properties.name}`)
                .node();
            // show tooltip on mouse enter; use coords from countryCapCoords.get(d.properties.name)
            // to
            //    .attr("transform", (d) => `translate(${projection(d.coords)})`)
            // tip2.show(d, this);
            d3.select(this).attr("stroke-width", .25).attr('stroke', "white");
        })
        .on('click', function(event, d) {

            let cfosSelect = cfos.find((element) => element.country === d.properties.name)
            console.log("cfosSelect", cfosSelect)
            let toCountries = new Map();
            cfosSelect.to_countries.sort(function (a, b) {
              return b.count - a.count;
            }).map(country => {toCountries.set(country.to_country, country.count)});

            // Show links to other countries, pulled from the "cfos" to_countries section.
            g.selectAll("path").each(function() {
                  d3.select(this)
                  .attr("fill", d => color(toCountries.get(d.properties.name)))
            });

            // Highlight only the selected country
            d3.select(this)
              .attr('fill', 'red');

            svg3
                .selectAll("text")
                .remove();

            svg3.selectAll('foreignObject').remove();

            svg3.append('text')
                .attr("id", "li")
                .attr('x', 670)
                .attr('y', 345)
                .text(`${d.properties.name}:`);

            let dTextg = svg3.append("g");
            let dtgSpace = 380;
            toCountries.forEach(function(value, key) {
              console.log(key, value)
              dTextg.append("text")
                  .attr("x", 670)
                  .attr("y", dtgSpace)
                  .text(key + " - " + value);

              dtgSpace += 20;
            })


            // lc = d3.line()
            //     .curve(d3[curve])
            //     .x(d => walkX(d.step))
            //     .y(d => walkY(d.value))

            // svg`<svg width=${width} height=200>
            //   <path d="${lc(walk)}" stroke="black" fill="none" />
            //
            // ${walk.map(
            //   d =>
            //     svg`<circle r=2 stroke=black fill=white stroke-width=0.5
            //       cx="${walkX(d.step)}" cy="${walkY(d.value)}" />`
            // )}
            // </svg>`

          })
        .on('mouseout', function(event, d) {
          // hide tooltip on mouse out
          d3.select(this).attr('stroke-width', "").attr('stroke', "");
          // tip2.hide();
        })
    .append("title")
      .text(d => `${d.properties.name}
${countryflowobjs.has(d.properties.name) ? countryflowobjs.get(d.properties.name) : "N/A"}`);

flowmap.selectAll("rect")
    .on('click', function() {
        // Highlight only the selected country
        g.selectAll("path").each(function() {
              d3.select(this)
              .attr("fill", d => color(countryflowobjs.get(d.properties.name)))
        });
      })

// g.append("path")
//     .datum(topojson.mesh(countries50, countries50.objects.countries, (a, b) => a !== b))
//     .attr("fill", "none")
//     .attr("stroke", "white")
//     .attr("stroke-linejoin", "round")
//     .attr("d", path);

svg3.append("use")
    .attr("xlink:href", new URL("#outline", location))
    .attr("fill", "none")
    .attr("stroke", "black");

// svg3.call(tip2);

const zoom2 = d3.zoom()
    .translateExtent([[17, 100], [883, 580]])
    .extent([[17, 100], [883, 580]])
    .scaleExtent([1, 8])
    .on("zoom", function(event, d) {
        const { transform } = event;
        flowmap.attr('transform', transform);
        }
    );

let zoomed2 = svg3.call(zoom2)

let thing = countryCapCoords[0];
console.log("countryCapCoords", countryCapCoords)
console.log("countryCapCoords[1][0]", thing)
