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

if (json_decode(json_encode($event->read_single())) == $data) {
    echo json_encode(array('error' => "No changes were made"));
} else {

    $event->description = $data->description;
    $event->type = $data->type;
    $event->course = $data->course;
    $event->startDate = $data->startDate;
    $event->endDate = $data->endDate;
    $event->startTime = $data->startTime;
    $event->endTime = $data->endTime;

    if ($event->update_event()) {
        echo json_encode(
            array('success' => "Successfully updated event info")
        );
    } else {
        echo json_encode(
            array('error' => "Error establishing a database connection")
        );
    }
}
