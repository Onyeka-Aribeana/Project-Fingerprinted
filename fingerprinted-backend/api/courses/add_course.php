<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/courses.php';

$database = new Database();
$db = $database->connect();

$course = new Course($db);

$data = json_decode(file_get_contents("php://input"));
$course->course_name = $data->name;
$course->course_code = $data->code;
$course->dept = $data->dept;
$response = $course->add_new();

if (isset($response['error'])) {
    echo json_encode($response);
} else if ($response === true) {
    echo json_encode(
        array('success' => "Added new course: " . $course->course_name . ", to the database")
    );
} else if ($response === false) {
    echo json_encode(
        array('error' => "Error establishing a database connection")
    );
}
