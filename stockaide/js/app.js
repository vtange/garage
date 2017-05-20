var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var dim = {
        width: windowWidth-400, height: windowHeight,
        margin: { top: 20, right: 50, bottom: 30, left: 50 }, // LEAVE ALONE -> DEFAULT CHART POSITIONING
        ohlc: { height: windowHeight*0.50 },                                // height space for candlestick chart
        indicator: { height: windowHeight*0.2, padding: 5 }                // height space for indicators
        };
        dim.plot = {
        width: dim.width - dim.margin.left - dim.margin.right,
        height: dim.height - dim.margin.top - dim.margin.bottom
};
dim.indicator.top = dim.ohlc.height+dim.indicator.padding;
dim.indicator.bottom = dim.indicator.top+dim.indicator.height+dim.indicator.padding;

var indicatorTop = d3.scaleLinear()
        .range([dim.indicator.top, dim.indicator.bottom]);

var parseDate = d3.timeParse("%d-%b-%y");

var zoom = d3.zoom()
        .on("zoom", zoomed);

var x = techan.scale.financetime()
        .range([0, dim.plot.width]);

var y = d3.scaleLinear()
        .range([dim.ohlc.height, 0]);


var yPercent = y.copy();   // Same as y at this stage, will get a different domain later

var yInit, yPercentInit, zoomableInit;

var yVolume = d3.scaleLinear()
        .range([y(0), y(0.2)]);

var candlestick = techan.plot.candlestick()
        .xScale(x)
        .yScale(y);

var tradearrow = techan.plot.tradearrow()
        .xScale(x)
        .yScale(y)
        .y(function(d) {
        // Display the buy and sell arrows a bit above and below the price, so the price is still visible
        if(d.type === 'buy') return y(d.low)+5;
        if(d.type === 'sell') return y(d.high)-5;
        else return y(d.price);
        });

var sma0 = techan.plot.sma()
        .xScale(x)
        .yScale(y);

var sma1 = techan.plot.sma()
        .xScale(x)
        .yScale(y);

var ema2 = techan.plot.ema()
        .xScale(x)
        .yScale(y);

var volume = techan.plot.volume()
        .accessor(candlestick.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
        .xScale(x)
        .yScale(yVolume);

var trendline = techan.plot.trendline()
        .xScale(x)
        .yScale(y);

var supstance = techan.plot.supstance()
        .xScale(x)
        .yScale(y);

var xAxis = d3.axisBottom(x);

var timeAnnotation = techan.plot.axisannotation()
        .axis(xAxis)
        .orient('bottom')
        .format(d3.timeFormat('%Y-%m-%d'))
        .width(65)
        .translate([0, dim.plot.height]);

var yAxis = d3.axisRight(y);

var ohlcAnnotation = techan.plot.axisannotation()
        .axis(yAxis)
        .orient('right')
        .format(d3.format(',.2f'))
        .translate([x(1), 0]);

var closeAnnotation = techan.plot.axisannotation()
        .axis(yAxis)
        .orient('right')
        .accessor(candlestick.accessor())
        .format(d3.format(',.2f'))
        .translate([x(1), 0]);

var percentAxis = d3.axisLeft(yPercent)
        .tickFormat(d3.format('+.1%'));

var percentAnnotation = techan.plot.axisannotation()
        .axis(percentAxis)
        .orient('left');

var volumeAxis = d3.axisRight(yVolume)
        .ticks(3)
        .tickFormat(d3.format(",.3s"));

var volumeAnnotation = techan.plot.axisannotation()
        .axis(volumeAxis)
        .orient("right")
        .width(35);

var macdScale = d3.scaleLinear()
        .range([indicatorTop(0)+dim.indicator.height, indicatorTop(0)]);

var rsiScale = macdScale.copy()
        .range([indicatorTop(1)+dim.indicator.height, indicatorTop(1)]);

var macd = techan.plot.macd()
        .xScale(x)
        .yScale(macdScale);

var macdAxis = d3.axisRight(macdScale)
        .ticks(3);

var macdAnnotation = techan.plot.axisannotation()
        .axis(macdAxis)
        .orient("right")
        .format(d3.format(',.2f'))
        .translate([x(1), 0]);

var macdAxisLeft = d3.axisLeft(macdScale)
        .ticks(3);

var macdAnnotationLeft = techan.plot.axisannotation()
        .axis(macdAxisLeft)
        .orient("left")
        .format(d3.format(',.2f'));

var rsi = techan.plot.rsi()
        .xScale(x)
        .yScale(rsiScale);

var rsiAxis = d3.axisRight(rsiScale)
        .ticks(3);

var rsiAnnotation = techan.plot.axisannotation()
        .axis(rsiAxis)
        .orient("right")
        .format(d3.format(',.2f'))
        .translate([x(1), 0]);

var rsiAxisLeft = d3.axisLeft(rsiScale)
        .ticks(3);

var rsiAnnotationLeft = techan.plot.axisannotation()
        .axis(rsiAxisLeft)
        .orient("left")
        .format(d3.format(',.2f'));

var ohlcCrosshair = techan.plot.crosshair()
        .xScale(timeAnnotation.axis().scale())
        .yScale(ohlcAnnotation.axis().scale())
        .xAnnotation(timeAnnotation)
        .yAnnotation([ohlcAnnotation, percentAnnotation, volumeAnnotation])
        .verticalWireRange([0, dim.plot.height]);

var macdCrosshair = techan.plot.crosshair()
        .xScale(timeAnnotation.axis().scale())
        .yScale(macdAnnotation.axis().scale())
        .xAnnotation(timeAnnotation)
        .yAnnotation([macdAnnotation, macdAnnotationLeft])
        .verticalWireRange([0, dim.plot.height]);

var rsiCrosshair = techan.plot.crosshair()
        .xScale(timeAnnotation.axis().scale())
        .yScale(rsiAnnotation.axis().scale())
        .xAnnotation(timeAnnotation)
        .yAnnotation([rsiAnnotation, rsiAnnotationLeft])
        .verticalWireRange([0, dim.plot.height]);



// DRAW CHART
var svg = d3.select("#chart").append("svg")
        .attr("width", dim.width)
        .attr("height", dim.height);

var defs = svg.append("defs");

defs.append("clipPath")
        .attr("id", "ohlcClip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", dim.plot.width)
        .attr("height", dim.ohlc.height);

defs.selectAll("indicatorClip").data([0, 1])
        .enter()
        .append("clipPath")
        .attr("id", function(d, i) { return "indicatorClip-" + i; })
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d, i) { return indicatorTop(i); })
        .attr("width", dim.plot.width)
        .attr("height", dim.indicator.height);

svg = svg.append("g")
        .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

svg.append('text')
        .attr("class", "symbol")
        .attr("x", 20)
        .text("");//Facebook, Inc. (FB) -> SYMBOL

svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dim.plot.height + ")");

var ohlcSelection = svg.append("g")
        .attr("class", "ohlc")
        .attr("transform", "translate(0,0)");

ohlcSelection.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + x(1) + ",0)")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -12)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Price ($)");

ohlcSelection.append("g")
        .attr("class", "close annotation up");

ohlcSelection.append("g")
        .attr("class", "volume")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "candlestick")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "indicator sma ma-0")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "indicator sma ma-1")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "indicator ema ma-2")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "percent axis");

ohlcSelection.append("g")
        .attr("class", "volume axis");

var indicatorSelection = svg.selectAll("svg > g.indicator").data(["macd", "rsi"]).enter()
        .append("g")
        .attr("class", function(d) { return d + " indicator"; });

indicatorSelection.append("g")
        .attr("class", "axis right")
        .attr("transform", "translate(" + x(1) + ",0)");

indicatorSelection.append("g")
        .attr("class", "axis left")
        .attr("transform", "translate(" + x(0) + ",0)");

indicatorSelection.append("g")
        .attr("class", "indicator-plot")
        .attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; });

// Add trendlines and other interactions last to be above zoom pane
svg.append('g')
        .attr("class", "crosshair ohlc");

svg.append("g")
        .attr("class", "tradearrow")
        .attr("clip-path", "url(#ohlcClip)");

svg.append('g')
        .attr("class", "crosshair macd");

svg.append('g')
        .attr("class", "crosshair rsi");

svg.append("g")
        .attr("class", "trendlines analysis")
        .attr("clip-path", "url(#ohlcClip)");
svg.append("g")
        .attr("class", "supstances analysis")
        .attr("clip-path", "url(#ohlcClip)");

function loadArrData(err, data)
{
        var accessor = candlestick.accessor(),
                indicatorPreRoll = 33;  // Don't show where indicators don't have data

        _DATA = data = data.map(function(d) {
                return {
                date: parseDate(d.Date),
                open: +d.Open,
                high: +d.High,
                low: +d.Low,
                close: +d.Close,
                volume: +d.Volume
                };
        }).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });
        shortTermPredictions();

        x.domain(techan.scale.plot.time(data).domain());
        y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());
        yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
        yVolume.domain(techan.scale.plot.volume(data).domain());

        var trendlineData = [
                // { start: { date: new Date(2014, 2, 11), value: 72.50 }, end: { date: new Date(2014, 5, 9), value: 63.34 } },
                // { start: { date: new Date(2013, 10, 21), value: 43 }, end: { date: new Date(2014, 2, 17), value: 70.50 } }
        ];

        var supstanceData = [
                // { start: new Date(2014, 2, 11), end: new Date(2014, 5, 9), value: 63.64 },
                // { start: new Date(2013, 10, 21), end: new Date(2014, 2, 17), value: 55.50 }
        ];

        var trades = [
                // { date: data[67].date, type: "buy", price: data[67].low, low: data[67].low, high: data[67].high },
                // { date: data[100].date, type: "sell", price: data[100].high, low: data[100].low, high: data[100].high },
                // { date: data[130].date, type: "buy", price: data[130].low, low: data[130].low, high: data[130].high },
                // { date: data[170].date, type: "sell", price: data[170].low, low: data[170].low, high: data[170].high }
        ];

        var macdData = techan.indicator.macd()(data);
        macdScale.domain(techan.scale.plot.macd(macdData).domain());
        var rsiData = techan.indicator.rsi()(data);
        rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());

        svg.select("g.candlestick").datum(data).call(candlestick);
        svg.select("g.close.annotation").datum([data[data.length-1]]).call(closeAnnotation);
        svg.select("g.volume").datum(data).call(volume);
        svg.select("g.sma.ma-0").datum(techan.indicator.sma().period(10)(data)).call(sma0);
        svg.select("g.sma.ma-1").datum(techan.indicator.sma().period(20)(data)).call(sma1);
        svg.select("g.ema.ma-2").datum(techan.indicator.ema().period(50)(data)).call(ema2);
        svg.select("g.macd .indicator-plot").datum(macdData).call(macd);
        svg.select("g.rsi .indicator-plot").datum(rsiData).call(rsi);

        svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
        svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
        svg.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);
        svg.select("g.trendlines").datum(trendlineData).call(trendline).call(trendline.drag);
        svg.select("g.supstances").datum(supstanceData).call(supstance).call(supstance.drag);

        svg.select("g.tradearrow").datum(trades).call(tradearrow);

        // Stash for zooming
        zoomableInit = x.zoomable().domain([indicatorPreRoll, data.length]).copy(); // Zoom in a little to hide indicator preroll
        yInit = y.copy();
        yPercentInit = yPercent.copy();

        draw();
}

function reset() {
        indicatorPreRoll = 33;  // Don't show where indicators don't have data
        zoomableInit = x.zoomable().domain([indicatorPreRoll, _DATA.length]).copy(); // Zoom in a little to hide indicator preroll
        yInit = y.copy();
        yPercentInit = yPercent.copy();
        draw();
}

function zoomed() {
        x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
        y.domain(d3.event.transform.rescaleY(yInit).domain());
        yPercent.domain(d3.event.transform.rescaleY(yPercentInit).domain());

        draw();
}

function draw() {
        svg.select("g.x.axis").call(xAxis);
        svg.select("g.ohlc .axis").call(yAxis);
        svg.select("g.volume.axis").call(volumeAxis);
        svg.select("g.percent.axis").call(percentAxis);
        svg.select("g.macd .axis.right").call(macdAxis);
        svg.select("g.rsi .axis.right").call(rsiAxis);
        svg.select("g.macd .axis.left").call(macdAxisLeft);
        svg.select("g.rsi .axis.left").call(rsiAxisLeft);

        // We know the data does not change, a simple refresh that does not perform data joins will suffice.
        svg.select("g.candlestick").call(candlestick.refresh);
        svg.select("g.close.annotation").call(closeAnnotation.refresh);
        svg.select("g.volume").call(volume.refresh);
        svg.select("g .sma.ma-0").call(sma0.refresh);
        svg.select("g .sma.ma-1").call(sma1.refresh);
        svg.select("g .ema.ma-2").call(ema2.refresh);
        svg.select("g.macd .indicator-plot").call(macd.refresh);
        svg.select("g.rsi .indicator-plot").call(rsi.refresh);
        svg.select("g.crosshair.ohlc").call(ohlcCrosshair.refresh);
        svg.select("g.crosshair.macd").call(macdCrosshair.refresh);
        svg.select("g.crosshair.rsi").call(rsiCrosshair.refresh);
        svg.select("g.trendlines").call(trendline.refresh);
        svg.select("g.supstances").call(supstance.refresh);
        svg.select("g.tradearrow").call(tradearrow.refresh);
}

var _ = {
	//used to check file extension
	validFiles : /^([a-zA-Z0-9\s_\\.\-:\(\)])+(.csv)$/,
	
	//[init at DOM load] gets HTML elements for targeting
	getInteractables : function(){
		_.page = document.querySelector("html");

		_.fileupload = document.getElementById('file-upload');
		_.filelabel = document.getElementById('file-upload').nextElementSibling;
		_.filename = _.filelabel.innerHTML;
		_.uploadbtn = document.getElementById('upload-btn');

		_.dropzone = document.getElementById('drop-box');
		_.dropdown = document.getElementById('dropdown');
	},

	//[init after getInteractables] assigns events
	initEvents : function(){
		//if file still exists
		if(_.fileupload.files[0]){
			_.filelabel.querySelector( 'span' ).innerHTML = _.fileupload.files[0].name;
			enable(_.uploadbtn);
		}
		
		////////////////  sends selected file
		_.uploadbtn.addEventListener("click", function (e) {
			if(_.fileupload.files[0]){
				//_.sendFiles();
                _.loadFiles();
				_.filelabel.querySelector( 'span' ).innerHTML = "Choose a file...";
				_.fileupload.files[0] = null;
				disable(_.uploadbtn);
			}
		});

		////////////////  drag and drop
		// prevent missed drops == load file
		_.page.addEventListener("dragover", function(e) {
			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = "none";
		}, false);
		_.page.addEventListener("drop", function(e) {
			e.preventDefault();
			e.stopPropagation();
		}, false);

		//dropzone1 upload
		_.dropzone.addEventListener('dragleave', function (e) {
			if (_.dropzone.classList.contains("onTop")) {
				_.dropzone.classList.remove("onTop")
			}
		});
		_.dropzone.addEventListener("dragover", function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (!(_.dropzone.classList.contains("onTop"))) {
				_.dropzone.classList.add("onTop")
			}
			e.dataTransfer.dropEffect = "copy";//mouse icon
		}, false);
		_.dropzone.addEventListener("drop", function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (_.dropzone.classList.contains("onTop")) {
				_.dropzone.classList.remove("onTop")
			}
			_.processDropped(e, 1)
		}, false);

		//////////////// default file add
		_.fileupload.addEventListener( 'change', function(e) {
			var fileName = '';/* prevent multi file upload for now
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else*/
				fileName = this.files[0].name;
				enable(_.uploadbtn);

			if( fileName )
				_.filelabel.querySelector( 'span' ).innerHTML = fileName;
			else
				_.filelabel.innerHTML = _.filename;
		});

		// Firefox bug fix
		_.fileupload.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		_.fileupload.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
	},
	//////////////// drag n drop file add
	processDropped : function(eventTarget){
        var file = eventTarget.dataTransfer.files[0]; //limit to one file
        if (_.validFiles.test(file.name.toLowerCase())) {
			_.filelabel.querySelector( 'span' ).innerHTML = file.name;
			_.fileupload.files[0] = file;
			enable(_.uploadbtn);
        }
		else {
			alert("One or more of your files is not a valid CSV file.");
        }
	},
    loadFiles : function(){
        if (_.validFiles.test(_.fileupload.files[0].name.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        process(e);
                    }
                    reader.readAsText(_.fileupload.files[0]);
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("One or more of your files is not a valid CSV file.");
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
        _.getInteractables();
        _.initEvents();
});

/* GENERAL DOM MANIPULATION FNS */

//RESET BUTTON
d3.select("button").on("click", reset);

var _DATA;
var last = [1,2,3,4,5,6,7,8,9,10];
//LOAD THE DATA
d3.csv("data.csv", loadArrData);


//addEventListener for multiple children "selector" under "elSelector" such as <li> in a <ul>
function on(elSelector, eventName, selector, fn) {
	var element = document.getElementById(elSelector);

	element.addEventListener(eventName, function(event) {
		var possibleTargets = element.querySelectorAll(selector);
		var target = event.target;

		for (var i = 0, l = possibleTargets.length; i < l; i++) {
			var el = target;
			var p = possibleTargets[i];

			while(el && el !== element) {
				if (el === p) {
					return fn.call(p, event);
				}

				el = el.parentNode;
			}
		}
	});
}

function toggle(element) {
	if (!element.classList.contains("hidden")) {
		element.classList.add("hidden");
	}
	else{
		element.classList.remove("hidden");
	}
}

function close(element) {
	if (!element.classList.contains("hidden")) {
		element.classList.add("hidden");
	}
}

function open(element) {
	if (element.classList.contains("hidden")) {
		element.classList.remove("hidden");
	}
}

function enable(element) {
	if (element.classList.contains("disabled")) {
		element.classList.remove("disabled");
	}
}

function disable(element) {
	if (!element.classList.contains("disabled")) {
		element.classList.add("disabled");
	}
}

/* STOCK READER */
function process(csvFileEvent) {
        var lines = csvFileEvent.target.result.split("\n");
        var pattern = ["date", "close", "volume", "open", "high", "low"];
        var data = [];
        lines.forEach(function(strDayData,index){
                var arrData = strDayData.match(/[/.\w]+/g);
                if(arrData == null)
                {
                }
                else if(index==0)
                {
                        //set up the pattern
                        pattern = arrData.map(function(word){
                                return word[0].toUpperCase() + word.substring(1);
                        });
                }
                else
                {
                        data.push(processLine(arrData, pattern));
                }
        });
        loadArrData(null, data);
}

function processLine(arrData, pattern)
{
	var obj = Object.create(null);
	arrData.forEach(function(word,index){
		obj[pattern[index]] = processWord(word,pattern[index]);
	});
	return obj;
}

function processWord(str, type)
{
	if(type == "Date")
	{
		var date = str.match(/\d+/g);
		var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		var year = date[0];
		var month = months[parseInt(date[1],10)-1];
		var day = date[2];
	
		return day+"-"+month+"-"+year.substring(2);
	}
	else
	{
		return str;
	}
}


function shortTermPredictions()
{
        last.forEach(function(num,idx){
            last[idx] = _DATA.slice(_DATA.length - (idx+2))
        });

        var lastTwo = last[0];
        




}

function searchData(length, arrToCompareWith)
{
        //TODO first do a find similar first candle search to populate closestMatches, then fill it in and sort.


        var CHKSUM_arrToCompareWith = getChkSum(arrToCompareWith); //string representation of candle sequence;
        //returns array of similar candle sequences
        var window = [];
        var CHKSUM_window = "";
        var closestMatches = [];

        for(var i = 0; i <= _DATA.length; i++)
        {
                if(window.length == length)
                {
                        window.splice(0,1);
                        window.push(_DATA[i]);
                        compareCHKSUM(window,arrToCompareWith,closestMatches);
                }
                else
                {
                        window.push(_DATA[i]);
                        //warning: closestMatch can be null if length is greater than data.length
                }
        }
        return closestMatches.sort(function(obj1, obj2){
                return obj1.similarity > obj2.similarity;
        });
}

function getChkSum(arrCandles)
{
        //reference: [{"date":"2014-06-06T07:00:00.000Z","open":63.37,"high":63.48,"low":62.15,"close":62.5,"volume":42442096},{"date":"2014-06-09T07:00:00.000Z","open":62.4,"high":63.34,"low":61.79,"close":62.88,"volume":37617413}]
        //we need to rid of absolute numbers. 10-12 should be similar to 20-24;
        


}

//do a adversarial network where comp makes a statistical guess which competes against what really happens

function compareCHKSUM(arrWindow,arrToCompareWith,arrClosestMatches)
{
        

        //push to arrClosestMatches if similarity beats all existing matches (up to max 10);





}
/*
{
	range
	(actual move, as percent of range) 0% to 10% means gravestone doji for example
	volume
}


















	/*MAKE webservice?

	
	sendFiles : function(){
        if (_.validFiles.test(_.fileupload.files[0].name.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
				////PREPARE DATA AND SEND
				var formData = new FormData();
				
				//// HTML file input, chosen by user
				formData.append("vsts", _.dropdown.querySelector( 'input' ).value);
				formData.append("audiofiles", _.fileupload.files[0]);

				//// create request
				var request = new XMLHttpRequest();
				request.open("POST", window.location.href+"process");
				
				//// setup request
				//request.setRequestHeader('Content-Type', 'multipart/form-data');
				//enable upload progress
				request.upload.onprogress = function(e) {
				  if (e.lengthComputable) {
					var percentage = (e.loaded / e.total) * 100;
					_.progressbar.style.width = percentage + '%';
						if(!percentage<100){
							//100% upload, begin processing.
							close(_.progress);
							open(_.processing);
						}
				  }
				};
				request.onerror = function(e) {
				  alert('An error occurred while submitting the form. Maybe your file is too big');
				};
				request.onload = function(e) {
					close(_.processing);
					_.dllink.setAttribute('href',window.location.href+e.target.response);
					_.dllink.setAttribute('download',e.target.response.split('finished/').pop());
					open(_.finished);
				};

				//send request
				request.send(formData);
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("One or more of your files is not a valid CSV file.");
        }
	},


	*/