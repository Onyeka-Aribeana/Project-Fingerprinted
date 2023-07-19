<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/admin.php';

$database = new Database();
$db = $database->connect();

$admin = new Admin($db);

$data = json_decode(file_get_contents("php://input"));
$admin->email = $data->email;
$admin->password = $data->password;

$result = $admin->read_single();

if (isset($result['error'])) {
    echo json_encode($result);
} else {
    echo json_encode(array("id" => $admin->id, "name" => $admin->first_name . " " .  $admin->last_name, "email" => $admin->email, "role" => $admin->role));
}
