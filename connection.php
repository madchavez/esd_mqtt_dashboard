<?php
//require_once 'pdoconfig.php';

class Connection{

	function __construct(){
		$host = "localhost";
		$dbname = "esd";
		$username = "ojtAdmin";
		$password = "801800";
		$conn = null;
		try {
			$this->conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
	//echo "Connected to $dbname at $host successfully.";
			$this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			return true;
		} catch (PDOException $pe) {
			die ("Could not connect to the database $dbname :" . $pe->getMessage());
			return false;
		}
	}

		function query($sql){
			{
				return $this->conn->query($sql);
			}
		}
		function closeConn(){
			$this->conn = null;
		}
	}

?>
