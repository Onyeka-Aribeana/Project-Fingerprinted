<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../../config/Database.php';
include_once '../../models/attendance_log.php';

$database = new Database();
$db = $database->connect();

$log = new Log($db);
$result = $log->read_lecture();

$num = $result->rowCount();
if ($num > 0) {
    $log_arr = array();
    $log_arr['data'] = array();

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $post_item = array(
            'name' => $lecture,
        );
        array_push($log_arr['data'], $post_item);
    }
    echo json_encode($log_arr);
} else {
    echo json_encode(array('error' => 'No log found for today'));
}
