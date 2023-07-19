<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/attendance_log.php';

$database = new Database();
$db = $database->connect();

$log = new Log($db);
$data = json_decode(file_get_contents("php://input"));

$result = $log->student_percentages();
$num = $result->rowCount();

if ($num > 0) {
    $log_arr = array();
    $log_arr['data'] = array();
    $count = 0;
    $course = "";

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        if ($course_id == $data->course && $average_attendance >= $data->attendance_rate * 0.01) {
            $post_item = array(
                'key' => ++$count,
                'fullname' => $first_name . " " . $last_name,
                'matric_no' => $matric_no,
                'lecture' => $course_code,
                'attendance_rate' => round($average_attendance * 100)
            );

            array_push($log_arr['data'], $post_item);
        }
    }
    if (count($log_arr['data']) > 0) {
        echo json_encode($log_arr);
    } else {
        echo json_encode(array('error' => 'No log found for ' . $data->course_code));
    }
}
