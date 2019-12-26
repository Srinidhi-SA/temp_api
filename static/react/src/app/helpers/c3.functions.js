export const c3Functions={

get_colors: function(color, d){
  return colors[d.index];
},


set_tooltip:  function (d, defaultTitleFormat, defaultValueFormat, color) {
          return "<table class='tooltip-table'><thead><tr class='text-center'><th colspan=3>"+ toolLegend[toolData[1].indexOf(d[0].value)]+"</th></tr></thead><tbody><tr><td>"+ toolData[0][0]+"   </td><td> |  </td><td>" + d3.format('.2f')(toolData[0][toolData[1].indexOf(d[0].value)]) + "</td></tr><tr><td>"+ toolData[1][0]+"  </td><td> | </td><td>"+ d3.format('.2f')(d[0].value)+ "</td></tr></tbody></table>";

},

set_negative_color: function(color, d){
            if(d.value<0){
              return '#f47b16';
             }else{
              return '#00AEB3';
            }
        },


set_pie_labels: function (value, ratio, id) {
                      if(pieformatrobo == 'm'){
                        return d3.format('.2s')(value);
                      }else if(pieformatrobo == '$'){
                          return d3.format('$')(value);
                      }else if(pieformatrobo == '$m'){
                          return d3.format('$,.2s')(value);
                      }else if(pieformatrobo == 'f'){
                          return d3.format('.2f')(value);
                      }

                   },

set_donut_labels: function (value, ratio, id) {
                                 if(pieformatrobo == 'm'){
                                   return d3.format('.2s')(value);
                                 }else if(pieformatrobo == '$'){
                                     return d3.format('$')(value);
                                 }else if(pieformatrobo == '$m'){
                                     return d3.format('$,.2s')(value);
                                 }else if(pieformatrobo == 'f'){
                                     return d3.format('.2f')(value);
                                 }

                              }


}
