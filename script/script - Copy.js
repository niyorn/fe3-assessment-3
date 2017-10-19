var units = "Widgets";
var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  width = 0 - margin.left - margin.right,
  height = 0 - margin.top - margin.bottom;


// append the svg canvas to the page
var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
  .nodeWidth(36)
  .nodePadding(40)
  .size([width, height]);
var path = sankey.link();

var units = "%";

// set the dimensions and margins of the graph
var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  width = 1200 - margin.left - margin.right,
  height = 1500 - margin.top - margin.bottom;

// format variables
var formatNumber = d3.format(",.0f"), // zero decimal places
  format = function(d) {
    return formatNumber(d) + " " + units;
  };
  var color = d3.scaleOrdinal(d3.schemeCategory20);

// append the svg object to the body of the page
var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
  .nodeWidth(36)
  .nodePadding(40)
  .size([width, height]);

var path = sankey.link();

function renderSankeyAllData(){
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
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      });

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
      .attr('id', function(d){//<--here
        return d.name
      })
      .on('click', showOneData)//<--and here
      .style("fill", function(d) {
  		  return d.color = color(d.name.replace(/ .*/, "")); })//<---here
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
function renderSankey(genre){
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
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      });

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
      .attr('id', function(d){//<--here
        return d.name
      })
      .on('click', renderSankeyAllData)//<--and here
      .style("fill", function(d) {
  		  return d.color = color(d.name.replace(/ .*/, "")); })//<---here
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
}
    d3.select('svg').remove();
    function showOneData(d){
    	renderSankey(this.id)
    }

    function remove(){
      //remove element
      d3.selectAll('.node')
        .transition()
        .duration(700)
        .style("opacity", 0)
        .remove();

    //remove element
    d3.selectAll('.link')
      .transition()
      .duration(700)
      .style("opacity", 0)
      .remove();
    }

d3.select(window).on("load", renderSankeyAllData);
