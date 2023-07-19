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
$event->description = $data->description;
$event->type = $data->type;
$event->course = $data->course;
$event->startDate = $data->startDate;
$event->endDate = $data->endDate;
$event->startTime = $data->startTime;
$event->endTime = $data->endTime;

if ($event->add_event()) {
    echo json_encode(
        array('success' => "Added new event: " . $event->description . ", to the database")
    );
} else {
    echo json_encode(
        array('error' => "We encountered an error trying to add a new event. Please try again later")
    );
}
