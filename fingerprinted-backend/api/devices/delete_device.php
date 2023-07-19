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

if ($device->delete_device()) {
    echo json_encode(
        array('success' => "Successfully deleted device: " . $device->name)
    );
} else {
    echo json_encode(
        array('error' => "Error establishing a database connection")
    );
}
