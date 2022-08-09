var URL = "http://www.mapquestapi.com/directions/v2/route";
var URLelevation = "http://open.mapquestapi.com/elevation/v1/chart?key=JuFEmQOanx6gzJ6kA1UwDbkKzkbA66Qt&shapeFormat=raw&width=400&height=300&latLngCollection=";
var keyApi = "JuFEmQOanx6gzJ6kA1UwDbkKzkbA66Qt";
var fromStreet = "";
var fromCity = "";
var fromState = "";
var fromZip = "";
var toStreet = "";
var toStreet = "";
var toStreet = "";
var toStreet = "";
var allManeuvers = [];
var maneuverSize = 0;
var totalTime = 0;
var expandedObj = {};


function getLocations() {
fromStreet = $("#fromStreet").val();
//fromStreet = fromStreet.replaceAll(" ", "%20");
fromCity = $("#fromCity").val();
fromState = $("#fromState").val();
fromZip = $("#fromZip").val();

toStreet = $("#toStreet").val();
//toStreet = toStreet.replaceAll(" ", "+");
toCity = $("#toCity").val();
toState = $("#toState").val();
toZip = $("#toZip").val();

$("#results").show();
call();
}

function call() {
		$("#processes").html("");
		$("#elevate").html("");
		allManeuvers=[];
		var fromL = fromStreet + ',' + fromCity + ',' + fromState + ',' + fromZip;
		var toL = toStreet + ',+' + toCity + ',+' + toState + ',+' + toZip;
		a=$.ajax({
		url: URL, 
		method: "GET",
		data: {key: keyApi,
		from: fromL, to: toL
		}
	}).done(function(data) {
		//console.log(data);
		try {
		var size = data.route.legs[0].maneuvers.length;
		maneuverSize = size;
		for (let i = 0; i < size; i++) {
			var narrative = data.route.legs[0].maneuvers[i].narrative;
			var distance = data.route.legs[0].maneuvers[i].distance;
			var time = data.route.legs[0].maneuvers[i].formattedTime;
			var imgUrl = data.route.legs[0].maneuvers[i].mapUrl;
			$("#processes").append("<tr><td>" + narrative +" </td><td>" + time + "</td><td>" + distance + "</td><td><img src=" + imgUrl +" alt=NoImage></img></td></tr>");
			var obj = {narrative, distance, time, imgUrl};
			allManeuvers.push(obj);
		}
		totalTime = data.route.formattedTime;
		var latLong = data.route.locations[0].latLng.lat + "," +  data.route.locations[0].latLng.lng + "," + data.route.locations[1].latLng.lat + "," +  data.route.locations[1].latLng.lng;
		elevation(latLong);
		} catch (error) {
			$("#processes").append("<tr><td><h2>One of the locations you put in is incorrect. Try again.</h2> </td></tr>");
		}
	}).fail(function(error) {
		console.log("error",error.statusText);
	});
}

function elevation(latLong) {
        $("#elevate").html("");
	var tmpElevation = URLelevation + latLong;
	console.log(tmpElevation);
	a=$.ajax({
                url: tmpElevation,
                method: "GET"
        }).done(function(data) {
		$("#elevate").append("<img src=" + tmpElevation +  " id=elevate alt = NoImage>");
		console.log(tmpElevation);
		insertTable(tmpElevation);

        }).fail(function(error) {
                console.log("error",error.statusText);
        });
}

function insertTable(tmpElevation) {
	var tmpL = fromStreet + ' ' + fromCity + ' ' + fromState + ' ' + fromZip + ' to ' + toStreet + ' ' + toCity + ' ' + toState + ' ' + toZip; 
	var tmpLocation = JSON.stringify({tmpL, tmpElevation});
	var tmpString = JSON.stringify(allManeuvers);
        a=$.ajax({
                url: 'final.php',
		method: "POST",
		data: {
			method: 'setLookup',
			location: tmpLocation,
			sensor: totalTime,
			value: tmpString
			 },
		dataType: 'json'
        }).done(function(data) {
		console.log(data);
        }).fail(function(error) {
                console.log("error",error.statusText);
        });
}

function search(){
var val = $("#searchText").val();
var limitVal = 10;
if ($("#limitText").val() == '') limitVal = 10;
else {
limitVal = $("#limitText").val();
}
$("#historyBody").html("");
        a=$.ajax({
                url: 'final.php',
                method: "GET",
		data: {method: 'getLookup', date: val}
        }).done(function(data) {
	console.log(data);
	$("#history").show();
	for (let i = 0; i < limitVal; i++) {
		var location = JSON.parse(data.result[i].location);
		var obj = JSON.parse(data.result[i].value);
		var date = data.result[i].sensor;
//		console.log(obj);
//		console.log(data);
		$("#historyBody").append("<tr><td>" + location.tmpL +" </td><td>" + date +  "</td><td>" + obj.length + "</td><td>" + data.result[i].date + '</td><td><button type="button" id ="butt" class="btn btn-primary">Click for Directions</button></td></tr>');
		$('#butt').attr('id', 'id' + i);
		$('#id' + i).click(function() {
			expanded(data.result[i]);
		});
}

	}).fail(function(error) {
		$("#historyBody").append("<tr><td>No queries with the searched date found.</td></tr>");
                console.log("error",error.statusText);
        });

}

function expanded(hello) {
console.log(hello);
	$("#exp-rows").html("");
	$("#elevate-expanded").html("");
	var locExp = JSON.parse(hello.location);
	var valExp = JSON.parse(hello.value);
	console.log(locExp);
	$("#expanded-header").html("<u>" + locExp.tmpL + "</u>");
	$("#expanded-table").show();
	for (let i = 0; i < valExp.length; i++) {
                        var narrative = valExp[i].narrative;
                        var distance = valExp[i].distance;
                        var time = valExp[i].time;
                        var imgUrl = valExp[i].imgUrl;
                        $("#exp-rows").append("<tr><td>" + narrative +" </td><td>" + time + "</td><td>" + distance + "</td><td><img src=" + imgUrl +" alt=NoImage></img></td></tr>");
	}
		$("#elevate-expanded").append("<img src=" + locExp.tmpElevation +  " alt = NoImage>");


}


