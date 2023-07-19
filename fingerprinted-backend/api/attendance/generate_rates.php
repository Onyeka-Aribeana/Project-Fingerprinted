<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../../config/Database.php';
include_once '../../models/attendance_log.php';

$database = new Database();
$db = $database->connect();

$log = new Log($db);
$result = $log->get_attendance_rates();

$num = $result->rowCount();
if ($num > 0) {
    $student_arr = array();
    $student_arr['rates'] = array();

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $post_item = $row;
        array_push($student_arr['rates'], $post_item);
    }
    echo json_encode($student_arr);
} else {
    echo json_encode(array('error' => 'No Students Found'));
}
