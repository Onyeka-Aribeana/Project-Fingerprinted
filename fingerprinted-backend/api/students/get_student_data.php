<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/students.php';
include_once '../../models/attendance_log.php';

$database = new Database();
$db = $database->connect();

$student = new Student($db);
$log = new Log($db);

$data = json_decode(file_get_contents("php://input"));
$student->id = $data->id;

$student->read_single();

$post_array = array(
    'id' => $student->id,
    'first_name' => $student->first_name,
    'last_name' => $student->last_name,
    'email' => $student->email,
    'matric_no' => $student->matric_no,
    'gender' => $student->gender,
    'device_id' => $student->device_id,
    'fingerprint_id' => $student->fingerprint_id,
    'add_fingerid' => $student->add_fingerid
);

$post_array['courses'] = array();

$result = $log->attendance_by_id($student->id);
$num = $result->rowCount();
if ($num > 0) {
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $post_item = $row;
        array_push($post_array['courses'], $post_item);
    }
    echo json_encode($post_array);
}
