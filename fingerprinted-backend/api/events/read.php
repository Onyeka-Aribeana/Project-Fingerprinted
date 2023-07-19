<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../../config/Database.php';
include_once '../../models/events.php';

$database = new Database();
$db = $database->connect();

$event = new Event($db);
$result = $event->read();

$num = $result->rowCount();
if ($num > 0) {
    $event_arr = array();
    $event_arr['data'] = array();

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $post_item = array(
            'id' => $id,
            'description' => $description,
            'type' => $type,
            'course' => $course_code,
            'startDatetime' => $startDate . "T" . $startTime,
            'endDatetime' => $endDate . "T" . $endTime,
        );
        array_push($event_arr['data'], $post_item);
    }
    echo json_encode($event_arr);
} else {
    echo json_encode(array('error' => 'No meetings for today'));
}
