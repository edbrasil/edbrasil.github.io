  
  var height = 1500,
      width = 1750,
      curve_width = 20,
      entry_width = (.7*width - 10*curve_width)/11
      top_buffer = 2;

  var svg = d3.select("#brack_div").attr("class","maindiv").append("svg")
                          .attr("id", "brack_viz")
                          .attr("class","shadow")
                          .attr("viewBox","0 0 " + width + " " + height);

  var svg2 = d3.select('#win_div')


  var rounds = [64, 32, 16, 8, 4, 2, 1]

  // Start drawing left side

  var i;
  //var loc = "https://raw.githubusercontent.com/edbrasil/tennis_machine_learning/master/US%20Open%202019/"
  var loc =document.getElementById("mainjs").getAttribute("loc");

var dropdown = d3.select("#json_sources")
var change = function() {
  var source = dropdown.node().options[dropdown.node().selectedIndex].value;
  svg.selectAll('*').remove()
  svg2.selectAll('*').remove()

  d3.queue()
    .defer(d3.json, loc + source)
    .defer(d3.json, loc + "C_picks.json")

    .await(function(error, file, c_file) {
     // console.log(c_file)
     function getRound(j, use_file) {
        if (j==0) {return use_file["Round 1"]}
        else if (j==1) {return use_file["Round 2"]}
        else if (j==2) {return use_file["Round 3"]}
        else if (j==3) {return use_file["Round 4"]}
        else if (j==4) {return use_file["Quarterfinal"]}
        else if (j==5) {return use_file["Semifinal"]}
        else if (j==6) {return use_file["Final"]}
      }

      rounds.forEach( function (d, j) {
        var entry_height = height/d;
        if (j > 0) {
          for (i = 0; i < rounds[j-1]; i++) {
            var x = (entry_width)*j + (j-1)*curve_width;
            var y = (i + 0.5)*(entry_height/2)+top_buffer;
            var a = i % 2 == 0 ? 0.25:-0.25;
              svg.append("path").attr("d", "M" + x + " " + y + " " + (x + entry_width/4 -curve_width/10) + " " + (y + a*entry_height)).attr("stroke", "#3b3b3b").attr("stroke-width", 1);
          }
        }
        for (i = 0; i < d; i++){
          function correct(j,i){
              //if ((j != 0) && (getRound(j,c_file)[0][0]) != ""){
              if ((j != 0) && (getRound(j,c_file)[i][0] != "")){
                if (getRound(j,file)[i][0] == getRound(j,c_file)[i][0]){return "green"} else {return "red"}
                }
              else {return "#3b3b3b"}
           }//}

          function correct_new(j,i, next_elem){
              //if ((j != 0) && (getRound(j,c_file)[0][0]) != ""){
              if ((j != 0) && (getRound(j,c_file)[i][0] != "")){
                if (next_elem.innerHTML == getRound(j,c_file)[i][0]){return "green"} else {return "red"}
                }
              else {return "#3b3b3b"}
            }//}
          var right_pick = correct(j,i)                        

          var x = (entry_width + curve_width)*j;
          var y = (i + 0.5)*entry_height+top_buffer;
          svg.append("path").attr("id","lpath" + j + "_" + i).attr("d", "M" + x + " " + y + " l " + entry_width + " 0").attr("stroke", "#3b3b3b").attr("stroke-width", 1);
          svg.append("text")
            .attr("id","lfill" + j + "_" + i)
            .attr("fill", right_pick)
            .attr("dy",function(d){if (j == 0){return "-2"} else {return "-5"}})
            .append("textPath")
            .attr("id","ltext" + j + "_" + i)
            .attr("xlink:href","#lpath" + j + "_" + i)
            .attr("startOffset","10%")
            .attr("text-decoration",function(d){if (right_pick == "red"){return "line-through"}})
            .attr("class",function (d) {if (j == 0) {return "size1"} 
                                        else if (j == 1) {return "size2"}
                                        else {return "size3"}})
            .text(getRound(j,file)[i][0])
            .on("click", ClickFct)
            .on("mouseover",function(d) { d3.select(this).style("cursor","pointer");})
            .on("mouseout",function(d) {d3.select(this).style("cursor","default");})
            ;


            function ClickFct(d){
              //Get i and j from this element
              j_click = Number(this.id.substring(5,6));
              i_click = Number(this.id.substring(7));

              //Handle the winner separate
              if (j_click != 6) {

              //Find next element's i and j
              var next_j = j_click + 1,
                  next_i = (i_click - (i_click % 2))/2;
                  next_elem = document.getElementById("ltext" + next_j + "_" + next_i);

                  //Keep old element's value to determine which lines to clear
                  old_elem = next_elem.innerHTML;
                  next_elem.innerHTML = this.innerHTML;
                  getRound(next_j,file)[next_i][0] = this.innerHTML;
                  getRound(next_j,file)[next_i][1] = "";

              //Determine if the pick is correct and set properties
              var right_pick = correct_new(next_j, next_i, next_elem);
              d3.select("#lfill"+ next_j + "_" + next_i)
                .attr("fill",right_pick);
              d3.select("#ltext" + next_j + "_" + next_i)
                .attr("text-decoration",function(d){if (right_pick == "red"){return "line-through"}
                                    else {return "none"} });
              
              //Loop over latter rounds to see if any need to be cleared out
              for (j = next_j + 1; j <= 6; j++){
                next_i = (next_i - (next_i % 2))/2;
                j_next_elem = document.getElementById("ltext" + j + "_" + next_i)
                if (j_next_elem.innerHTML == old_elem){
                    getRound(j,file)[next_i][0] = "";
                    getRound(j,file)[next_i][1] = "";
                    d3.select("#ltext" + j + "_" + next_i)
                      .text("")
                      .attr("text-decoration","none")
                  }
              }

              //Clear winner if needed
              if (document.getElementById("win_text").innerHTML == old_elem){
                file["Winner"][0][0] = "";
                file["Winner"][0][1] = "";
                d3.select("#win_text")
                   .text("")
                   .attr("text-decoration","none")
              }

              }
              //Check winner
              else {
               next_elem = document.getElementById("win_text");
               next_elem.innerHTML = this.innerHTML;
               file["Winner"][0][0] = this.innerHTML;
               d3.select("#win_text")
                 .attr("fill",function(d){if (next_elem.innerHTML == c_file["Winner"][0][0]){return "green"} 
                                          else if (c_file["Winner"][0][0] == ""){return "#3b3b3b"}
                                          else {return "red"}})
                 .attr("text-decoration",function(d){if ((c_file["Winner"][0][0] != "" && next_elem.innerHTML != c_file["Winner"][0][0])){return "line-through"}
                                                     else {return "none"}})
            }
            //console.log(file)
          }
        }
      });

      var right = svg.append("g").attr("transform", "translate(" + width + ",0) scale(-1,1)")

      rounds.forEach( function (d, j) {
        var entry_height = height/d;
        if (j > 0) {
          for (i = 0; i < rounds[j-1]; i++) {
            var x =(entry_width)*j + (j-1)*curve_width;
            var y = (i + 0.5)*(entry_height/2)+top_buffer;
            var a = i % 2 == 0 ? 0.25:-0.25;
              right.append("path").attr("d", "M" + x + " " + y + " " + (x + entry_width/4 -curve_width/10) + " " + (y + a*entry_height)).attr("stroke", "#3b3b3b").attr("stroke-width", 1);
          }
        }
        for (i = 0; i < d; i++){
            function correct(j,i){
              // if ((j != 0) && (getRound(j,c_file)[0][0]) != ""){
              if ((j != 0) && (getRound(j,c_file)[i + 2 **(6-j)][0] != "")){
                if (getRound(j,file) [i + 2 **(6-j)][0] == getRound(j,c_file) [i + 2 **(6-j)][0]) {return "green"} else {return "red"}
               }
              else {return "#3b3b3b"}
            }//}
          function correct_new(j,i, next_elem){
              // if ((j != 0) && (getRound(j,c_file)[0][0]) != ""){
              if ((j != 0) && (getRound(j,c_file)[i + 2 **(6-j)][0] != "")){
                if (next_elem.innerHTML == getRound(j,c_file) [i + 2 **(6-j)][0]) {return "green"} else {return "red"}
              }
              else {return "#3b3b3b"}
            } //}             
          var right_pick = correct(j,i)  
          var x = (entry_width + curve_width)*j;
          var entry_pos = 2*x + entry_width;
          var y = (i + 0.5)*entry_height+top_buffer;
          right.append("path").attr("id","rpath" + j + "_" + i).attr("d", "M" + x + " " + y + " l " + entry_width + " 0").attr("stroke", "#3b3b3b").attr("stroke-width", 1);
          right.append("text")
            .attr("id","rfill" + j + "_" + i)
            .attr("fill", right_pick)
            .attr("transform","translate(" + entry_pos +",0) scale(-1,1)")
            .attr("dy",function(d){if (j == 0){return "-2"} else {return "-5"}})
            .append("textPath")
            .attr("id","rtext" + j + "_" + i)
            .attr("xlink:href","#rpath" + j + "_" + i)
            .attr("startOffset","10%")
            .attr("text-decoration",function(d){if (right_pick == "red"){return "line-through"}})
            .attr("class",function (d) {if (j == 0) {return "size1"} 
                                        else if (j == 1) {return "size2"}
                                        else {return "size3"}})
            .text(getRound(j,file)[i + 2 **(6-j)][0])
            .on("click", ClickFct)
            .on("mouseover",function(d) { d3.select(this).style("cursor","pointer");})
            .on("mouseout",function(d) {d3.select(this).style("cursor","default");})
            ;

            function ClickFct(d){
              //Get this node's i and j
              j_click = Number(this.id.substring(5,6));
              i_click = Number(this.id.substring(7));

              //Only handle rounds up to the final, winner handled later
              if (j_click != 6) {

              //Get next element
               var next_j = j_click + 1,
                  next_i = (i_click - (i_click % 2))/2,
                  next_elem = document.getElementById("rtext" + next_j + "_" + next_i);
                  old_elem = next_elem.innerHTML;
               
               next_elem.innerHTML = this.innerHTML;
               getRound(next_j,file)[next_i+ 2 **(6-next_j)][0] = this.innerHTML;
               getRound(next_j,file)[next_i+ 2 **(6-next_j)][1] = "";

              //Determine if pick is correct and set properties
              var right_pick = correct_new(next_j, next_i, next_elem);
              d3.select("#rfill"+ next_j + "_" + next_i)
                .attr("fill",right_pick);
              d3.select("#rtext" + next_j + "_" + next_i)
                .attr("text-decoration",function(d){if (right_pick == "red"){return "line-through"}
                                    else {return "none"} });

              //Loop through latter rounds to see if any need to be cleared out
              for (j = next_j + 1; j <= 6; j++){
                next_i = (next_i - (next_i % 2))/2;

                j_next_elem = document.getElementById("rtext" + j + "_" + next_i)

                if (j_next_elem.innerHTML == old_elem){
                    getRound(j,file)[next_i+ 2 **(6-j)][0] = "";
                    getRound(j,file)[next_i+ 2 **(6-j)][1] = "";
                    d3.select("#rtext" + j + "_" + next_i)
                      .text("")
                      .attr("text-decoration","none")
                  }
              }

              if (document.getElementById("win_text").innerHTML == old_elem){
                file["Winner"][0][0] = "";
                file["Winner"][0][1] = "";
                d3.select("#win_text")
                   .text("")
                   .attr("text-decoration","none")
              }
              }
              //Check winner
              else {
               next_elem = document.getElementById("win_text");
               next_elem.innerHTML = this.innerHTML;
               file["Winner"][0][0] = this.innerHTML;
               file["Winner"][0][1] = "";
               d3.select("#win_text")
                 .attr("fill",function(d){if (next_elem.innerHTML == c_file["Winner"][0][0]){return "green"}
                                          else if (c_file["Winner"][0][0] == ""){return "#3b3b3b"}
                                          else {return "red"}})
                 .attr("text-decoration",function(d){if ((c_file["Winner"][0][0] != "" && next_elem.innerHTML != c_file["Winner"][0][0])){return "line-through"}
                                                     else {return "none"}})
              }
              console.log(JSON.stringify(file))
            }
        }
      });

      var winner = d3.select("#win_div").attr("class","overdiv").append("svg")
                          .attr("id", "win_viz")
                          .attr("class","shadow")
                          .attr("viewBox","0 0 " + (entry_width*1.5) + " " + (height* 0.05));

      var borderPath = winner.append("rect")
        .attr("width",entry_width*1.5)
        .attr("height", height * 0.05)
        .attr("fill","white")
        .attr("fill-opacity",100)
        .attr("x",0)
        .attr("y",0);

      var greenRect = winner.append("rect")
        .attr("width",entry_width*1.5)
        .attr("height", height * 0.05 *0.4)
        .attr("fill","limegreen")
        .attr("fill-opacity",100)
        .attr("x",0)
        .attr("y",0);

      var winnerText = winner.append("text")
        .attr("x",entry_width*0.5)
        .attr("y",height*(0.014))
        .attr("fill","white")
        .attr("class","winn")
        .text("WINNER")

      var winnerFinal = winner.append("text")
        .attr("id","win_text")
        .attr("x",entry_width*0.275)
        .attr("y",height*(0.04))
        .attr("class","winnp")
        .attr("fill",function(d){if (file["Winner"][0][0] == c_file["Winner"][0][0]){return "green"}
                                 else if (c_file["Winner"][0][0] == ""){return "#3b3b3b"}
                                 else {return "red"}})
        .attr("text-decoration",function(d){if ((file["Winner"][0][0] != c_file["Winner"][0][0]) && c_file["Winner"][0][0] != ""){return "line-through"}})
        .text(file["Winner"][0][0])

      var vs_circle = svg.append("g")

      var circle = vs_circle.append("circle")
        .attr("r", 50)
        .attr("cx",width*0.5)
        .attr("cy",height*0.5)
        .attr("fill","lightgray")

      var circleText = vs_circle.append("text")
        .attr("x", width*0.5 - 23)
        .attr("y", height*0.5 + 12)
        .attr("style","font:35px sans-serif; font-weight:bold")
        .attr("fill","white")
        .text("VS")
  })
}

dropdown.on("change", change)
change(); //trigger json on load
;

// </script>