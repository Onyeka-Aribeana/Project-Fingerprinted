
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

$result = $log->recent_reports();
$num = $result->rowCount();

if ($num > 0) {
    $log_arr = array();
    $log_arr['data'] = array();

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        array_push($log_arr['data'], $row);
    }
    echo json_encode($log_arr);
} else {
    echo json_encode(array('error' => 'No recent log found'));
}
