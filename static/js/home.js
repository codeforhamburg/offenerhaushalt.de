$(function() {
  var sites = JSON.parse($('#sites-data').html()),
  selectedState = null;

  var $map = $('#map'),
  $welcome = $('#default-welcome'),
  $listing = $('#listing'),
  listingTemplate = Handlebars.compile($('#listing-template').html());
  cityTemplate = Handlebars.compile($('#city-template').html());

  var width = $map.width(),
      height = $map.height();

  var path = d3.geo.path();

  var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.json(sites.baseurl + "static/img/deu.topo.json", showMap);

  function showMap(error, de) {
    var subunits = topojson.feature(de, de.objects.deu);

    var projection = d3.geo.mercator()
      .center([10.5, 51.35])
      .scale(2500)
      .translate([width / 2, height / 2]);


    var path = d3.geo.path()
      .projection(projection);

    svg.selectAll(".subunit")
      .data(subunits.features)
      .enter().append("path")
      .attr("class", function(d) { return "subunit " + d.properties.code; })
      .attr("d", path)
      .on("mouseover", function(d) {
        if (d.properties.code != selectedState) {
          d3.select(this).transition().duration(200)
          .style({'fill':'#333'});
        }
        if (selectedState===null) {
          renderListing(d.properties);
        }
      })
      .on("mouseout", function(d) {
        if (d.properties.code != selectedState) {
          d3.select(this).transition().duration(500)
          .style({'fill':'#555'});
        }
        if (selectedState===null) {
          renderListing(null);
        }
      })
      .on("click", function(d) {
        if (d.properties.code == selectedState) {
          selectedState = null;
          d3.selectAll('.subunit').style({'fill':'#555'});
          renderListing(null);
        } else {
          selectedState = d.properties.code;
          d3.selectAll('.subunit').style({'fill':'#555'});
          d3.select(this).style({'fill':'#42928F'});
          renderListing(d.properties);
        }

      })
      .transition()
      .duration(400)
      .style('fill', '#555');

    cities = $.grep(sites.sites, function(site){ return typeof site.coordinates !== "undefined"; });
    svg.selectAll('circle')
      .data(cities)
      .enter()
      .append('circle')
      .attr("class", "city")
      .attr("cx", function(site) {
        return projection(site.coordinates)[0];
      })
      .attr("cy", function(site) {
        return projection(site.coordinates)[1];
      })
      .attr("r", 4)
      .on("mouseover", function(d) {
        renderCity(d);
      })
      .on("click", function(d) {
        location.href = d.url;
      });
  }

  function renderListing(state) {
    if (state === null) {
      $listing.hide();
      $welcome.show();
      return;
    }
    $welcome.hide();
    var stateSites = $.grep(sites.sites, function(site) { return site.state == state.code; });
    $listing.html(listingTemplate({
      'sites': stateSites,
      'has_sites': stateSites.length > 0,
      'no_sites': stateSites.length == 0,
      'state': state,
      'relative-baseurl': sites.baseurl
    }));
    $listing.fadeIn(100);
  }

  function renderCity(city) {
    if (city === null) {
      $listing.hide();
      $welcome.show();
      return;
    }
    $welcome.hide();
    $listing.html(cityTemplate({
      'city': city,
      'relative-baseurl': sites.baseurl
    }));
    $listing.fadeIn(100);
  }
});