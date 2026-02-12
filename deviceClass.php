<?php
//Miguel Antonio D.Chavez
//migueladchavez@gmail.com
//https://github.com/madchavez
// Janella Marie G. Masongsong
// mjg1055@dlsud.edu.ph
// https://github.com/jnllmrmsngsng
include_once('connection.php');

class Device{
	public $mac;
	public $line;
	public $port_assignment;

	function set_mac($mac){
		$this->mac = $mac;
	}
	function set_line($line){
		$this->line = $line;
	}
	function set_port_assignment($port_assignment){
		$this->port_assignment = $port_assignment;
	}

	function get_mac(){
		return $this->mac;
	}
	function get_line(){
		return $this->line;
	}
	function get_port_assignment(){
		return $this->port_assignment;
	}

	function last_update($mac){
		$payload = array();
		$database = new Connection();
		$sql = "SELECT * FROM esd_log WHERE mac = '" . $mac . "'ORDER BY timestamp DESC LIMIT 1";

		$stmt = $database->query($sql);
		$rows = $stmt->fetch(PDO::FETCH_ASSOC);
		if($stmt->rowCount() > 0){
            foreach($rows as $row){
            	$payload[] = $row;
            }
            return $rows;
            $database->closeConn();
        }
        else{
            return null;
            $database->closeConn();
        }
	}

	function register_device($mac,$line){
		$database = new Connection();
        $sql = "INSERT INTO registered_devices (mac,line) VALUES('" . $mac . "','" . $line . "')";
        $stmt = $database->query($sql);
        $rows = $stmt->fetch();
        $database->closeConn();
	}

	function search_port($mac,$port){
		$database = new Connection();
		$sql = "SELECT p" . $port . "_assignment FROM registered_devices WHERE mac = '" . $mac . "'";

		$stmt = $database->query($sql);
		$rows = $stmt->fetch(PDO::FETCH_ASSOC);
		if($stmt->rowCount() > 0){
            foreach($rows as $row){
            	$payload[] = $row;
            }
            return $rows;
            $database->closeConn();
        }
        else{
            return null;
            $database->closeConn();
        }
	}

	function register_port($mac,$port,$port_assignment){
		$database = new Connection();
        $sql = "UPDATE registered_devices SET p" . $port . "_assignment = '" . $port_assignment . "' WHERE mac = '" . $mac . "'";
        $stmt = $database->query($sql);
        $rows = $stmt->fetch();
        $database->closeConn();
	}

	function delete_port($mac,$port){
		$database = new Connection();
        $sql = "UPDATE registered_devices SET p" . $port . "_assignment = NULL WHERE mac = '" . $mac . "'";
        $stmt = $database->query($sql);
        $rows = $stmt->fetch();
        $database->closeConn();
	}

	function search_device($mac){
		$payload = array();
		$database = new Connection();
		$sql = "SELECT * FROM registered_devices WHERE mac = '" . $mac . "'";
		$stmt = $database->query($sql);
		$rows = $stmt->fetch(PDO::FETCH_ASSOC);
		if($stmt->rowCount() > 0){
            // foreach($rows as $row){
            // 	$payload[] = $row;
            // }
            return $rows;
            $database->closeConn();
        }
        else{
            return null;
            $database->closeConn();
        }
	}

	function device_list(){
		$payload = array();
		$database = new Connection();
		$sql = "SELECT * FROM registered_devices ORDER BY line";
		$stmt = $database->query($sql);
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if($stmt->rowCount() > 0){
            return $rows;
            $database->closeConn();
        }
        else{
            return null;
            $database->closeConn();
        }
	}

	function delete_device($mac){
		$database = new Connection();
        $sql = "DELETE FROM registered_devices WHERE mac = '" . $mac . "'";
        $stmt = $database->query($sql);
        $database->closeConn();
	}

	function update_device($mac, $line){
		$database = new Connection();
		$sql = "UPDATE registered_devices SET line = '" . $line . "' WHERE mac = '" . $mac . "'";
		$stmt = $database->query($sql);
		$database->closeConn();
	}

	function one_day_data($mac){
		$database = new Connection();
		$sql = "SELECT * FROM `esd_log` WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1440 MINUTE) AND mac ='" . $mac . "'";
		$stmt = $database->query($sql);
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if($stmt->rowCount() > 0){
            return $rows;
            $database->closeConn();
        }
        else{
            return null;
            $database->closeConn();
        }
	}

	function time_not_grounded($mac){
		$database = new Connection();
		$rows = []; //consult: https://dba.stackexchange.com/questions/188775/selecting-consecutive-rows-with-same-values
		for($i = 1; $i < 11; $i++){ //gets sum of query that gets difference between min timestamp and max timestamp of consecutive rows of same value.
			$sql = "SELECT SUM(port" . $i . "Duration) AS " . 
			"portDuration FROM(SELECT mac, port" . $i . ", TIMESTAMPDIFF(second, MIN(timestamp), MAX(timestamp)) AS Port" . $i . "Duration " . 
			"FROM (" . 
			"SELECT " . 
			"esd_log.*" . 
			", @groupNumber := IF(@prev_mac != mac OR @prev_port" . $i . " != port" . $i . ", @groupNumber + 1, @groupNumber) AS gn" . 
			", @prev_mac := mac" . 
			", @prev_port" . $i . " := port" . $i . " " . 
			"FROM esd_log" . 
			", (SELECT @groupNumber := 0, @mac := NULL, @prev_port" . $i . " := NULL) var_init_subquery " . 
			"ORDER BY timestamp" . 
			") sq WHERE mac = '" . $mac . "' AND timestamp > DATE_SUB(NOW(), INTERVAL 1440 MINUTE) AND port" . $i . " =0" . 
			" GROUP BY gn, mac, port" . $i . ") AS p;";
			$stmt = $database->query($sql);
			$rows[$i] = $stmt->fetch(PDO::FETCH_ASSOC);
		}
		if($stmt->rowCount() > 0){
            return $rows;
            $database->closeConn();
        }
        else{
            return null;
            $database->closeConn();
        }
		return $rows;
	}
}
?>