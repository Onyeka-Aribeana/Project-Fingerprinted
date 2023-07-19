<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/devices.php';

$database = new Database();
$db = $database->connect();

$device = new Device($db);

$data = json_decode(file_get_contents("php://input"));
$device->id = $data->id;
$device->mode = $data->mode;

if ($device->switch_mode()) {
    echo json_encode(
        array('success' => "Successfully switched the device mode for " . $device->name)
    );
} else {
    echo json_encode(
        array('error' => "Error establishing a database connection")
    );
}
