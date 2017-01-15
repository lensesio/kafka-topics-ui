angularAPP.factory('charts', function ($rootScope) {

//TODO HARDCODED!
var chartAPI = "https://kafka-backend.demo.landoop.com/api/rest/topics/chart/"

return {
    getFullChart : function(topicName, data) { getFullChart(topicName,data) },
    getTimeChart : function(topicName) { getTimeChart(topicName, data) }
}

function getFullChart(topicName, data) {

      var fullChart = {
         chart: {
            zoomType: 'x',
            events: {
                load: function () {
                     var series = this.series[1];
                     setInterval(function () {
                     $http.get(chartAPI+topicName+"/latest").then(function response(response){ //TODO
                            var x = (new Date()).getTime(), // current time
                                y = parseInt(response.data);
                            series.addPoint([x, y], true, true);
                     })
                     }, 2000);
                }
        },
        rangeSelector: {
            selected: 1,
            buttons: [
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
            data: data.newMessageRate,
            pointStart: data.pointStart,
            pointInterval: data.pointInterval,
            tooltip: {
                valueDecimals: 0,
                valueSuffix: ' messages/sec'
            }
         } ,
         {
            name: 'Messages',
            color: "#000000",
            data: data.messageCount,
            pointStart: data.pointStart,
            pointInterval: data.pointInterval,
            tooltip: {
                valueDecimals: 0,
                valueSuffix: ' messages'
            }
         } ]
         }
    };

    return fullChart;
}

function getTimeChart(topicName, data) {

   var timeChart = {
                    chart : {
                        padding : 0
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
                        data : data,
                        tooltip: {
                            valueDecimals: 2
                        }
                    }]
                };

     return timeChart;
}

});