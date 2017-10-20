var units = "%";
var margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
};
var width = d3.select(".sankey-chart-container").node();
width = (width.getBoundingClientRect().width) - margin.left - margin.right; //get width of container
var height = 1400 - margin.top - margin.bottom;

// append the svg canvas to the page
var svg = d3.select(".sankey-chart-container").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// format variables
var formatNumber = d3.format(",.0f"), // zero decimal places
  format = function(d) {
    return formatNumber(d) + " " + units;
  };
var color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
var sankey = d3.sankey()
  .nodeWidth(36)
  .nodePadding(40)
  .size([width + 1000, height]);

var path = sankey.link();

//-----------------------------------------------------------------------------------------
//onload show all data
d3.select(window).on("load", renderSankeyAllData);
//Render all data
function renderSankeyAllData() {
  //remove exiting object
  remove();
  //load data
  d3.csv('data.csv', function(err, data) {
    if (err) throw err;

    //my code from here --->
    //All the music genre that are in the dataset
    var allMusicGenre = ['Dance', 'Folk', 'Country', 'Classical music', 'Musical', 'Pop', 'Rock', 'Metal or Hardrock', 'Punk', 'Hiphop, Rap', 'Reggae, Ska', 'Alternative', 'Latino', 'Techno, Trance', 'Opera'];

    //All the movie  genre that are in the dataset
    var allMovieGenre = ['Horror', 'Thriller', 'Comedy', 'Romantic', 'Sci-fi', 'War', 'Fantasy/Fairy tales', 'Animated', 'Documentary', 'Western', 'Action'];

    var nestData = [];
    //This function will get all the position from the data of the //people who like a specific genre.
    allMusicGenre.forEach(function(musicGenre) {
      let music = {};
      let total = 0;
      let movieTotals = 0;
      let like = 3;
      let allPosition = [];
      var value = [];

      //Push all the postion to an array
      data.forEach(function(d, position) {
        if (d[musicGenre] > like) {
          allPosition.push(position);
          total++;
        };
      });

      //We now know the position. From there we want to know which
      //movie genre they like. This function will do just that
      allMovieGenre.forEach(function(movieGenre) {
        let movieValue = {};
        let movieTotal = 0;
        allPosition.forEach(function(position) {
          if (data[position][movieGenre] > like) {
            movieTotal++;
            movieTotals++;
          }
        });
        //Save all the data that we get into a value array
        movieValue.movieGenre = movieGenre;
        movieValue.total = movieTotal;
        value.push(movieValue);
      });

      music.value = value;
      music.musicGenre = musicGenre;
      music.total = total;
      music.movieTotal = movieTotals;
      nestData.push(music) //save everything in an array
    });

    //
    //              Create graph
    //

    //Format data to sankey
    var nodes = [];
    var links = [];
    var sankeyData = {
      nodes,
      links
    };

    //function that get the source, target and value for the links
    nestData.forEach(function(d) {
      var total = d.movieTotal;
      d.value.forEach(function(data) {
        let linkObject = {};
        linkObject.source = d.musicGenre;
        linkObject.target = data.movieGenre;
        linkObject.value = Math.round(data.total / d.movieTotal * 100); //calculate the percentage
        links.push(linkObject)
      });
    });

    //Get all nodes
    allMusicGenre.forEach(function(d) {
      var node = {}
      node.name = d;
      nodes.push(node);
    });
    allMovieGenre.forEach(function(d) {
      var node = {}
      node.name = d;
      nodes.push(node);
    });
    //<-- to here | my code

    //this code come from here https://stackoverflow.com/questions/14629853/json-representation-for-d3-force-directed-networks
    var nodeMap = {};
    sankeyData.nodes.forEach(function(x) {
      nodeMap[x.name] = x;
    });
    sankeyData.links = sankeyData.links.map(function(x) {
      return {
        source: nodeMap[x.source],
        target: nodeMap[x.target],
        value: x.value
      };
    });

    //black magic
    sankey
      .nodes(sankeyData.nodes)
      .links(sankeyData.links)
      .layout(102);

    // add in the links
    var link = svg.append("g").selectAll(".link")
      .data(sankeyData.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .attr("stroke-dashoffset", "1870")
      .attr("stroke-dasharray", "1870")
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      });

    //call transition
    transition();

    // add the link titles
    link.append("title")
      .text(function(d) {
        return d.source.name + " → " +
          d.target.name + "\n" + format(d.value);
      });
    // add in the nodes
    var node = svg.append("g").selectAll(".node")
      .data(sankeyData.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // add the rectangles for the nodes
    node.append("rect")
      .attr("height", function(d) {
        return d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .attr('id', function(d) { //<--here
        return d.name
      })
      .on('click', showOneData) //<--and here
      .style("fill", function(d) {
        return d.color = color(d.name.replace(/ .*/, ""));
      }) //<---here
      .append("title")
      .text(function(d) {
        return d.name + "\n" + format(d.value);
      });

    // add in the title for the nodes
    node.append("text")
      .attr("x", -6)
      .attr("y", function(d) {
        return d.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) {
        return d.name;
      })
      .filter(function(d) {
        return d.x < width / 2;
      })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
  });

};


//Function that render sanky
function renderSankey(genre) {
  //remove element
  remove();
  //load data
  d3.csv('data.csv', function(err, data) {
    if (err) throw err;

    //my code from here --->
    //All the music genre that are in the dataset
    var allMusicGenre = [genre];

    //All the movie  genre that are in the dataset
    var allMovieGenre = ['Horror', 'Thriller', 'Comedy', 'Romantic', 'Sci-fi', 'War', 'Fantasy/Fairy tales', 'Animated', 'Documentary', 'Western', 'Action'];

    var nestData = [];
    //This function will get all the position from the data of the //people who like a specific genre.
    allMusicGenre.forEach(function(musicGenre) {
      let music = {};
      let total = 0;
      let movieTotals = 0;
      let like = 3;
      let allPosition = [];
      var value = [];

      //Push all the postion to an array
      data.forEach(function(d, position) {
        if (d[musicGenre] > like) {
          allPosition.push(position);
          total++;
        };
      });

      //We now know the position. From there we want to know which
      //movie genre they like. This function will do just that
      allMovieGenre.forEach(function(movieGenre) {
        let movieValue = {};
        let movieTotal = 0;
        allPosition.forEach(function(position) {
          if (data[position][movieGenre] > like) {
            movieTotal++;
            movieTotals++;
          }
        });
        //Save all the data that we get into a value array
        movieValue.movieGenre = movieGenre;
        movieValue.total = movieTotal;
        value.push(movieValue);
      });

      music.value = value;
      music.musicGenre = musicGenre;
      music.total = total;
      music.movieTotal = movieTotals;
      nestData.push(music) //save everything in an array
    });

    //
    //              Create graph
    //

    //Format data to sankey
    var nodes = [];
    var links = [];
    var sankeyData = {
      nodes,
      links
    };

    //function that get the source, target and value for the links
    nestData.forEach(function(d) {
      var total = d.movieTotal;
      d.value.forEach(function(data) {
        let linkObject = {};
        linkObject.source = d.musicGenre;
        linkObject.target = data.movieGenre;
        linkObject.value = Math.round(data.total / d.movieTotal * 100); //calculate the percentage
        links.push(linkObject)
      });
    });

    //Get all nodes
    allMusicGenre.forEach(function(d) {
      var node = {}
      node.name = d;
      nodes.push(node);
    });
    allMovieGenre.forEach(function(d) {
      var node = {}
      node.name = d;
      nodes.push(node);
    });
    //<-- to here | my code

    //this code come from here https://stackoverflow.com/questions/14629853/json-representation-for-d3-force-directed-networks
    var nodeMap = {};
    sankeyData.nodes.forEach(function(x) {
      nodeMap[x.name] = x;
    });
    sankeyData.links = sankeyData.links.map(function(x) {
      return {
        source: nodeMap[x.source],
        target: nodeMap[x.target],
        value: x.value
      };
    });

    sankey
      .nodes(sankeyData.nodes)
      .links(sankeyData.links)
      .layout(32);

    // add in the links
    var link = svg.append("g").selectAll(".link")
      .data(sankeyData.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .attr("stroke-dashoffset", "1870")
      .attr("stroke-dasharray", "1870")
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      });

    //transition
    transition();

    // add the link titles
    link.append("title")
      .text(function(d) {
        return d.source.name + " → " +
          d.target.name + "\n" + format(d.value);
      });
    // add in the nodes
    var node = svg.append("g").selectAll(".node")
      .data(sankeyData.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // add the rectangles for the nodes
    node.append("rect")
      .attr("height", function(d) {
        return d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .attr('id', function(d) { //<--here
        return d.name
      })
      .on('click', renderSankeyAllData) //<--and here
      .style("fill", function(d) {
        return d.color = color(d.name.replace(/ .*/, ""));
      }) //<---here
      .append("title")
      .text(function(d) {
        return d.name + "\n" + format(d.value);
      });

    // add in the title for the nodes
    node.append("text")
      .attr("x", -6)
      .attr("y", function(d) {
        return d.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) {
        return d.name;
      })
      .filter(function(d) {
        return d.x < width / 2;
      })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

    renderBarChart(sankeyData);
  });
}

function renderBarChart(data) {
  var data = data.nodes;
  data.shift(); // remove the first because that is the object that you clicked on
  var margin = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 100
  };

  var width = 600 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;

  var svgBar = d3.select(".bar-chart-container")
    .append('svg')
    .attr('width', 'auto')
    .attr('height', 'auto');

  var g = svgBar.append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //y Scale
  var yAs = d3.scaleBand()
    .range([0, height])
    .paddingInner(0.3)
    .domain(data.map(
      function(d) {
        return d.name
      }
    ));

  //x Scale
  var xAs = d3.scaleLinear()
    .range([0, width])
    .domain([0, d3.max(data, function(d) {
      return d.value;
    })]);

  //create the x-as
  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(yAs));

  //create the y-as
  g.append('g')
    .attr('class', 'axis axis--x')
    .call(d3.axisBottom(xAs))
    .attr('transform', 'translate(0,' + height + ')');

  //binding
  var rectBar = g.append('g').selectAll('rect').data(data);
  //This will be the underweight bar
  rectBar.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', '0')
    .attr('y', function(d) {
      return yAs(d.name);
    })
    .attr('widht', 0)
    .transition()
    .duration(3500)
    .attr('width', function(d) {
      return xAs(d.value);
    })
    .attr('height', yAs.bandwidth())
    .style("fill", function(d) {
      return d.color = color(d.name.replace(/ .*/, ""));
    });
}

//this function give the Id that is also the argument that we
//will search in the dataset
function showOneData(d) {
  renderSankey(this.id)
}

//remove all the node and link
function remove() {
  //remove element
  d3.selectAll('.node')
    .transition()
    .duration(700)
    .style("opacity", 0)
    .remove();

  //remove element
  d3.selectAll('.link').remove()
    .transition()
    .duration(700)
    .style("opacity", 0)
    .remove();

  d3.selectAll('.bar-chart-container svg')
    .transition()
    .duration(1000)
    .style("opacity", 0)
    .remove();
}

//transition function
function transition() {
  var path = d3.selectAll('.link');
  path
    .transition()
    .duration(4000)
    .attr("stroke-dashoffset", "0");
}
