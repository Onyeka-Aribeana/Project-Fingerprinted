<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../../config/Database.php';
include_once '../../models/attendance_log.php';

$database = new Database();
$db = $database->connect();

$log = new Log($db);
$result = $log->read_distinct_today();

$num = $result->rowCount();
if ($num > 0) {
    $log_arr = array();
    $log_arr['data'] = array();

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $inner_arr = array();

        $data = $log->select_by_lecture($row['course_id'], $row['lecture_id']);
        $m = $data->rowCount();

        if ($m > 0) {
            array_push($inner_arr, $row);
            $innermost_arr = array();
            $count = 0;
            while ($data_row = $data->fetch(PDO::FETCH_ASSOC)) {
                extract($data_row);
                $post_item = array(
                    'key' => ++$count,
                    'fullname' => $first_name . " " . $last_name,
                    'matric_no' => $matric_no,
                    'device_name' => $name,
                    'checkInTime' => $checkInTime,
                    'checkInDate' => $checkInDate,
                    'lecture' => $course_code
                );
                array_push($innermost_arr, $post_item);
            }

            array_push($inner_arr, $innermost_arr);
        }

        array_push($log_arr['data'], $inner_arr);
    }
    echo json_encode($log_arr);
} else {
    echo json_encode(array('error' => 'No log found for today'));
}
