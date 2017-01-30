angularAPP.factory('charts', function ($rootScope, $http, env) {

//TODO HARDCODED!
var chartAPI = env.KAFKA_BACKEND() + "/topics/chart/"

return {
    getFullChart : function(topicName, data) { getFullChart(topicName,data) },
    getTimeChart : function(topicName, data) {  getTimeChart(topicName, data) }
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
         } ]
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

});