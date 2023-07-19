<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../../config/Database.php';
include_once '../../models/courses.php';

$database = new Database();
$db = $database->connect();

$course = new Course($db);
$result = $course->read_valid_code();

$num = $result->rowCount();
if ($num > 0) {
    $course_arr = array();
    $course_arr['data'] = array();

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $post_item = array(
            'id' => $id,
            'name' => $course_code,
        );
        array_push($course_arr['data'], $post_item);
    }
    echo json_encode($course_arr);
} else {
    echo json_encode(array('error' => 'No Courses Found'));
}
