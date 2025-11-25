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
header("Access-Control-Max-Age: 3600");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT * FROM categories ORDER BY name ASC";
$stmt = $db->prepare($query);
$stmt->execute();

$categories = array();
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $categories[] = $row;
}

http_response_code(200);
echo json_encode($categories);
?>
