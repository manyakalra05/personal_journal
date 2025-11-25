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
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->name)) {
    $query = "INSERT INTO notebooks (user_id, name, description, color)
              VALUES (:user_id, :name, :description, :color)";
    
    $stmt = $db->prepare($query);
    
    $user_id = htmlspecialchars(strip_tags($data->user_id));
    $name = htmlspecialchars(strip_tags($data->name));
    $description = !empty($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;
    $color = !empty($data->color) ? htmlspecialchars(strip_tags($data->color)) : '#6b4423';
    
    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":description", $description);
    $stmt->bindParam(":color", $color);
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "message" => "Notebook created successfully.",
            "notebook_id" => $db->lastInsertId()
        ]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to create notebook."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>