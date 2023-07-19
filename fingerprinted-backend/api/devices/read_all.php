<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once '../../config/Database.php';
include_once '../../models/devices.php';

$database = new Database();
$db = $database->connect();

$device = new Device($db);
$result = $device->read_all();

$num = $result->rowCount();
if ($num > 0) {
    $device_arr = array();
    $device_arr['data'] = array();

    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $post_item = array(
            'key' => $id,
            'name' => $name,
            'uid' => $uid,
            'mode' => $mode,
        );
        array_push($device_arr['data'], $post_item);
    }
    echo json_encode($device_arr);
} else {
    echo json_encode(array('error' => 'No Devices Found'));
}
