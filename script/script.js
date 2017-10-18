var units = "Widgets";
var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  width = 700 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

/*format is a function that returns a given number formatted with formatNumber as well as a space
and our units of choice (‘Widgets’). This is used to display the values for the links and nodes later
in the script.*/
var formatNumber = d3.format(",.0f"), // zero decimal places
  format = function(d) {
    return formatNumber(d) + " " + units;
  },

  color = d3.schemeCategory20;


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

// load the data
d3.json("sankey-formatted.json", function(error, graph) {
  //A loop that create the links of between the nodes
  //src https://stackoverflow.com/questions/14629853/json-representation-for-d3-force-directed-networks
  var nodeMap = {};
  graph.nodes.forEach(function(x) {
    nodeMap[x.name] = x; //<---All the name
  });
  graph.links = graph.links.map(function(x) {
    return {
      source: nodeMap[x.source], //<--Start point
      target: nodeMap[x.target], //<--End point
      value: x.value //<--Value
    };
  });


  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

  // add in the links
  var link = svg.append("g").selectAll(".link")
    .data(graph.links)
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
    .data(graph.nodes)
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
    .style("fill", 'red')
    .style("stroke", function(d) {
      return d3.rgb(d.color).darker(2);
    })
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


//load data
d3.csv('data.csv', function(err, data) {
  if (err) throw err;

  //All the music genre that are in the dataset
  var allMusicGenre = ['Dance', 'Folk', 'Country', 'Classical music', 'Musical', 'Pop', 'Rock', 'Metal or Hardrock', 'Punk', 'Hiphop, Rap', 'Reggae, Ska', 'Swing,  Jazz', "Rock 'n Roll", 'Alternative', 'Latino', 'Techno, Trance', 'Opera'];

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

  // //A loop that create the links of between the nodes
  // //src https://stackoverflow.com/questions/14629853/json-representation-for-d3-force-directed-networks
  // var nodeMap = {};
  // nestData.forEach(function(x) {
  //   nodeMap[x.musicGenre] = x;
  //   console.log(nodeMap);
  // });
  //
  // nestData.links = nestData.map(function(x) {
  //   console.log(x);
  //   return {
  //     source: nodeMap[x.source],
  //     target: nodeMap[x.target],
  //     value: x.value
  //   };
  // });

  // var nodeMap = {};
  // graph.nodes.forEach(function(x) {
  //   console.log(graph);
  //   nodeMap[x.name] = x;
  // });
  // graph.links = graph.links.map(function(x) {
  //   return {
  //     source: nodeMap[x.source],
  //     target: nodeMap[x.target],
  //     value: x.value
  //   };
  // });

  //Format data to sankey
  var nodes = [];
  var links = [];
  var sankyData = {nodes, links};

  nestData.forEach(function(d){
    var total = d.movieTotal;
    d.value.forEach(function(data){
      let linkObject = {};
      linkObject.source = d.musicGenre;
      linkObject.target = data.movieGenre;
      linkObject.value = Math.round(data.total/d.movieTotal*100);//calculate the percentage
      links.push(linkObject)
    });
  });

console.log(links);


  sankey
    .nodes(nestData.nodes)
    .links(nestData.links)
    .layout(32);

  // add in the links
  var link = svg.append("g").selectAll(".link")
    .data(nestData.links)
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
    .data(nestData.nodes)
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
    .style("fill", 'red')
    .style("stroke", function(d) {
      return d3.rgb(d.color).darker(2);
    })
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
