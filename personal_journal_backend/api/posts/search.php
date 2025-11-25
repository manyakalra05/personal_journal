<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$search_term = isset($_GET['q']) ? $_GET['q'] : '';
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!empty($search_term)) {

    $search_param = "%" . $search_term . "%";

    if ($user_id) {

        $query = "SELECT p.*, c.name AS category_name 
                  FROM posts p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  WHERE p.user_id = :user_id
                  AND (p.title LIKE :search OR p.content LIKE :search OR p.tags LIKE :search)
                  ORDER BY p.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":search", $search_param);

    } else {

        $query = "SELECT p.*, c.name AS category_name, u.username, u.full_name 
                  FROM posts p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  LEFT JOIN users u ON p.user_id = u.id 
                  WHERE p.is_public = 1
                  AND (p.title LIKE :search OR p.content LIKE :search OR p.tags LIKE :search)
                  ORDER BY p.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":search", $search_param);
    }

    $stmt->execute();

    $posts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $posts[] = $row;
    }

    http_response_code(200);
    echo json_encode($posts);

} else {

    http_response_code(400);
    echo json_encode(["message" => "Search term is required."]);
}

?>
