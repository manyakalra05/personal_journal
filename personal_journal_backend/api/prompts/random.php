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

$query = "SELECT * FROM writing_prompts ORDER BY RAND() LIMIT 1";
$stmt = $db->prepare($query);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $prompt = $stmt->fetch(PDO::FETCH_ASSOC);
    http_response_code(200);
    echo json_encode($prompt);
} else {
    http_response_code(404);
    echo json_encode(["message" => "No prompts found."]);
}
?>