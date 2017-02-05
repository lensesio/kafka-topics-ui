angularAPP.factory('charts', function ($rootScope, $http, env) {

//TODO HARDCODED!
var chartAPI = env.KAFKA_BACKEND() + "/topics/chart/"

return {
    getFullChart : function(topicName, data) { getFullChart(topicName,data) },
    getTimeChart : function(topicName, data) {  getTimeChart(topicName, data) },
    getSpiderChart : function(topicName, data) {  getSpiderChart(topicName, data) },
    getTreeChart : function(topicName, data) {  getTreeChart(topicName, data) },
    samplePartition : function() {  getSamplePartition(); }
}

function getFullChart(topicName, response) {

      var fullChart = {
         chart: {
            zoomType: 'x',
            events: {
                 load: function () {
                      var series0 = this.series[0];
                      var series1 = this.series[1];
                      var i = 0;
                      setInterval(function () {
                      $http.get(env.KAFKA_BACKEND() + "/topics/chart/"+topicName+"/latest").then(function response(response){

                       var chartData = response.data.split(",");
                       var numberofmessages = chartData[1];

                       var random = Math.round(Math.random() * 50)
                       i = i + random;

                       var chartData1 = parseInt(numberofmessages) + parseInt(i);
                       var chartData0 = random;
                       //TODO
                             var x = (new Date()).getTime(), // current time
                                 y = parseInt(response.data);
                             series0.addPoint([x, parseInt(chartData0)], true, true);
                             series1.addPoint([x, parseInt(chartData1)], true, true);
                      })
                      }, 2000);
                 }
            }
        },
        rangeSelector: {
            selected: 1,
            buttons: [
                { type: 'minute', count: 5, text: '5m'},
                { type: 'day', count: 1, text: '24h'},
                { type: 'day', count: 3, text: '3d'},
                { type: 'week', count: 1, text: '1w' },
                { type: 'month', count: 1, text: '1m'  },
                { type: 'month', count: 6, text: '6m' },
                { type: 'year', count: 1,  text: '1y' },
                { type: 'all',  text: 'All' }]
        },
        credits: {
              enabled: false
        },
        legend: {
                enabled: true
        },
        yAxis: {
            title: {
                text: 'Number of Messages'
            }
        },
        xAxis: {
            events: {
                setExtremes: function (e) {
                    var chartSelection = "Selected Min: " + Highcharts.dateFormat(null, e.min) + ' / Selected Max: '+ Highcharts.dateFormat(null, e.max);
                    console.log(chartSelection);
                }
            }
        },
        navigator: {
            outlineColor: '#E4E4E4',
            height: 80
        },
        scrollbar: {
            enabled: false
        },
        title: {
            text: 'Messages in ' + topicName
        },
        subtitle: {
            text: '' // dummy text to reserve space for dynamic subtitle
        },
        series: [
         {
            name: 'Rate',
            color: "#cccccc",
            data: response.newMessageRate,
            pointStart: response.pointStart,
            pointInterval: response.pointInterval,
            tooltip: {
                valueDecimals: 0,
                valueSuffix: ' messages/sec'
            }
         } ,
         {
            name: 'Messages',
            color: "#000000",
            data: response.messageCount,
            pointStart: response.pointStart,
            pointInterval: response.pointInterval,
            tooltip: {
                valueDecimals: 0,
                valueSuffix: ' messages'
            }
         } ],

         plotOptions: {
                     series: {
                         events: {
                             hide: function () {
                                 this.yAxis.height = 0
                                 this.yAxis.gridLineWidth = 0
                                 this.xAxis.lineWidth = 0
                                 this.xAxis.tickLength = 0
                                 console.log("ABC", this.yAxis)
                                 console.log("ABC", this.xAxis)
                                 }
                             }
                         }
                     }
         }
//    };

    Highcharts.stockChart('container', fullChart);
//    return fullChart;
}

function getTimeChart(topicName, response) {
   var timeChart = {
                    chart : {
                        padding : 0,
                         events: {
                             load: function () {
                                  var series0 = this.series[0];
                                  setInterval(function () {
                                  //TODO
                                  $http.get(env.KAFKA_BACKEND() + "/topics/chart/"+topicName+"/latest").then(function response(response){ //TODO
                                         var x = (new Date()).getTime(), // current time
                                             y = parseInt(response.data);
                                         series0.addPoint([x, y], true, true);
                                  })
                                  }, 2000);
                             }
                        }
                    },
                     credits: {
                          enabled: false
                      },
                    exporting: { enabled: false },
                    rangeSelector : {
                        enabled: false
                    },
                    tooltip : {
                        enabled: false
                    },
                    title : {
                        text : ''
                    },
                  navigator: {
                            outlineColor: '#E4E4E4',
                            height: 80
                          },

                           scrollbar: {
                                    enabled: false
                                  },
                    yAxis: {
                        height: 0,
                        gridLineWidth: 0,
                        labels: {
                            enabled: false
                        }
                    },
                    xAxis: {
                        lineWidth: 0,
                        tickLength : 0,
                        labels: {
                            enabled: false
                        }
                    },
                    series : [{
                        name : '',
                        lineWidth: 0,
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: false
                                }
                            }
                        },
                        pointStart: response.data.pointStart,
                        pointInterval: response.data.pointInterval,
                        data : response.data.messageCount,
                        tooltip: {
                            valueDecimals: 2
                        }
                    }]
                };

    Highcharts.stockChart('container2', timeChart);
//     return timeChart;
}

function getSpiderChart(topicName, response) {
   var spiderChart = {

                             chart: {
                                 polar: true,
                                 type: 'bar'
                             },

                             title: {
                                 text: 'Messages per partition',
                                 x: -80
                             },

                             pane: {
                                 size: '80%'
                             },

                             xAxis: {
                                 categories: [
                                     'partition1', 'partition2', 'partition3', 'partition4', 'partition5'

                                 ],
                                 tickmarkPlacement: 'on',
                                 lineWidth: 0
                             },

                             yAxis: {
                                 gridLineInterpolation: 'polygon',
                                 lineWidth: 0,
                                 min: 0
                             },

                             tooltip: {
                                 shared: true,
                                 pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
                             },

                             legend: {
                                 align: 'right',
                                 verticalAlign: 'top',
                                 y: 70,
                                 layout: 'vertical'
                             },

                             series: [{
                                 name: 'Allocated Budget',
                                 data: [

                                 43000, 19000, 60000,
                                 35000, 17000


                                 ],
                                 pointPlacement: 'on'
                             }, {
                                 name: 'Actual Spending',
                                 data: [50000, 39000, 42000, 31000, 26000],
                                 pointPlacement: 'on'
                             }]

                         };

    Highcharts.stockChart('spider', spiderChart);
//     return timeChart;
}

function getTreeChart(topicName, data) {
    function compare(a,b) {
      if (a.messages > b.messages)
        return -1;
      if (a.messages < b.messages)
        return 1;
      return 0;
    }

    data = data.sort(compare);
    var color = 1;

   var partitionData = [];

//   angular.forEach(data, function(dato) {
    var i;
    for (i = 0; i < data.length; i++) {
        var a = {
            name : '[' + data[i].partition + ']',
            value: data[i].messages,
            colorValue: data.length - i
        }
        partitionData.push(a);
    }
//   })


    console.log("AAA", JSON.stringify(partitionData))

   var partitionData2 = [{
                            name: 'partition1',
                            value: 43000,
                            colorValue: 1
                        }, {
                            name: 'partition2',
                            value: 19000,
                            colorValue: 2
                        }, {
                            name: 'partition3',
                            value: 60000,
                            colorValue: 3
                        }, {
                            name: 'partition4',
                            value: 35000,
                            colorValue: 4
                        }, {
                            name: 'partition5',
                            value: 17000,
                            colorValue: 5
                        }]

   var treeChart =  {
                             colorAxis: {
                                 minColor: '#FFFFFF',
                                 maxColor: Highcharts.getOptions().colors[0]
                             },
                             navigator: { enabled : false },
                             exporting: { enabled: false },
                             rangeSelector : {  enabled: false },
                             scrollbar: {  enabled: false },
                             credits: { enabled: false },
                             series: [{
                                 type: 'treemap',
                                 layoutAlgorithm: 'squarified',
                                 data: partitionData
                             }],
                             title: {
                                 text: ''
                             },

                             tooltip: {
                                 backgroundColor: Highcharts.getOptions().colors[1],
                                 style: {fontSize: '13px', color:'#ffffff', padding:'50px;'},
                                 formatter: function () {
                                     return 'Partition: <b>' + this.point.name + '</b> <br>' +
                                         'Messages: <b>' + this.point.value + '</b> <br>' +
                                         'Broker: <b> XXx.xx.xxx.xx</b><br>' +
                                         'Leader Broker: <b> XXx.xx.xxx.xx</b><br>';
                                 }

                             }

//                             plotOptions: {
//                                         series: {
//                                             point: {
//                                                 events: {
//                                                     mouseOver: function () {
//                                                         var chart = this.series.chart;
//                                                         if (!chart.lbl) {
//                                                             chart.lbl = chart.renderer.label('')
//                                                                 .attr({
//                                                                     padding: 10,
//                                                                     r: 10,
//                                                                     fill: Highcharts.getOptions().colors[1]
//                                                                 })
//                                                                 .css({
//                                                                     color: '#FFFFFF'
//                                                                 })
//                                                                 .add();
//                                                         }
//                                                         chart.lbl
//                                                             .show()
//                                                             .attr({
//                                                                 text: 'Partition: ' + this.name + ', Messages: ' + this.value
//                                                             });
//                                                     }
//                                                 }
//                                             },
//                                             events: {
//                                                 mouseOut: function () {
//                                                     if (this.chart.lbl) {
//                                                         this.chart.lbl.hide();
//                                                     }
//                                                 }
//                                             }
//                                         }
//                                     },
                         };

    Highcharts.stockChart('treemap', treeChart);
//     return timeChart;
}


function getSamplePartition() {

        var ch = {
                 chart: {
                     type: 'area',
                     backgroundColor: null,
                             borderWidth: 0,
                             margin: [2, 0, 2, 0],
                             width: 300,
                             height: 40,
                             style: {
                                 overflow: 'visible'
                             },
                 },
                 title: {
                     text: ''
                 },
                 subtitle: {
                     text: ''
                 },
                 xAxis: {
                     allowDecimals: false,
                     labels: { enabled: false }
                 },
                 yAxis: {
                  labels: { enabled: false },
                     title: {
                         text: ''
                     }
                 },

                   navigator: { enabled : false },
               exporting: { enabled: false },
               rangeSelector : {  enabled: false },
               scrollbar: {  enabled: false },
               credits: { enabled: false },
               legend: { enabled: false },
                 plotOptions: {
                     area: {
                         pointStart: 1940,
                         marker: {
                             enabled: false,
                             symbol: 'circle',
                             radius: 2,
                             states: {
                                 hover: {
                                     enabled: true
                                 }
                             }
                         }
                     }
                 },
                 series: [{
                     name: 'zz',
                     data: [6, 11, 32, 110, 235, 369, 640,1005, 1436]
                 }]
             };
    Highcharts.stockChart('abc', ch);
}

});