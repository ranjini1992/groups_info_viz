
/*Copyright (c) 2013-2015 Ross Kirsling

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*Code was modified from the original directed graph editor by student Ranjini Aravind */

// set up SVG for D3
var width  = 1000,
    height = 600,
    colors = d3.scale.category10();

var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

var default_html = "<h2>Sorting Hat for new wizards in Hogwarts</h2>"+ 
      "Drag wizards (small circles) to their teams (big circles). </br></br> "+
      "Hover over wizards to see their best skill </br></br>"+  
      "MATHEMATICS : Red </br>"+
      "PROGRAMMING : Orange </br>"+
      "CODE REPOSITORY : Yellow </br>"+
      "USER EXPERIENCE : Dark Green </br>"+
      "COMMUNICATION : Blue </br>"+
      "COLLABORATION : Light Blue </br>"+
      "ART : Pink </br><br><br>"+
      "<h3>What are good teams? <br><br>Atleast... <br>2 Orange (Computer savvy) <br>2 Blue (Team bonders) <br>1 Pink (Artist) <br><br> Total: 8 or 9 wizards</h3> ";


var popup_div = d3.select("body").append("div") 
    .attr("class", "studentDetails")          
    .style("opacity", .9)    
    .html(default_html);  

var svg = d3.select('body')
  .append('svg')
  .attr('oncontextmenu', 'return false;')
  .attr('width', width)
  .attr('height', height);

var skills = ["INFO_VISUALIZATION",
   "STATISTICS",
   "MATHEMATICS",
   "ART",
   "COMPUTER_USE",
   "PROGRAMMING",
   "GRAPHIC_PROGRAMMING",
   "HCI_PROGRAMMING",
   "USER_EXPERIENCE",
   "COMMUNICATION",
   "COLLABORATION",
   "CODE_REPOSITORY"]

//orange or red is programming, blue is communication collab, pink is art, green is ux info viz
var skill_colours= ["#00FF11", //green
  "#FF8484", //light red - peach 
  "#FF4362", //red
  "#F277FF", //pink
  "#FFAB00", //orange
  "#FF9100", //dark orange
  "#FF6600", //darker orange
  "#FFBC00", //gold
  "#01900A", //dark green
  "#0080FF", //blue
  "#00DEFF", //light blue
  "#FFE600" //yellow
]

//good team = 3 programmers, 2 communication/collab, 1 art, 2 others
//10 teams: min 8 members max 9 members

var teams =[[],[],[],[],[],[],[],[],[],[]]


// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
  var nodes = [
    {id: 0, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Quizard" },
    {id: 1, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Nitwit"},
    {id: 2, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Quibler"},
    {id: 3, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Diadem"},
    {id: 4, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Snitch"},
    {id: 5, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Fawks"},
    {id: 6, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Jinx"},
    {id: 7, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Muggle"},
    {id: 8, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Ferret"},
    {id: 9, reflexive: true, colour: "#FFFFFF", good_team: false, title: "Animagi"}],
  lastNodeId = 9,
  links = [];

  d3.json("https://ranjini1992.github.io/groups_info_viz/flare.json", function(error, data) {
  if (error) throw error;
  var count= 0
   data.forEach(function(student) {
      count++;
      node = {id: ++lastNodeId, reflexive: false};
      node.x = 50;
      node.y = 50;
      node.title = "ʘ_ʘ";

      //description text
      //node.student = student;
      var description = "<h2>" + student.NAME + "</h2><h3>" 
        + student.MAJOR + "<br/>" + student.COURSE +"</h3>";
        if(student.HOBBIES) { description = description + "<h4><i>\"" + student.HOBBIES + "\"</i></h4><br/>"; }
      description = description + "<h4> Skills (out of 10) </h4>";
      node.team = -1;
      top_skill_index = 0;
      for(var i =0; i < skills.length; i++){
        if(Number(student[skills[i]]) > Number(student[skills[top_skill_index]])){
          top_skill_index = i;
        }
        if(student[skills[i]] >= 5 )   { description = description + skills[i] + ": " + student[skills[i]] + "<br/>" }
 
      }
      node.description = description;
      node.top_skill_index = top_skill_index;
      node.colour = skill_colours[top_skill_index];
      nodes.push(node);

    });

     restart();

});

// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(60)
    .charge(-100)
    .on('tick', tick)

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 0 0 0')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')

    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 0 0 0')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')

    .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// update graph (called when needed)
function restart() {

  for(var i= 0; i<teams.length; i++){
    nodes[i].good_team = false;
    if(teams[i].length >= 8){
      var computer  = 0;
      var collab = 0;
      var artist = 0
      for(var j = 0; j<teams[i].length; j++){
        var top_skill = nodes[teams[i][j]].top_skill_index;
        if(top_skill >= 4 && top_skill <= 7){
          computer++;
        }
        else if(top_skill == 9 || top_skill == 10){
          collab++;
        }
        else if(top_skill == 3 ){
          artist++;
        }
      }
      if(computer >= 2 && collab >= 2 && artist >=1){
        nodes[i].good_team = true;
      }
    }
  }
  // path (link) group
  path = path.data(links);

  // update existing links
  path.style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d.reflexive) return;

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
      restart();
    });

  // remove old links
  path.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return d.colour; })
    .classed('reflexive', function(d) { return d.reflexive; });


  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r',  function(d) { return d.reflexive ? 25 : 15; })
    .style('fill', function(d) { return d.colour; })
    .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
          var message = "";
          if(d.reflexive) {
            if(d.good_team){
              d3.select(this).style("fill", "LIGHTSEAGREEN");
              message = "Good Team!";
            }else{
              if(teams[d.id].length == 0){
               message = "Add wizards to the team";
              }else{
               message = "Diversify team skills";
              }
            }
            div.transition()    
                  .duration(200)    
                  .style("opacity", .9);    
              div .html(message)  
                  .style("left", (d3.event.pageX) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px"); 
            return;
          } 
          d3.select(this).attr({
            r: 20
          });

          div.transition()    
            .duration(200)    
            .style("opacity", .9);    
          div .html("Good at " + skills[d.top_skill_index].toLowerCase())  
            .style("left", (d3.event.pageX) + "px")   
            .style("top", (d3.event.pageY - 28) + "px");  
          popup_div.transition()    
            .duration(200)    
            .style("opacity", .9);
            popup_div .html(d.description);
          
        })
    .on('mouseout', function(d) {
      if(d.reflexive) {
        d3.select(this).style("fill", "white");
      }   
      else{
        d3.select(this).attr({
          r: 15
        });
        popup_div.transition()    
          .duration(200)    
          .style("opacity", .9);    
        popup_div .html(default_html);  
      }
      div.transition()    
        .duration(500)    
        .style("opacity", 0); 
    })
    .on('mousedown', function(d) {
      if(d.reflexive) return;

      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) selected_node = null;
      else selected_node = mousedown_node;
      selected_link = null;

      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      restart();
    })
    .on('mouseup', function(d) {
      if(!mousedown_node || !d.reflexive) return;

      if(teams[d.id].length < 9){
        if(mousedown_node.team != -1){
          spliceLinksForNode(nodes[mousedown_node.team], mousedown_node);
        }
        mousedown_node.team = d.id;
        teams[d.id].push(mousedown_node.id)
     

        var text = d3.select('svg').selectAll('text')[0]

        for (var i=0; i<text.length; i++){
            if(i == mousedown_node.id){
              text[i].innerHTML = "ʘ‿ʘ";
          }
        }
      // needed by FF
        drag_line
          .classed('hidden', true)
          .style('marker-end', '');

      // check for drag-to-self
        mouseup_node = d;
        if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

        // unenlarge target node
        d3.select(this).attr('transform', '');

        // add link to graph (update if exists)
        // NB: links are strictly source < target; arrows separately specified by booleans
        var source, target, direction;
        if(mousedown_node.id < mouseup_node.id) {
          source = mousedown_node;
          target = mouseup_node;
          direction = 'right';
        } else {
          source = mouseup_node;
          target = mousedown_node;
          direction = 'left';
        }

        var link;
        link = links.filter(function(l) {
          return (l.source === source && l.target === target);
        })[0];

        if(link) {
          link[direction] = true;
        } else {
          link = {source: source, target: target, left: false, right: false};
          link[direction] = true;
          links.push(link);
        }

        // select new link
        selected_link = link;
        selected_node = null;
        restart();
      }
    });

   g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) {return d.title});

    

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

function mousedown() {

  svg.classed('active', true);

  if( mousedown_node || mousedown_link) return;


  restart();
}

function mousemove() {
  if(!mousedown_node) return;

  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  restart();
}

function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(source_node, target_node) {
  var toSplice = links.filter(function(l) {
    return (l.source === source_node && l.target === target_node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });

  for (var key = teams[target_node.team].length - 1; key >= 0; key --) {
        if (teams[target_node.team][key] === target_node.id) {
            teams[target_node.team].splice(key, 1);
            break;       
        }
    }
}


// app starts here
svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup)

restart();
