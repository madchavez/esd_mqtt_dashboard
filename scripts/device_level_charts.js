//Miguel Antonio D.Chavez
//migueladchavez@gmail.com
//https://github.com/madchavez
// Janella Marie G. Masongsong
// mjg1055@dlsud.edu.ph
// https://github.com/jnllmrmsngsng
var x_values = []; //esd count chart x
var y_values = []; //esd count chart y
var graph_dat = [[]]; //esd count chart data
var durationData = {};
var barCategories= ['Port 1','Port 2','Port 3','Port 4','Port 5','Port 6','Port 7','Port 8','Port 9','Port 10'];
var barSeries= [];
var durs = [[]];
var options = { //Consult ApexCharts JS Docs https://apexcharts.com/docs/chart-types/line-chart/
    chart: {
        id: 'chart',
        type: 'line',
        height: 300,
    },
    series: [{
        data: graph_dat
    }],
    xaxis: {

        type: "datetime",
        labels: {
            datetimeUTC: false,
            style: {
                colors: 'whitesmoke'
            }
        },
        min: new Date().getTime() - (1000 * 60 * 60 * 12),
        max: new Date().getTime()
    },
    yaxis: {
        min: 0,
        max: 10,
        labels:{
            style: {
                colors: 'whitesmoke'
            }
        }
    }

}

var options1 = {
    chart: {
        type: 'bar',
        height: 300,
    },
    xaxis: {
        categories: barCategories,
        labels: {
            style: {
              colors: 'whitesmoke' // Single color value
            }
          }
    },
    yaxis:{
        labels:{
            style:{
                colors:'whitesmoke'
            }
        }
    },
    series: [
        {
        name: 'Series 1',
        data: barSeries,
        },
    ],
}

function day_data(mac) { //outdated function name. Don't mind! Gets esd_logs of this device's mac address for the last 24h
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            x = this.responseText;

            data = JSON.parse(x);
            //console.log("HOURLY DATA=====>" + x);
            //line_chart_function();
            for (i in data) { //data is a json encoded echo from process.php
                x_values[i] = data[i]['timestamp']; //at index i, column timestamp
                y_values[i] = 0; //initialize a counter
                for (let y = 1; y < 11; y++) {
                    if (data[i]['port' + y] == 0 && registered_array[y] != null) {
                        y_values[i]++ //tally esd count from registered ports
                    }
                }
                graph_dat[i] = [x_values[i].toLocaleString(), y_values[i]];
                //console.log(graph_dat);
            }
        
            chart.render();
        }
    };
    xhttp.open("GET", "process.php?process=8 &mac=" + mac + "&line=0 &port=0 &port_assignment=0", true);
    xhttp.send();
}

// function line_chart_function() { //assign to arrays to be used for x and y values for the line chart

// }

function day_data_button() { //Consult ApexCharts JS docs  https://apexcharts.com/docs/methods/
    ApexCharts.exec('chart', 'updateOptions', {
        xaxis: {

            type: "datetime",
            labels: {
                datetimeUTC: false
            },
            min: new Date().getTime() - (1000 * 60 * 60 * 24), //24 hours
            max: new Date().getTime()
        }
    }, false, true);
}

function half_day_data_button() { //Consult ApexCharts JS Docs https://apexcharts.com/docs/methods/
    ApexCharts.exec('chart', 'updateOptions', {
        xaxis: {

            type: "datetime",
            labels: {
                datetimeUTC: false
            },
            min: new Date().getTime() - (1000 * 60 * 60 * 12), //12 hours
            max: new Date().getTime()
        }
    }, false, true);
}

function duration_data(mac){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            x = this.responseText;
            //console.log(x);
            durs = JSON.parse(x);
            for(i in durs){
                console.log("port " + i + " = " + durs[i]["portDuration"]);
                if(durs[i]["portDuration"] != null){
                barSeries[i-1] = durs[i]["portDuration"];
                } else{
                    barSeries[i-1] = 0;
                }
                //console.log(barSeries[i-1]);
            }
            chart1.render();
        }
        
    };
    xhttp.open("GET", "process.php?process=9 &mac=" + mac + "&line=0 &port=0 &port_assignment=0", true);
    xhttp.send();
}