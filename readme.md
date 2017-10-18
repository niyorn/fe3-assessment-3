## Proces

The first thing I did was download the source file of the sanky plugin. From this source it will create this sanky.
![sanky example](assets/image/sanky-examle.PNG)

To get the the graph working we need to format our dataset to a dataset that looks like this:

{
"nodes":[
{"name":"Barry"},
{"name":"Frodo"},
{"name":"Elvis"},
{"name":"Sarah"},
{"name":"Alice"}
],

"links":[
{"source":"Barry","target":"Sarah","value":2},
{"source":"Barry","target":"Alice","value":2},
{"source":"Frodo","target":"Sarah","value":4},
{"source":"Elvis","target":"Alice","value":2},
{"source":"Elvis","target":"Sarah","value":2}
]}

The 'nodes' are the blocks.
And the links cooordinate which nodes needs to connect with each other.

### Format the data
First of all I created an array that saved all the music genre that there is in the dataset;
From there I created a function that search for all the people that like specific genre.
The function looks like this:
```javascript
//All the music genre that are in the dataset
var allMusicGenre = ['Dance', 'Folk', 'Country', 'Classical music', 'Musical', 'Pop', 'Rock', 'Metal or Hardrock', 'Punk', 'Hiphop, Rap', 'Reggae, Ska', 'Swing,  Jazz', "Rock 'n Roll", 'Alternative', 'Latino', 'Techno, Trance', 'Opera'];

var nestData = [];

allMusicGenre.forEach(function(musicGenre) {
  let music = {};
  let total = 0;
  let like = 3;
  let allPosition = [];
  var value =[];

  data.forEach(function(d, position) {
    if (d[musicGenre] > like) {
      allPosition.push(position);
      total++;
    };
  });

  music.value = value;
  music.musicGenre = musicGenre;
  music.total = total;
  nestData.push(music)
});
```
This function will give this result:
```
0: {value: Array(11), musicGenre: "Dance", total: 376}
1: {value: Array(11), musicGenre: "Folk", total: 144}
2:{value: Array(11), musicGenre: "Country", total: 118}
3 etc
```

From there we want to know how many of these people like a specific genre.
This function will do just that:
```javascript
allMovieGenre.forEach(function(movieGenre){
  let movieValue = {};
  let movieTotal = 0;
  allPosition.forEach(function(position){
      if(data[position][movieGenre] > like){
        movieTotal++;
      }
  });
  movieValue.movieGenre = movieGenre;
  movieValue.total = movieTotal;
  value.push(movieValue);
});
```
And from that we got this as result;
```
musicGenre:"Dance"
total:376
value: Array(11)
0:{movieGenre: "Horror", total: 139}
1:{movieGenre: "Thriller", total: 203}
2:{movieGenre: "Comedy", total: 343}
3:{movieGenre: "Romantic", total: 214}
4:{movieGenre: "Sci-fi", total: 149}
5 etc
```
Ok now that we have that, lets look at sankey function again and look how it want its data presented. src: https://stackoverflow.com/questions/14629853/json-representation-for-d3-force-directed-networks.
```javascript
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
```
If we look at that function, we can see it wants a 'source', a 'target' and a 'value'.
In our nestData we all have this information. We will create a function that get all the 'source' and value;
The function looks like this:
```javascript
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
```

that will give us this:
```
1:{source: "Dance", target: "Thriller", value: 9}
2:{source: "Dance", target: "Comedy", value: 16}
3:{source: "Dance", target: "Romantic", value: 10}
4:{source: "Dance", target: "Sci-fi", value: 7}
5:{source: "Dance", target: "War", value: 7}
6:{source: "Dance", target: "Fantasy/Fairy tales", value: 11}
7:{source: "Dance", target: "Animated", value: 11}
8:{source: "Dance", target: "Documentary", value: 10}
9:{source: "Dance", target: "Western", value: 2}
10:{source: "Dance", target: "Action", value: 11}
etc
```

## TODO

*   [ ] [GitHub Pages](#github-pages)
*   [ ] [Metadata](#metadata)
*   [ ] [Issues](#issues)
*   [ ] Replace this document in your fork with your own readme!

## GitHub Pages

Set up [GitHub Pages][pages] for this fork through the **Settings** pane.  Use
the **Master branch** as its source.  Do not choose a Jekyll template.

## Metadata

Edit the **description** and **url** of your repository.  Click on edit above
the green Clone or download button and fill in a correct description and use the
`github.io` URL you just set up.

## Issues

Enable issues so we can give feedback by going to the settings tab of your fork
and checking the box next to `issues`.

[banner]: https://cdn.rawgit.com/cmda-fe3/logo/a4b0614/banner-assessment-3.svg

[a2]: https://github.com/cmda-fe3/course-17-18/tree/master/assessment-3#description

[fe3]: https://github.com/cmda-fe3

[cmda]: https://github.com/cmda

[pages]: https://pages.github.com
