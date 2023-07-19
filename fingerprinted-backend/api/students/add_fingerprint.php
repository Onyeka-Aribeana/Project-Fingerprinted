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

if ($student->add_fingerprint()) {
    echo json_encode(
        array('success' => "Successfully added prints for " . $student->first_name . " " . $student->last_name)
    );
} else {
    echo json_encode(
        array('error' => "Error establishing a database connection")
    );
}
