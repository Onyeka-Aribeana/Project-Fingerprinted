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
$device->name = $data->name;
$response = $device->add_new();

if (isset($response['error'])) {
    echo json_encode($response);
} else if ($response === true) {
    echo json_encode(
        array('success' => "Added new device: " . $device->name . ", to the database")
    );
} else if ($response === false) {
    echo json_encode(
        array('error' => "We encountered an error trying to add a new device. Please try again later")
    );
}
