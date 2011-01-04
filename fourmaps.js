var Fourmaps = {
  directionsService : new google.maps.DirectionsService(),
  directionsDisplay : new google.maps.DirectionsRenderer(),
  map:      undefined,
  route:    undefined,
  response: undefined,
  items:    undefined,
  mapEnabled: false,
  markerArray : new Array(),
  tableData : new Array(),
  token : "PU3PIXHAQP1U201LR4F210WDL4NYZNJJPY1JJ0U2Q0Y0XSDO",

  showMap : function(){
    $("#map_canvas").show();
    var atlanta = new google.maps.LatLng(33.850033, -83.6500523);
    var options = {
      zoom:9,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: atlanta
    };
    this.map = new google.maps.Map(document.getElementById("map_canvas"), options);
    this.directionsDisplay.setMap(this.map);
    this.mapEnabled = true;
  },

  populateTable : function(){
    var self = this;
    for(var i=0;i<self.tableData.length;i++){
      var item = self.tableData[i];
      $("#table table tbody").append("<tr><td>" + item.venue
       + "</td><td><img src='http://maps.google.com/maps/api/staticmap?sensor=false&zoom=12&size=128x128&markers=" + item.latlng + "' /><br /> " 
       + item.latlng + "</td><td>" + item.tips + "</td></tr>")
    };
  },

  calcRoute : function(){
    var self = this;
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;
    var request = {
      origin:start, 
      destination:end,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    this.directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        if(self.mapEnabled) self.directionsDisplay.setDirections(result);
        var paths = result.routes[0].overview_path
        var steps = Math.floor(paths.length/10);
        for(var i=0;i < paths.length/steps ;i++){
          self.markerArray[i] = paths[i*steps];
        }
        self.getVenues();
      }
    });
  },

  getVenues : function(){
    var self = this;
    var venue = $("#venue").val();
    var url = "https://api.foursquare.com/v2/venues/search"

    for(var j=0;j < this.markerArray.length;j++){
      var latlng = this.markerArray[j].wa + "," + this.markerArray[j].ya;
      var query = "?limit=1&llAcc=1000&query="+venue+"&ll="+latlng+"&oauth_token="+this.token;
      //console.log(url + query);
      $.ajax({
        url: url + query,
        dataType: 'jsonp',
        success: function(resp){
          items = resp.response.groups[0].items
          for(var i=0;i < items.length; i++){
            var location = items[i].location;
            if(self.mapEnabled){
              var marker = new google.maps.Marker({
                position: new google.maps.LatLng(location.lat, location.lng),
                map: self.map,
                title: items[i].name
              });
            }
            self.loadTips(items[i],marker);
          };
        }
      });
    };
  },

  loadTips : function(item,marker){
    var self = this;
    var url = "https://api.foursquare.com/v2/venues/"+item.id+"/tips?oauth_token="+this.token;
    $.ajax({
      url:url, 
      dataType:'jsonp',
      success:function(resp){
        var title = "<h3>"+item.name+"</h3>";
        var text = "";
        var items = resp.response.tips.items;
        for(var i=0;i<items.length;i++){
          var tip = items[i];
          text += "<div class='tip'><img class='profile' alt='"+tip.user.firstName+"' src='"+tip.user.photo+"' />";
          text += tip.text + "</div>";
        }
        if(items.length == 0) text += "No Tips For this Location";
        if(self.mapEnabled){
          var infowindow = new google.maps.InfoWindow({ content: title + text });
          google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(self.map,marker);
          });
        }else{
          self.tableData.push({
            venue : item.name, 
            latlng : item.location.lat + "," + item.location.lng,
            tips: text
          });
          if(self.tableData.length == self.markerArray.length){
            console.log(self.tableData.length);
            self.populateTable();
          }
        }
      }
    });
  }

};

$(document).ready(function(){
  $("#map_button").click(function(){
    Fourmaps.showMap();
    Fourmaps.calcRoute();
    $("#menu").hide();
  });
  $("#table_button").click(function(){
    $("#table").show();
    Fourmaps.calcRoute();
    $("#menu").hide();
  });
});
