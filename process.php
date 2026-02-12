<?php
//Miguel Antonio D.Chavez
//migueladchavez@gmail.com
//https://github.com/madchavez
// Janella Marie G. Masongsong
// mjg1055@dlsud.edu.ph
// https://github.com/jnllmrmsngsng
require_once('deviceClass.php');
session_start();
$dv = new Device();

$process = $_GET['process'];
$mac = $_GET['mac'];
$line = $_GET['line'];
$port = $_GET['port'];
$port_assignment = $_GET['port_assignment'];


//check for last esd_log from this mac
if($process == 0){
	$last_update = $dv->last_update($mac);
	if($last_update == null){
		echo "No Data Available";
	}
	else{
//echo var_dump($last_update);
		echo json_encode($last_update);
	}
}
//register port
else if($process == 1){
	$port_current = $dv->search_port($mac,$port);

	if($port_current["p" . $port . "_assignment"] == null){
		$dv->register_port($mac,$port,$port_assignment);
		echo "Port registered.";
	}
	else if($port_current["p" . $port . "_assignment"] != null){
		echo "Port " . $port . " already assigned.";
	}
	else{
	}
}
//clear port
else if($process == 2){
	$port_current = $dv->search_port($mac,$port);

	if($port_current["p" . $port . "_assignment"] != null){
		$dv->delete_port($mac,$port,$port_assignment);
		echo "Port cleared.";
	}
	else if($port_current["p" . $port . "_assignment"] == null){
		echo "Port " . $port . " already clear.";
	}
	else{
	}
}
//search device with mac
else if($process==3){
	$device = $dv->search_device($mac);
	if($device == null){
		echo "No Data Available";
	}
	else{
		echo json_encode($device);
	}
}
//get list of devices and line
else if($process==4){
	$device_list = $dv->device_list();
	if($device_list == null){
		echo "No Data Available";
	}
	else{
		echo json_encode($device_list);
	}
}
//register device
else if($process==5){
	$device = $dv->search_device($mac);
	if($device == null){
		$dv->register_device($mac,$line);
		echo $mac . "Successfully Registered!";
	}
	else{
		echo "null";
	}
}
//delete device
else if($process==6){
	$device = $dv->search_device($mac);
	if($device != null){
		$dv->delete_device($mac);
		echo "Successfully deleted!";
	}
	else{
		echo "Device does not exist.";
	}
}
//update device
else if($process==7){
	$device = $dv->search_device($mac);
	if($device != null){
		$dv->update_device($mac, $line);
		echo "Successfully updated!";

	}
	else{
		echo "Device does not exist.";

	}
}
//get hourly data
else if($process==8){
	$device = $dv->one_day_data($mac);
	echo json_encode($device);
}
//time_not_grounded()
else if($process==9){
	$device = $dv->time_not_grounded($mac);
	echo json_encode($device);
}
?>