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
$student->get_id($data->matric_no);

if ($student->id) {
    echo json_encode($student->id);
} else {
    echo json_encode(array('error' => 'No Student Found'));
}
