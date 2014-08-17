function parseDate(d) {
		return new Date(2001,
						d.substring(0, 2) - 1,
						d.substring(2, 4),
						d.substring(4, 6),
						d.substring(6, 8));
}

$(document).ready(function(){
	myLayout = $('body').layout({
		north__size:200,
		east__size:300,
		east__minSize:200});

	d3.csv("flights-3m.json", function(error, flights) {
	  // Various formatters.
		var formatNumber = d3.format(",d"),
	    	formatChange = d3.format("+,d"),
			formatDate = d3.time.format("%B %d, %Y"),
			formatTime = d3.time.format("%I:%M %p");
	
      // A nest operator, for grouping the flight list.
		var nestByDate = d3.nest()
		    .key(function(d) { return d3.time.day(d.date); });
		
	  // A little coercion, since the CSV is untyped.
		flights.forEach(function(d, i) {
			d.index = i;
			d.date = parseDate(d.date);
			d.delay = +d.delay;
		    d.distance = +d.distance;
		});


		var flight = crossfilter(flights),
//			all = flight.groupAll(),
			date = flight.dimension(function(d) { return d.date; }),
			dates = date.group(d3.time.day),
			hour = flight.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
			hours = hour.group(Math.floor),
			delay = flight.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); }),
			delays = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
			distance = flight.dimension(function(d) { return Math.min(1999, d.distance); }),
			distances = distance.group(function(d) { return Math.floor(d / 50) * 50; });
		var dateseries = dc.lineChart("#dateseries")
			.width($(window).width()).height(200)
			.x(d3.time.scale()
			    .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)]))
			.round(d3.time.month.round)
			.xUnits(d3.time.months)
			.elasticY(true)
			.brushOn(true)
			.dimension(date)
			.group(dates);

		var hourplot = dc.barChart("#hourplot")
			.width(300).height(200)
			.x(d3.scale.linear().domain([0,24]).rangeRound([0, 10 * 24]))
			.elasticY(true)
			.brushOn(true)
			.dimension(hour)
			.group(hours);

		var distanceplot = dc.barChart("#distanceplot")
			.width(300).height(200)
			.x(d3.scale.linear().domain([0,2000]).rangeRound([0, 10 * 40]))
			.elasticY(true)
			.brushOn(true)
			.dimension(distance)
			.group(distances);
		
		var delayplot = dc.barChart("#delayplot")
			.width(300).height(200)
			.x(d3.scale.linear().domain([-60,150]).rangeRound([0, 10 * 21]))
			.elasticY(true)
			.brushOn(true)
			.dimension(delay)
			.group(delays);

		dc.renderAll();

	});
});

