//Miguel Antonio D.Chavez
//migueladchavez@gmail.com
//https://github.com/madchavez
// Janella Marie G. Masongsong
// mjg1055@dlsud.edu.ph
// https://github.com/jnllmrmsngsng
var mqtt;
var reconnectTimeout = 2000;
//var host="127.0.0.1";//change this
var host = "iot.ionics-ems.com";//change this
var port = 8083;

var topic_array = [];
var line_array = [];
var esd_count_array = [];
var initial_obj_list = {};

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
    console.log("Connection Attempt to Host " + host + "Failed");
    setTimeout(MQTTconnect, reconnectTimeout);
}

function onMessageArrived(msg) { //receives mqtt message
    var d = new Date();


    out_msg = "Message received " + msg.payloadString + "</br>";
    out_msg = out_msg + "Message received Topic " + msg.destinationName;

    console.log(out_msg);
    var x = msg.payloadString;
    let obj = JSON.parse(x); //expected mqtt messages are in json

    let y = msg.destinationName.split('/'); //split mac address from wider topic e.g. esd/someMacAddress (expected topic format) is split into [esd,someMacAddress]

    alert_msg = msg.destinationName + " count " + obj.esd_count + " " + d.toLocaleString('en-US', { hour12: false }); //not in use afaik

    console.log(y[1]); //check if mac address is split
    let ports = 0;
    let esd_count = 0;
    let result = initial_obj_list.find(({ mac }) => mac == y[1]); //check if mac address is registered in initial_obj_list
    console.log(result);

    for (let i = 1; i < 11; i++) {
        if (result["p" + i + "_assignment"] != null && obj["port" + i] == 0) { //if port is registered AND returning 0, esd_count++
            esd_count++;
        }
        if (result["p" + i + "_assignment"] != null) {//if port is registered, port++
            ports++; //this is included in this function in case ports are registered elsewhere while this page is running
        }
    }

    document.getElementById("esd_count_" + y[1]).innerHTML = esd_count + "|" + ports; //show esd_count on card corresponding to registered mac address that sent message
    document.getElementById("timestamp_" + y[1]).innerHTML = d.toLocaleString('en-US', { hour12: false }); //show timestamp on said card

    if (esd_count == 0) { //if esd_count 0, green
        document.getElementById("esd_status_" + y[1]).style.backgroundColor = '#50b19e';
    } else { //else, red (sense of alarm)
        document.getElementById("esd_status_" + y[1]).style.backgroundColor = '#df6e52';
    }
}

function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("Connected");
    subscribe();
    return true;
}

function subscribe() { //subscribe to topic. EDIT TOPIC HERE
    mqtt.subscribe("esd/#");
}

function MQTTconnect() { //connect to broker
    console.log("connecting to " + host + " " + port);
    var x = Math.floor(Math.random() * 10000);
    var cname = "orderform-" + x;
    mqtt = new Paho.MQTT.Client(host, port, cname);
    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure,
    };
    mqtt.onMessageArrived = onMessageArrived

    mqtt.connect(options); //connect
}

function last_update(macAdd) { //queries the last recorded row in the esd_logs table
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            x = this.responseText;
            console.log(x);
            let obj = JSON.parse(x);

            let esd_count = 0;
            let ports = 0;
            let result = initial_obj_list.find(({ mac }) => mac == macAdd);

            for (let i = 1; i < 11; i++) {
                if (result["p" + i + "_assignment"] != null && obj["port" + i] == 0) {
                    esd_count++; //tallies how many ports were assigned AND are not properly grounded (value = 0)

                }
                if (result["p" + i + "_assignment"] != null) {
                    ports++; //tallies how many ports were assigned/registered to a station/machine/operator
                }
            }

            document.getElementById("esd_count_" + macAdd).innerHTML = esd_count + "|" + ports; //display in a card corresponding to macAdd
            document.getElementById("timestamp_" + macAdd).innerHTML = obj.timestamp; //display in a card corresponding to macAdd

            if (ports == 0) { //if 0 registered ports, dimgray color
                document.getElementById("esd_status_" + macAdd).style.backgroundColor = 'dimgray';
            }
            else if (esd_count == 0) { //if esd_count 0, green color
                document.getElementById("esd_status_" + macAdd).style.backgroundColor = '#50b19e';
            } else { //red indicates a sense of alarm
                document.getElementById("esd_status_" + macAdd).style.backgroundColor = '#df6e52';
            }
        }
    };
    xhttp.open("GET", "process.php?process=0 &mac=" + macAdd + "&line=0 &port=0 &port_assignment=0", true);
    xhttp.send();
}

function device_list() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            /*
            Runs on load of page.
            Initializes "topic_array" and "line_array" variables
            topic_array contains the list of mac addresses
            line_array contains the list of associated line numbers		
            */
            x = this.responseText; //assigns to x a json encoded php echo containing an associative_array containing all rows of 'registered_devices' table
            initial_obj_list = JSON.parse(x);
            console.log("INITIAL OBJ LIST" + initial_obj_list['mac']);
            for (i in initial_obj_list) {
                topic_array[i] = initial_obj_list[i]["mac"];
                line_array[i] = initial_obj_list[i]["line"];

                console.log("PORT REGISTRY" + initial_obj_list[i]["p1_assignment"]); //just to check
            }
            initialize_device_cards();
        }
    };
    xhttp.open("GET", "process.php?process=4 &mac=0 &line=0 &port=0 &port_assignment=0", true);
    xhttp.send();
}

function device_view(mac) { //upon clicking a device's card, stores mac address of said device in a session variable for that tab and redirects to device view page
    sessionStorage.setItem('device_topic', mac);
    console.log(sessionStorage.getItem('device_topic'));
    location.href = 'device_level.html'; //uses mac address as topic and parameter for queries
}

function initialize_device_cards() {
    document.getElementById("sample").innerHTML = ""; //empties div containing device cards
    for (i in topic_array) { //for each mac address in topic_array, dynamically construct the following html in "sample" div container
        document.getElementById("sample").innerHTML += [
            '<div style="margin-top:5px; width:9.5rem;justify-content:center;">',
            '<div class="card" style=""onclick="device_view(', '\'', topic_array[i], '\'', ')";>',
            '<div class="header" style="background-color: #5672b3; color: whitesmoke; text-align: center; font-weight:bold;padding:0;">','LINE: ', line_array[i], '</div>',
            '<div class="card-body" style=" background-color:dimgray;padding:0;height:4.5rem;" id="esd_status_', topic_array[i], '">',
            '<div style="font-size:45px;text-align:center; background-color:transparent; color:whitesmoke; font-weight: bold;padding:0;" id="esd_count_',
            topic_array[i], '"></div>',
            '</div>',
            '<div class="card-footer" style="background-color: #5672b3; color: whitesmoke; text-align: center; font-size:12px; font-weight:bold;"><em>', topic_array[i], '</em></div>',
            '</div>',
            '<label style="color: whitesmoke; font-size:14px;" id="timestamp_', topic_array[i], '"></label>',
            '</div> ',
        ].join('');

        last_update(topic_array[i]); //for each topic, get latest row from 'esd_log' table
    }
}

function register_device() {
    var mac = document.getElementById("macInput").value;
    var line = document.getElementById("lineInput").value;
    var xhttp = new XMLHttpRequest();

    if (mac != "" && line != "") { //if fields are not empty
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                x = this.responseText;
                console.log(x);
                device_list(); //runs device_list to generate all device cards and updates without refreshing page

                if (x == "null") { //process.php if process=5 returns "null" string if mac already exists in registered_devices
                    document.getElementById("sAlert").innerHTML = [ //generates this alert in registration panel:
                        '<div class="alert r alert-dismissible" style="background-color: #df6e52;">',
                        '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>', "MAC Address " + mac + "already registered!",
                        '</div>'
                    ].join('');
                }
                else {
                    document.getElementById("sAlert").innerHTML = [ //generates this alert  in registration panel:
                        '<div class="alert r alert-dismissible" style="background-color: #50b19e;">',
                        '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>', "Successfully registered!",
                        '</div>'
                    ].join('');
                }
            }
        };
        xhttp.open("GET", "process.php?process=5 &mac=" + mac + "&line=" + line + "&port=0 &port_assignment=0", true);
        xhttp.send();
    }
    else { //else fields are empty
        document.getElementById("sAlert").innerHTML = [
            '<div class="alert r alert-dismissible" style="background-color: #df6e52;">',
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>', "Improper Input!",
            '</div>'
        ].join('');
    }
}

function delete_device() { //deletes row with matching mac from registered_devices table
    var mac = document.getElementById("macInput").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            x = this.responseText;
            //console.log(x);

            let index = topic_array.indexOf(mac, 0); //finds mac from topic_array
            topic_array.splice(index, 1); //splices at index of said mac in topic_array

            device_list(); //generates new set of cards without the deleted mac

            document.getElementById("sAlert").innerHTML = [
                '<div class="alert r alert-dismissible" style="background-color: #50b19e;">',
                '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>', "Successfully deleted!",
                '</div>'
            ].join('');

        }
    };
    xhttp.open("GET", "process.php?process=6 &mac=" + mac + "&line=0&port=0&port_assignment=0", true);
    xhttp.send();
    // device_list();
}

function update_device() { //updates line from row with matching mac from registered_devices table
    var mac = document.getElementById("macInput").value;
    var line = document.getElementById("lineInput").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            x = this.responseText;
            console.log(x); //runs device_list to generate all device cards with updated information without refreshing page

            device_list();

            document.getElementById("sAlert").innerHTML = [
                '<div class="alert r alert-dismissible" style="background-color: #50b19e;">',
                '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>', "Successfully updated device ", mac, '!',
                '</div>'
            ].join('');

        }

    };
    xhttp.open("GET", "process.php?process=7 &mac=" + mac + "&line=" + line + "&port=0&port_assignment=0", true);
    xhttp.send();
}

function toggleRegister() { //opens registration box where registration fields and buttons are placed
    var regBox = document.getElementById('register-box');
    if (regBox.style.display == "block") { // if is registerBox displayed, hide it
        regBox.style.display = "none";
        document.getElementById('register').value = "Register";
    }
    else { // if is registerBox hidden, display it
        regBox.style.display = "block";
        document.getElementById('register').value = "Close";
    }
}

function reg_details(id) { //each registration-related button opens a modal. this function prints registration details in said modal.
    let mac = document.getElementById('macInput').value;
    let line = document.getElementById('lineInput').value;

    document.getElementById(id).innerHTML = "DETAILS" + "<br>" + "MAC Address: " + mac + "<br>" + "Line: " + line;
}
