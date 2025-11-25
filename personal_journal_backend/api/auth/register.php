<?php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->username) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->full_name)
) {
    $check_query = "SELECT id FROM users WHERE username = :username OR email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":username", $data->username);
    $check_stmt->bindParam(":email", $data->email);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(array("message" => "Username or email already exists."));
        exit();
    }
    
    $query = "INSERT INTO users (username, email, password, full_name) 
              VALUES (:username, :email, :password, :full_name)";
    $stmt = $db->prepare($query);
    
    $username = htmlspecialchars(strip_tags($data->username));
    $email = htmlspecialchars(strip_tags($data->email));
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    $full_name = htmlspecialchars(strip_tags($data->full_name));
    
    $stmt->bindParam(":username", $username);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password_hash);
    $stmt->bindParam(":full_name", $full_name);
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array("message" => "User registered successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to register user."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to register. Data is incomplete."));
}
?>
