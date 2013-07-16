var quintiles = { "1ST": "1st Quintile" , "2ND": "2nd Quintile", "3RD": "3rd Quintile", "4TH": "4th Quintile", "5TH": "5th Quintile"},
	w = 925,
	h = 550,
	margin = 40,
	startYear = 2007, 
	endYear = 2012,
	startAge = 50,
	endAge = 200,
	y = d3.scale.linear().domain([endAge, startAge]).range([0 + margin, h - margin]),
	x = d3.scale.linear().domain([2007, 2012]).range([0 + margin -5, w]),
	years = d3.range(startYear, endYear);

var vis = d3.select("#vis")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g");
			
var line = d3.svg.line()
    .x(function(d,i) { return x(d.x); })
    .y(function(d) { return y(d.y); });
					

// quintiles
var jobLines_quintile = {};
d3.text('wage_data_chart_v2_edit.csv', 'text/csv', function(text) {
    var quintiles = d3.csv.parseRows(text);
    for (i=1; i < 	quintiles.length; i++) {
        jobLines_quintile[quintiles[i][0]] = quintiles[i][1];
    }
});

var startEnd = {},
    jobCodes = {};
d3.text('wage_data_chart_v2_edit.csv', 'text/csv', function(text) {
    var jobLines = d3.csv.parseRows(text);
//    var fullData = d3.csv.parse(text);
    
    for (i=1; i < jobLines.length; i++) {
        var values = jobLines[i].slice(2, jobLines[i.length-1]);
//        var quintile = jobLines[i].slice(0,2);
        var currData = [];
//        countryCodes[jobLines[i][1]] = jobLines[i][0];
        
        var started = false;
        for (j=0; j < values.length; j++) {
            if (values[j] != '') {
                currData.push({ x: years[j], y: values[j] });
          
                if (!started) {
                    startEnd[jobLines[i][1]] = { 'startYear':years[j], 'startVal':values[j] };
                    started = true;
                } else if (j == values.length-1) {
                    startEnd[jobLines[i][1]]['endYear'] = years[j];
                    startEnd[jobLines[i][1]]['endVal'] = values[j];
                }
                
            }
        }
        
        // Actual line
        vis.append("svg:path")
            .data([currData])
            .attr("jobName", jobLines[i][1])
            .attr("class", jobLines[i][0])
            .attr("d", line)
            .on("mouseover", onmouseover)
            .on("mouseout", onmouseout);
    }
    
    
});  
    
vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startAge))
    .attr("x2", x(endYear))
    .attr("y2", y(startAge))
    .attr("class", "axis")

vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startAge))
    .attr("x2", x(startYear))
    .attr("y2", y(endAge))
    .attr("class", "axis")
			
vis.selectAll(".xLabel")
    .data(x.ticks(5))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) { return x(d) })
    .attr("y", h-10)
    .attr("text-anchor", "middle")

vis.selectAll(".yLabel")
    .data(y.ticks(4))
    .enter().append("svg:text")
    .attr("class", "yLabel")
    .text(String)
	.attr("x", 0)
	.attr("y", function(d) { return y(d) })
	.attr("text-anchor", "right")
	.attr("dy", 3)
			
vis.selectAll(".xTicks")
    .data(x.ticks(5))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) { return x(d); })
    .attr("y1", y(startAge))
    .attr("x2", function(d) { return x(d); })
    .attr("y2", y(startAge)+7)
	
vis.selectAll(".yTicks")
    .data(y.ticks(4))
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) { return y(d); })
    .attr("x1", x(startYear-0.5))
    .attr("y2", function(d) { return y(d); })
    .attr("x2", x(startYear))

function onclick(d, i) {
    var currClass = d3.select(this).attr("class");
    if (d3.select(this).classed('selected')) {
        d3.select(this).attr("class", currClass.substring(0, currClass.length-9));
    } else {
        d3.select(this).classed('selected', true);
    }
}

function onmouseover(d, i) {
    var currClass = d3.select(this).attr("class");
    d3.select(this)
        .attr("class", currClass + " current");
    
    var jobCode = $(this).attr("jobName");
    var jobVals = startEnd[jobCode];
    var percentChange = 100 * (jobVals['endVal'] - jobVals['startVal']) / jobVals['startVal'];
    
    var blurb = '<h2>' + jobCodes[jobCode] + '</h2>';
    blurb += "<p>On average: a life expectancy of " + Math.round(jobVals['startVal']) + " years in " + jobVals['startYear'] + " and " + Math.round(jobVals['endVal']) + " years in " + jobVals['endYear'] + ", ";
    if (percentChange >= 0) {
        blurb += "an increase of " + Math.round(percentChange) + " percent."
    } else {
        blurb += "a decrease of " + -1 * Math.round(percentChange) + " percent."
    }
    blurb += "</p>";
    
    $("#default-blurb").hide();
    $("#blurb-content").html(blurb);
}
function onmouseout(d, i) {
    var currClass = d3.select(this).attr("class");
    var prevClass = currClass.substring(0, currClass.length-8);
    d3.select(this)
        .attr("class", prevClass);
    // $("#blurb").text("hi again");
    $("#default-blurb").show();
    $("#blurb-content").html('');
}

function showQuintile(quintile) {
    var jobLines = d3.selectAll("path."+quintile);
    if (jobLines.classed('highlight')) {
        jobLines.attr("class", quintile);
    } else {
        jobLines.classed('highlight', true);
    }
}


$(document).ready(function() {
    $('#filters a').click(function() {
        var jobId = $(this).attr("id");
        $(this).toggleClass(jobId);
        showQuintile(jobId);
    });
    
});
