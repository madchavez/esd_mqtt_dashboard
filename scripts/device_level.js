//Miguel Antonio D.Chavez
//migueladchavez@gmail.com
//https://github.com/madchavez
// Janella Marie G. Masongsong
// mjg1055@dlsud.edu.ph
// https://github.com/jnllmrmsngsng
var mqtt;
var reconnectTimeout = 2000;
var data = {};
var today = new Date();
var host="127.0.0.1";//change this
var port = 8083;
let device_topic = sessionStorage.getItem('device_topic');

var registered_array = []; //used in nearly all functions on this page. be careful <3
var esd_count = 0;

// document.addEventListener("contextmenu", (e) => { //prevents inspect element
//     e.preventDefault();
//    }, false);

// document.addEventListener("keydown", (e) => { //prevents inspect element shortcut
// if (e.ctrlKey || e.keyCode==123) {
//     e.stopPropagation();
//     e.preventDefault();
// }
// });

function onFailure(message) { 
    console.log("Connection Attempt to Host " + host + "Failed"); //console message if websocket fails to connect to broker at that topic
    setTimeout(MQTTconnect, reconnectTimeout); //attempt reconnect at reconnectTimeout intervals
    document.getElementById("mac").innerHTML = "Topic:" + topic + " - DISCONNECTED"; //Client is disconnected, not device
    document.getElementById("intro").style.backgroundColor = 'red'; //visual indication of disconnection
}

function onMessageArrived(msg) {
    esd_count = 0; //reset count before tallying
    // out_msg = "Message received " + msg.payloadString + "<br>"; // for checking
    // out_msg = out_msg + "Message received Topic " + msg.destinationName;
    // console.log(out_msg); //for checking
    var x = msg.payloadString;
    let obj = JSON.parse(x);
    var d = new Date();

    document.getElementById("atemp").innerHTML = obj.atemp + "°C";
    document.getElementById("temp").innerHTML = obj.temp + "°C";
    document.getElementById("hum").innerHTML = obj.humidity + "%";
    document.getElementById("lastTime").innerHTML = d.toLocaleString();
    for (let i = 1; i < 11; i++) {
        console.log("port" + i + "_state");
        console.log(obj['port' + i]);
        if (obj['port' + i] == 1 && registered_array[i] != null) {
            document.getElementById("port" + i + "_state").style.backgroundColor = '#50b19e'; //green, healthy
        }
        else if (obj['port' + i] == 0 && registered_array[i] != null) {
            document.getElementById("port" + i + "_state").style.backgroundColor = '#df6e52'; //red, warning
            esd_count++; //add to tally
        }
        else if (registered_array[i] == null) {
            document.getElementById("port" + i + "_state").style.backgroundColor = 'lightgray'; //unregistered
        }
    }

    document.getElementById("esd_count").innerHTML = esd_count; //display esd count
}

function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("Connected");
    subscribe(device_topic); //device_topic is a session variable set from top_level page, if device_level is accessed through static url, no subscription will be made
    //console.log(registered_array);
    return true;
}

function subscribe(topics) { // topics is a session variable
    mqtt.subscribe("esd/" + topics)
    document.getElementById("mac").innerHTML = "TOPIC: " + topics;
}

function MQTTconnect() {
    console.log("connecting to " + host + " " + port);
    var x = Math.floor(Math.random() * 10000); //random client name, change if necessary
    var cname = "orderform-" + x;
    mqtt = new Paho.MQTT.Client(host, port, cname); //constructor for mqtt connection. Consult Paho MQTT library docs.
    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure,
    };
    mqtt.onMessageArrived = onMessageArrived

    mqtt.connect(options); //connect
}

function last_update() { //retrieves last row of esd_log WHERE mac = device_topic (session variable)
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            x = this.responseText;
            //console.log(x);
            let obj = JSON.parse(x); //process php echoes json encoded row iirc
            //console.log(obj);// for checking.
            //the rest of the function sets display values and time stamps based on row.
            document.getElementById("atemp").innerHTML = obj.atemp + "°C"; 
            document.getElementById("temp").innerHTML = obj.temp + "°C";
            document.getElementById("hum").innerHTML = obj.humidity + "%";
            document.getElementById("lastTime").innerHTML = obj.timestamp;

            for (let i = 1; i < 11; i++) {
                console.log("port" + i + "_state");
                console.log(obj['port' + i]);

                if (obj['port' + i] == 1 && registered_array[i] != null) {
                    document.getElementById("port" + i + "_state").style.backgroundColor = '#50b19e';
                }
                else if (obj['port' + i] == 0 && registered_array[i] != null) {
                    document.getElementById("port" + i + "_state").style.backgroundColor = '#df6e52';
                    esd_count++;
                }
                else if (obj['port' + i] == 1 && registered_array[i] == null) {
                    document.getElementById("port" + i + "_state").style.backgroundColor = 'lightgray';
                }
                else if (obj['port' + i] == 0 && registered_array[i] == null) {
                    document.getElementById("port" + i + "_state").style.backgroundColor = 'lightgray';
                }
            }

            document.getElementById("esd_count").innerHTML = esd_count;
        }
    };
    xhttp.open("GET", "process.php?process=0 &mac=" + device_topic + "&line=0 &port=0 &port_assignment=0", true);
    xhttp.send();
}

function register_port() { //updates registered_devices table at column port(port)_assignment
    let port = document.getElementById("port").value; //used to identify column
    let assignment = document.getElementById("assignment").value; //value entered into column
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (port != "" && assignment != "") {
            if (this.readyState == 4 && this.status == 200) {
                x = this.responseText;
                console.log(x);
                //note: responseText returns something like "Port already registered" if port(port)_assignment is not null. Check deviceClass.php
                document.getElementById("registerModalNotice").innerHTML = x;
                registered_array[document.getElementById("port").value] = assignment; //adds to registered_array, a variable checked before setting port statuses and assignments
                document.getElementById("port" + port + "_state").innerHTML = assignment;

            }
        }
        else {
            x = this.responseText;
            console.log(x);
            document.getElementById("registerModalNotice").innerHTML = "Improper input.";
        }
    };
    xhttp.open("GET", "process.php?process=1 &mac=" + device_topic + "&line=0 &port=" + document.getElementById("port").value + "&port_assignment=" + document.getElementById("assignment").value, true);
    xhttp.send();
}

function clear_port() {//Clears port registration from table
    let port = document.getElementById("port").value; //input, used to identify column

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (port != "") {
            if (this.readyState == 4 && this.status == 200) {
                x = this.responseText;
                console.log(x);
                document.getElementById("registerModalNotice").innerHTML = x;
                document.getElementById("port" + port + "_state").innerHTML = "Port " + port;
                document.getElementById("port" + port + "_state").style.backgroundColor = 'lightgray'; //indication that port is unregistered
                
            }
        }
        else {
            x = this.responseText;
            console.log(x);
            document.getElementById("registerModalNotice").innerHTML = "Improper input.";
        }
    };
    xhttp.open("GET", "process.php?process=2 &mac=" + device_topic + "&line=0 &port=" + document.getElementById("port").value + "&port_assignment=0", true);
    xhttp.send();

    registered_array[port] = null; //removes registration from variable
}

function search_device_registry() { // gets row from registered_devices where mac = user input
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            x = this.responseText;
            //console.log(x);
            let obj = JSON.parse(x); //process.php echoes json encoded assoc array from PDO queries in device class.
            for (let i = 1; i < 11; i++) {
                registered_array[i] = obj["p" + i + "_assignment"]; //initializes list of assigned machines or stations registered to ports
                if (registered_array[i] != null) {
                    document.getElementById("port" + i + "_state").innerHTML = registered_array[i]; //reflect on page
                }
                else {
                    document.getElementById("port" + i + "_state").innerHTML = 'Port ' + i; //not registered kumbaga
                }
            }
            document.getElementById("line").innerHTML = obj["line"]
            last_update();
        }
    };
    xhttp.open("GET", "process.php?process=3 &mac=" + device_topic + "&line=0 &port=0 &port_assignment=0", true);
    xhttp.send();
}

function refreshTime() { //on-screen clock
    const dateString = new Date().toLocaleString();
    const formattedString = dateString.replace(", ", " - ");
    document.getElementById("curTime").innerHTML = "Current Time: " + formattedString;
}

