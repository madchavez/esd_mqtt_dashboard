# esd_monitoring_dashboard

PLEASE ADD: USER AUTHENTICATION
MORE METRICS

PLEASE IMPROVE: LOAD TIMES

ONGOING IoT PROJECT

An ESP32-based device sends JSON payloads through MQTT protocol.

The payload looks something like: 
{
  "mac": "SOMEMACADDRESS",
  "temp": 27.69,
  "humidity": 52.98,
  "atemp": -273.15,
  "esd_count": 10,
  "port1": 0,
  "port2": 0,
  "port3": 0,
  "port4": 0,
  "port5": 0,
  "port6": 0,
  "port7": 0,
  "port8": 0,
  "port9": 0,
  "port10": 0
}

This project is XAMPP based web dashboard using websockets and DOM to reflect information in real time without refresh. A python script is used in parallel to log said information into a MySQL database. 
The user interface uses vanilla javascript and bootstrap framework.
The backend uses PHP to control server-side functions. Some operations include Create, Read, Update, and Delete functions through PDO library.

Further iterations may include Frontend Javascript frameworks for better maintainability.

Initialize tables:

CREATE TABLE `esd`.`esd_log` (`log_no` INT(10) NULL DEFAULT NULL AUTO_INCREMENT , `mac` VARCHAR(50) NOT NULL , `temp` FLOAT(8) NOT NULL , `humidity` FLOAT(8) NOT NULL , `atemp` FLOAT(8) NOT NULL , `esd_count` INT(3) NOT NULL , `port1` INT(2) NOT NULL , `port2` INT(2) NOT NULL , `port3` INT(2) NOT NULL , `port4` INT(2) NOT NULL , `port5` INT(2) NOT NULL , `port6` INT(2) NOT NULL , `port7` INT(2) NOT NULL , `port8` INT(2) NOT NULL , `port9` INT(2) NOT NULL , `port10` INT(2) NOT NULL , `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`log_no`)) ENGINE = InnoDB;

CREATE TABLE `esd`. (`mac` VARCHAR(50) NOT NULL , `line` INT(8) NULL DEFAULT NULL , `p1_assignment` VARCHAR(20) NULL DEFAULT NULL , `p2_assignment` VARCHAR(20) NULL DEFAULT NULL , `p3_assignment` VARCHAR(20) NULL DEFAULT NULL , `p4_assignment` VARCHAR(20) NULL DEFAULT NULL , `p5_assignment` VARCHAR(20) NULL DEFAULT NULL , `p8_assignment` VARCHAR(20) NULL DEFAULT NULL , `p9_assignment` VARCHAR(20) NULL DEFAULT NULL , `p10_assignment` VARCHAR(20) NULL DEFAULT NULL ) ENGINE = InnoDB;
