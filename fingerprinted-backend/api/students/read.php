<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../../config/Database.php';
include_once '../../models/students.php';

$database = new Database();
$db = $database->connect();

$student = new Student($db);
$result = $student->read();

$num = $result->rowCount();
if ($num > 0) {
    $student_arr = array();
    $student_arr['data'] = array();

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $post_item = $row;
        $post_item['courses'] = array();
        $courses = $student->fetch_enrolled_courses($row['id']);
        array_push($post_item['courses'], ...$courses);
        array_push($student_arr['data'], $post_item);
    }
    echo json_encode($student_arr);
} else {
    echo json_encode(array('error' => 'No Students Found'));
}
