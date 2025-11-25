<?php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if ($user_id) {
    $query = "SELECT n.*, COUNT(p.id) as post_count 
              FROM notebooks n
              LEFT JOIN posts p ON n.id = p.notebook_id AND p.user_id = :user_id
              WHERE n.user_id = :user_id
              GROUP BY n.id
              ORDER BY n.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    
    $notebooks = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $notebooks[] = $row;
    }
    
    http_response_code(200);
    echo json_encode($notebooks);
} else {
    http_response_code(400);
    echo json_encode(["message" => "User ID required."]);
}
?>