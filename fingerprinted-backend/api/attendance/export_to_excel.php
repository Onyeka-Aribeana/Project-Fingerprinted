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

$result = $log->select_by_lecture($data->course_id, $data->lecture_id);
$num = $result->rowCount();

if ($num > 0) {
    $log_arr = array();
    $log_arr['data'] = array();
    $count = 0;

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $post_item = array(
            'key' => ++$count,
            'fullname' => $first_name . " " . $last_name,
            'matric_no' => $matric_no,
            'device_name' => $name,
            'checkInTime' => $checkInTime,
            'checkInDate' => $checkInDate,
            'lecture' => $course_code
        );
        array_push($log_arr['data'], $post_item);
    }
    echo json_encode($log_arr);
} else {
    echo json_encode(array('error' => 'No log found for today'));
}
