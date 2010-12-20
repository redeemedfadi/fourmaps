var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var route;
var response;
var markerArray = [];
var items;
var token = "PU3PIXHAQP1U201LR4F210WDL4NYZNJJPY1JJ0U2Q0Y0XSDO";

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var chicago = new google.maps.LatLng(33.850033, -83.6500523);
  var myOptions = {
    zoom:9,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: chicago
  }
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  directionsDisplay.setMap(map);
}
  
function calcRoute() {
  var start = document.getElementById("start").value;
  var end = document.getElementById("end").value;
  var request = {
    origin:start, 
    destination:end,
    travelMode: google.maps.DirectionsTravelMode.DRIVING
  };
  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
      var paths = result.routes[0].overview_path
      var steps = Math.floor(paths.length/10);
      for(var i=0;i < paths.length/steps ;i++){
        markerArray[i] = paths[i*steps];
      }
      getVenues();
    }
  });

}

function getVenues()
{
  var venue = $("#venue").val();
  var url = "https://api.foursquare.com/v2/venues/search"

  for(var j=0;j<markerArray.length;j++){
    var latlng = markerArray[j].va + "," + markerArray[j].wa;
    var query = "?limit=1&llAcc=1000&query="+venue+"&ll="+latlng+"&oauth_token="+token;
    console.log(url + query);
    $.get(url + query,function(resp){
      console.log(resp);
      response = resp;
      items = resp.response.groups[0].items
      for(var i=0;i < items.length; i++){
        var location = items[i].location;
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.lat, location.lng),
          map: map,
          title: items[i].name
        });
        loadTips(items[i],marker);
      };
    });
  };
};

function loadTips(item,marker){
  var url = "https://api.foursquare.com/v2/venues/"+item.id+"/tips?oauth_token="+token;
  console.log(url);
  $.get(url, function(resp){
    var text = "";
    var items = resp.response.tips.items;
    for(var i=0;i<items.length;i++){
      var tip = items[i];
      text += "<img alt='"+tip.user.firstName+"' src='"+tip.user.photo+"' />";
      text += tip.text + "<br />";
    }
    var infowindow = new google.maps.InfoWindow({ content: text });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
  });
};

