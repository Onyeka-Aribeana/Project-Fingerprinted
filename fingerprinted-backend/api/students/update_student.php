<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/students.php';

$database = new Database();
$db = $database->connect();

$student = new Student($db);

$data = json_decode(file_get_contents("php://input"));
$student->id = $data->id;
$student->first_name = $data->first_name;
$student->last_name = $data->last_name;
$student->matric_no = $data->matric_no;
$student->email = $data->email;
$student->gender = $data->gender;
$student->device_id = $data->device_id;
$student->courses = $data->enrolled_courses;

$response = $student->update_student();

if (isset($response['error'])) {
    echo json_encode($response);
} else if ($response === true) {
    echo json_encode(
        array('success' => "Successfully updated student info")
    );
} else if ($response === false) {
    echo json_encode(
        array('error' => "Error establishing a database connection")
    );
}
