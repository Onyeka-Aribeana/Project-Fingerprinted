<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../../config/Database.php';
include_once '../../models/students.php';

// instantiate db and connect
$database = new Database();
$db = $database->connect();

// instantiate blog post object
$student = new Student($db);

// Get id from url
$student->id = isset($_GET['id']) ? $_GET['id'] : die();

//Get student
$student->read_single();

// Create array
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

// Make JSON
print_r(json_encode($post_array));