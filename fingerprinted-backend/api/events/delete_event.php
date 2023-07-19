<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/events.php';

$database = new Database();
$db = $database->connect();

$event = new Event($db);

$data = json_decode(file_get_contents("php://input"));
$event->id = $data->id;

if ($event->delete_event()) {
    echo json_encode(
        array('success' => "Successfully deleted event: " . $event->description)
    );
} else {
    echo json_encode(
        array('error' => "Error establishing a database connection")
    );
}
