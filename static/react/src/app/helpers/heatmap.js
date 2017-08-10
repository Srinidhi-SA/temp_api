export default function(divId){
  Array.max = function( array ){
        return Math.max.apply( Math, array );
    };


    var red,blue,green,clr = null;
   var  xr = 255;
   var  xg = 255;
    var xb = 255;

    /*yr = 243;
    yg = 32;
    yb = 117;*/
     var yr = 0;
   var yg = 100;
   var yb = 0

   var n = 100;
  var counts= $("."+divId).find('tbody td').not('.stats-title').map(function() {
      if($(this).text() != '')
        return parseInt($(this).text());
        // .replace('%','').trim()
    }).get();

    // return max value
    var max = Array.max(counts);

    // add classes to cells based on nearest 10 value
    $("."+divId).find('tbody td').not('.stats-title').each(function(){
        var val = parseInt($(this).text());
        var pos = parseInt((Math.round((val/max)*100)).toFixed(0));
        red = parseInt((xr + (( pos * (yr - xr)) / (n-1))).toFixed(0));
        green = parseInt((xg + (( pos * (yg - xg)) / (n-1))).toFixed(0));
        blue = parseInt((xb + (( pos * (yb - xb)) / (n-1))).toFixed(0));
        clr = 'rgb('+red+','+green+','+blue+')';
        $(this).css({backgroundColor:clr});
    });

}
