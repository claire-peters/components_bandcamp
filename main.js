"use strict";

// import required modules
var css = require('./static/css/style.css');
var topojson = require("topojson-client");
var d3 = require('d3');
var textwrap = require('d3-textwrap').textwrap;
// var d3tip = require('d3-tip');
var geoPolyhedralButterfly = require('d3-geo-polygon').geoPolyhedralButterfly;
d3.geoPolyhedralButterfly = geoPolyhedralButterfly;
d3.textwrap = textwrap;

// d3.tip = d3tip;
const font = "cinetype";

const network_data = require("./data/network_graph.json");
const world50 = require("./data/world50.json");
const genreAliases = require("./data/ng_ids.json")
const countries = topojson.feature(world50, world50.objects.land);

// SECTION: shadow DOM and CSS imports
let root = document.querySelector("#map-container");
let shadow = root.attachShadow({ mode: "closed" });
let sourceDiv = document.createElement("div");
sourceDiv.setAttribute("id", "bandcamp-map");
shadow.appendChild(sourceDiv);

// dump CSS as a style tag inside the shadow DOM
const style = document.createElement("style");
style.innerHTML = css;
shadow.appendChild(style);

// SECTION: prepare imported functions

// const tip = d3.tip()
//     .attr('class', "d3-tip")
//     .style("color", "white")
//     .style("padding", "6px")
//     .offset([-15, 0])
//     .html(function(d) {return `<div style='float: right'>${d}</div>`});

let newTip = d3.select(sourceDiv).append("div")
  .attr("class", "newtips")
  .style("opacity", 0);

const zoom = d3.zoom()
    .translateExtent([[17, 100], [883, 580]])
    .extent([[17, 100], [883, 580]])
    .scaleExtent([1, 40])
      .on("zoom", function(event) {
        const { transform } = event;
        map.attr('transform', transform);
        let zoomscale = transform.k**.7;
          map.selectAll("circle")
          .attr('r', function() {
            let radiusval = 4;
            return radiusval / zoomscale;
          });
        }
    );

// set up dimensions for each svg
var height = 700
var width = 1400;

// set up map assets
const geooutline = ({type: "Sphere"});
const projection = d3.geoPolyhedralButterfly()
    .translate([width / 2, (height / 2)-20])
    .precision(.1);

const path = d3.geoPath().projection(projection);

const radius = d3.scaleSqrt()
    .domain([0, d3.max(network_data, city => city.city_count)])
    .range([1, width / 50]);

// SECTION: prepare imported data

//is this nodes,
network_data.map((d) => { d.radius = radius(d.c); });

// SECTION: create svgs

let mapWrap = document.createElement("div");
mapWrap.setAttribute("class", "svg-map-wrap active-map");
let vizWrap = document.createElement("div");
vizWrap.setAttribute("class", "svg-viz-wrap");

let mapSwitch = document.createElement("div");
mapSwitch.setAttribute("class", "map-switch");

mapSwitch.append(mapWrap);
mapSwitch.append(vizWrap);
sourceDiv.append(mapSwitch);

const svg = d3.select(mapWrap)
    .append("svg")
    .attr("id", "svg1")
    .attr("viewBox", `0 0 ${width-5} ${height-20}`)
    .classed("svg-map", true)
    .classed("svg-content", true)
      // .style("height", 497)
      .attr("preserveAspectRatio", "xMinYMin meet");

let nv_svg = d3.select(vizWrap)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .classed("svg-viz", true)
    .classed("svg-content", true)
      // .style("height", "100%")
      .attr("preserveAspectRatio", "xMinYMin meet");

nv_svg.append("rect")
    .attr("id", "nvbg")
    .attr("fill", "white")
    .attr("width", width)
    .attr("height", height)

let netviz = nv_svg.append('g');

let mapsvg = svg.append("g");

// SECTION: setting up map...
const map = mapsvg.append("g")
    .attr("id", "map");

map.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "black");

map.append("path")
    .datum(countries)
    .attr("id", "lp_path")
    .attr("fill", "white")
    .attr("d", path);

var customshape = `M0,700L233.92640648593908,329.99974719027483L170.64010748464213,293.46137520222373L125.88990164843437,267.6248420400352L81.1396984054818,241.78830015142614L17.853396810929667,205.2499368897957L81.13969840548174,168.71157362816518L125.88990164843432,142.87503173955602L170.64010748464204,117.03849857736752L233.92640648593894,80.50012658931637L233.92669840546478,80.50012658931635L297.21299740676176,117.03849857736746L341.9632032429694,142.87503173955594L386.71340648592206,168.71157362816504L449.9997080804742,205.2499368897955L450.0002919195258,205.2499368897955L513.2865935140779,168.71157362816507L558.0367967570305,142.875031739556L602.7870025932383,117.03849857736748L666.0733015945352,80.50012658931644L666.073593514061,80.50012658931638L729.359892515358,117.03849857736753L774.1100983515656,142.87503173955605L818.8603015945182,168.71157362816524L882.1466031890702,205.24993688979578L818.8603015945182,241.78830015142626L774.1100983515655,267.62484204003533L729.3598925153578,293.46137520222385L666.0735935140608,329.9997471902749L666.0733015945351,330.0002528097252L666.0732927406057,403.0769814503717L666.0733015945351,454.75006311020445L666.073301594535,506.4231468874228L666.073301594535,579.4998734106837L602.786999999983,542.9615101490532L558.0367967570304,517.1249682604441L513.2865997747522,491.2884197627998L450.00029191952575,454.7500631102044L449.9997080804742,454.75006311020445L386.7134002252477,491.2884197627998L341.9632032429695,517.1249682604441L297.2130000000169,542.9615101490532L233.92669840546483,579.4998734106837L233.92669840546483,506.4231468874227L233.9266984054648,454.75006311020445L233.92670725939428,403.0769814503717L233.92669840546478,330.00025280972517L233.9264064859390,329.9997471902748L0.000001,700L900,700L900,0L0,0L0,700Z`

let pathg = svg.append("g")
    .attr("transform", `translate(250,0)`);

pathg.append("path")
    .attr("d", customshape)
    .attr("fill", "white");

svg.append("rect")
    .attr("x", 1145)
    .attr("height", height)
    .attr("width", 260)
    .attr("fill", "white");

svg.append("rect")
    .attr("x", -5)
    .attr("height", height)
    .attr("width", 260)
    .attr("fill", "white");

var legend = nv_svg.append('g')
    .attr("id", "legend")
    .attr("transform", `translate(60,600)`);
var legendtext = legend.append("text")
    .attr("y", 20)
    .style("font-family", font)
    .style("font-weight", 600)
    .attr('font-size', 18);
var legendBar = legend.append('g');
// let legendTicks = legend.append('g')
//     .attr("transform", `translate(0,30)`);


let less = legend.append("text")
    .attr("id", "less")
    .attr("fill", "white")
    .attr("font-family", font)
    .attr('font-size', 14)
    .attr("x", 10)
    .attr("y", 50);

let more = legend.append("text")
    .attr("id", "more")
    .attr("fill", "black")
    .attr("font-family", font)
    .attr('font-size', 14)
    .attr("x", 150)
    .attr("y", 50);

legend.append("rect")
    .attr("x", 70)
    .attr("y", 43)
    .attr("height", 2)
    .attr("width", 55)
    .attr("fill", "white")

svg.append("path")
    .datum(geooutline)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke-width", 1)
    .attr("stroke", "black");

var wrap = d3.textwrap().bounds({height: 250, width: 160});
var wrap2 = d3.textwrap().bounds({height: 500, width: 300});

let ggg = svg.append("g");

ggg.append("text")
    .attr("x", 25)
    .attr("y", 50)
    .text("Click on a city to view its scene")
    .attr('class', "svgText")
    .call(wrap2);

ggg.select("foreignObject")
    .attr("color", "blue")
    .style("font-family", font)
    .attr('font-size', 80);

let hhh = svg.append("g");

hhh.append('text')
    .text("This map marks cities with at least 500 albums or individual tracks sold between August 19 and November 10, 2020 on Bandcamp.")
    .attr("id", "explainer")
    .attr('x', 1000)
    .attr('y', 500)
    .call(wrap);

hhh.select("foreignObject")
    .attr("color", "black")
    .style("font-family", font)
    .attr('font-size', 13);

svg.append('text')
    .attr('x', 15)
    .attr('y', 15)
    .attr("class", "mobilenote")
    .attr('font-size', 20)
    .text("Note: Viewing on a large screen is recommended");

nv_svg.append('text')
    .style("font-family", font)
    .attr('class', 'cityname')
    .attr("font-size", "30px")
    .attr('x', width / 6 )
    .attr('y', height / 10 )
    .attr('text-anchor', 'middle');

const cityCircles = map.append("g");

cityCircles.selectAll("circles")
  .attr("id", "cityCircles")
  .data(network_data)
  //NOTE: Circle characteristics are set here
  .join("circle")
    .attr("transform", (d) => `translate(${projection(d.cor)})`)
    .attr("fill", d3.rgb(3, 90, 252))
    .attr("r", 4)
    .attr('opacity', .7)
    //NOTE: mouseover behavior determined here
    .on('mouseenter', function(event, d) {
        // show tooltip on mouse enter
        // tip.show(d.ct, this);
        // console.log(event.target.ownerSVGElement.ownerSVGElement);
        // console.log(event.target);
        // let rect = event.target.ownerSVGElement.ownerSVGElement.parentElement.getBoundingClientRect();
        // console.log(rect);
        newTip.style("opacity", 1);
        newTip.html(d.ct)
            .style("left", (event.clientX) + "px")
            .style("top", (event.clientY - 10) + "px");
        d3.select(this).attr('fill', "red");
    })
    .on('click', function(event, d) {
        nv_svg.select(".cityname")
            .text(d.ct);
        cityCircles.selectAll("circle").classed('circSelect', false);
        d3.select(this).classed("circSelect", true);
        console.log("d", d);
        networkGenres(d);
        switchViews("viz");
    })
    .on('mouseout', function(d) {
        // hide tooltip on mouse out
        // tip.hide();
        newTip.style("opacity", 0);
        d3.select(this).attr('fill', d3.rgb(3, 90, 252));
    });

// SECTION: netviz code
let drag = simulation => {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}


function networkGenres(citydata) {
    let protonodes = citydata.n;
    let protolinks = citydata.l;

    console.log(citydata)
    const dlinks = [];
    protolinks.map(function(link) {
        link["ts"].map(function(target) {
            let source = link["s"];
            const lw = d3.scaleSqrt()
                .domain([0, citydata['w']])
                .range([.01, 10]);
            // if target's count is greater than 4% of the largest link in the set,
            if (target['c'] > citydata['w']*.004) {
                    // add the connection
                    var formattedLink = {};
                    let linkwidth = lw(target['c']);

                    formattedLink.source = source;
                    formattedLink.target = target["t"];
                    formattedLink.value = linkwidth;
                    dlinks.push(formattedLink);
            }
            // else {
            //   console.log(source, target)
            // }
        })
    });

  // const dlinks = protolinks.forEach((l, i) => {
  //     var index = {}
  //     l.forEach(n => {})
  // })

    let dnodes = protonodes.map(function(node) {
        const radius = d3.scaleSqrt()
            .domain([0, d3.max(protonodes, node => node.c)])
            .range([1, width / 40]);
        let noderadius = radius(node['c'])
        var formattedNode = {};
        let genre = genreAliases[node["g"]];
        formattedNode.genre = genre
        formattedNode.id = node['g'];
        formattedNode.count = node["c"];
        formattedNode.relative = node["r"];
        formattedNode.radius = noderadius;
        // formattedNode.x = Math.max((noderadius), Math.min(width - (noderadius)));
        // formattedNode.y = Math.max((noderadius), Math.min(width - (noderadius)));
        return formattedNode;
    });

    let cityLinks = dlinks.map(d => Object.create(d));
    let cityNodes = dnodes.map(d => Object.create(d));

    netviz.selectAll("g").remove();

    netviz.select("foreignObject")
        .remove();

    netviz.select("rect#nvbg")
        .on('click', fade(1));

    function composition(f, g) { return t => f(g(t)); }
    let custominterpolation = composition(d3.interpolateRgbBasis(["#4d3d95", "#3ab1b2", "#fcff00"]), t=>t**.8) //rgb(255, 255, 77)
    let statusColor = d3.scaleSequential(
      // [d3.min(cityNodes, d => d.relative), d3.max(cityNodes, d => d.relative)], custominterpolation
      [0, d3.max(cityNodes, d => d.relative)], custominterpolation
    );

    function drawScale(measure, interpolator) {
        var barDefs = legendBar.append('defs');

        var mainGradient = barDefs.append('linearGradient')
            .attr('id', 'mainGradient');

        mainGradient.append('stop')
            .attr('class', 'stop-left')
            .attr('offset', '0');

        mainGradient.append('stop')
            .attr('class', 'stop-center')
            .attr('offset', .5**.75);

        mainGradient.append('stop')
            .attr('class', 'stop-right')
            .attr('offset', 1**.75);

        // var barscale = d3.scaleLinear()
        //   .domain([0, measure[1]])
        //   .range([0, 200]);
        //
        // let legendAxis = d3.axisBottom()
        //     .scale(barscale)
        //     .ticks(width > 500 ? 5:2)
        //     .tickSize(30);

        legendBar.append('rect')
            .classed('filled', true)
            .attr('y', 30)
            .attr('height', 30)
            .attr('width', 200);

        // legendTicks.call(legendAxis)
        //     .call(g => g.select(".domain").remove());

        legendtext.text("PARTICULARITY TO CITY");
        less.text("LESS");
        more.text("MORE");

      }

    drawScale([d3.min(cityNodes, d => d.relative).toString(), d3.max(cityNodes, d => d.relative).toString()], custominterpolation);

    var n = cityNodes.length;
    cityNodes.forEach(function(d, i) {
        // console.log("node i", i)
      d.x = width / n * i;
      // d.y = height / n * i;
    });

    const simulation = d3.forceSimulation(cityNodes)
        .force("link", d3.forceLink(cityLinks).id(d => d.id)
            .distance([95]))
        //     .strength(function(d) { return Math.sqrt(d.value)/100 } )
        // )
        .alphaDecay([.09])
        .velocityDecay([.15])
        .force("charge", d3.forceManyBody().strength(-275).distanceMax(275))//.strength(-100).distanceMax(220))
        .force("center", d3.forceCenter(width/2-75, height/2))//.strength(1.5))
        .force("x", d3.forceX().strength(0))
        .force("y", d3.forceY().strength(0.1))
        .force("collide", d3.forceCollide().radius(d => d.r + 1).strength(1));



        // function strength(link) {
        //   return 1 / Math.min(count(link.source), count(link.target));
        // }

    const link = netviz.append("g")
        .attr("stroke", "#aaa")
        .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(cityLinks)
    .join("line")
        .attr("stroke-width", d => d.value);

    const node = netviz.append("g")
      .attr("stroke", "#000")
    .selectAll("circle")
    .data(cityNodes)
    .join("circle")
    .attr("r", d => d.radius)
      .attr("fill", d => statusColor(d.relative))
      .call(drag(simulation))
    .on('mouseover.fade', fade(0.1))
    .on('mouseout.fade', fade(1));

    // const labelPadding = 2;
    //
    // // the component used to render each label
    // const textLabel = layoutTextLabel()
    //   .padding(labelPadding)
    //   .value(d => d.properties.name);
    //
    // // a strategy that combines simulated annealing with removal
    // // of overlapping labels
    // const strategy = layoutRemoveOverlaps(layoutGreedy());
    //
    // // create the layout that positions the labels
    // const labels = layoutLabel(strategy)
    //     .size((d, i, g) => {
    //         // measure the label and add the required padding
    //         const textSize = g[i].getElementsByTagName('text')[0].getBBox();
    //         return [textSize.width + labelPadding * 2, textSize.height + labelPadding * 2];
    //     })
    //     .position(d => projection(d.geometry.coordinates))
    //     .component(textLabel);
    var labelscale = d3.scaleLinear()
      .domain([0, d3.max(cityNodes, city => city.radius)])
      .range([9, 18]);

    const textElems = netviz.append('g')
    .selectAll('text')
    .data(cityNodes)
    .join('text')
        .text(d => d.genre)
        .attr('class', "svgText")
        .attr('font-size', d => labelscale(d.radius));
        // .call(labels);

    var wrap3 = d3.textwrap().bounds({height: 500, width: 250});

    netviz.append("text")
        .text('The network graph shows all genres for a city that appear in at least 0.1% of the selected city’s albums or individually sold tracks, and that appear at least 100 times in the entire dataset. The strength of connections between nodes represents how often those genre tags co-occurred with one another on album and individual track pages. Genres were standardized wherever possible (e.g., "tekno" was corrected to "techno"), and all geographic genres, like "philly" and "Toronto", were removed if they appeared in the city in which the music was produced. A genre’s particularity to a city was calculated by dividing its proportion of total genres in that city to its average occurrence globally. The lines between each node represent how frequently genres co-occur in the same album or individually sold track.')
        .attr("id", "about")
        .attr('x', 1100)
        .attr('y', 250)
        .call(wrap3);

    netviz.select("foreignObject")
        .attr("color", "black")
        .style("font-family", font)
        .attr('font-size', 13);

    simulation.on("tick", () => {

        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("cx", d => { return d.x = Math.max(d.radius+10, Math.min(width - (d.radius+30), d.x)); })
            .attr("cy", d => { return d.y = Math.max(d.radius+5, Math.min(height - (d.radius+5), d.y)); });
        textElems
            .attr("x", d => d.x + d.radius + 2)
            .attr("y", d => d.y + 2 );
    });

    function fade(opacity) {
        return (event, d) => {
            node.style('opacity', function (o) { return isConnected(d, o) ? 1 : opacity });
            textElems.style('visibility', function (o) { return isConnected(d, o) ? "visible" : "hidden" });
            link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));
            if(opacity === 1){
                node.style('opacity', 1)
                textElems.style('visibility', 'visible')
                link.style('stroke-opacity', 0.3)
            }
        };
    }

    const linkedByIndex = {};
    cityLinks.forEach(d => {
        linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
    });

    function isConnected(a, b) {
        return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
    }
}

map.selectAll("rect")
    .on('click', function() {
        cityCircles.selectAll("circle").classed('circSelect', false);
        netviz.selectAll("g").remove();
        netviz.select("foreignObject").remove();
        nv_svg.select(".cityname").text("");
      })

// SECTION: call additional functions
mapsvg.call(zoom);
// map.call(tip);

// tabs for switching between sections
// let tabsTemplate = `
//     <div class="single-tab map-tab selected"><div class="inner-tab-text">City Map</div></div>
//     <div class="single-tab graph-tab"><div class="inner-tab-text">Genre Graph</div></div>
// `
// let controls = document.createElement("div");
// controls.setAttribute("class", "map-tabs-parent");
// controls.innerHTML = tabsTemplate;
// sourceDiv.appendChild(controls);

// let mapTab = controls.querySelector(".single-tab.map-tab");
// let graphTab = controls.querySelector(".single-tab.graph-tab");

// mapTab.addEventListener("click", (e) => {
//   switchViews("map");
// });

// graphTab.addEventListener("click", (e) => {
//   switchViews("viz");
// });

document.addEventListener("keydown", (e) => {
  if (e.key == "ArrowLeft") {
    switchViews("map");
  } else if (e.key == "ArrowRight") {
    switchViews("viz");
  }
});

function switchViews(toView) {
  if (toView == "viz") {
    // graphTab.classList.add("selected");
    // mapTab.classList.remove("selected");

    vizWrap.classList.add("active-map");
    mapWrap.classList.remove("active-map");
  } else if (toView == "map") {
    // graphTab.classList.remove("selected");
    // mapTab.classList.add("selected");

    vizWrap.classList.remove("active-map");
    mapWrap.classList.add("active-map");
  } else {
    console.log("needs to be either 'viz' or 'map'!")
  }
}
