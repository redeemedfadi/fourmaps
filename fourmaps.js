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
    }
    this.map = new google.maps.Map(document.getElementById("map_canvas"), options);
    this.directionsDisplay.setMap(this.map);
    this.mapEnabled = true;
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
      console.log(url + query);
      var index = j;
      $.ajax({
        url: url + query,
        dataType: 'jsonp',
        success: function(resp){
          console.log(index);
          items = resp.response.groups[0].items
          for(var i=0;i < items.length; i++){
            var location = items[i].location;
            if(self.mapEnabled){
              var marker = new google.maps.Marker({
                position: new google.maps.LatLng(location.lat, location.lng),
                map: self.map,
                title: items[i].name
              });
              self.loadTips(items[i],marker);
            }else{
              self.tableData.push({
                venue : items[i].name, 
                latlng : location.lat + "," + location.lng,
                tips: self.loadTips(items[i],marker)
              })
            }
          };
        }
      });
      console.log(self.tableData);
    };
  },

  loadTips : function(item,marker){
    var self = this;
    var url = "https://api.foursquare.com/v2/venues/"+item.id+"/tips?oauth_token="+this.token;
    //console.log(url);
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
          console.log(text);
          return text; 
        }
      }
    });
  }

};

$(document).ready(function(){
  $("#map_button").click(function(){
    Fourmaps.showMap();
    Fourmaps.calcRoute();
  });
  $("#table_button").click(function(){
    $("#table").show();
    Fourmaps.calcRoute();
  });
});
