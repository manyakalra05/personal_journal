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
$post_id = isset($_GET['post_id']) ? $_GET['post_id'] : null;
$notebook_id = isset($_GET['notebook_id']) ? $_GET['notebook_id'] : null;
$drafts_only = isset($_GET['drafts_only']) && $_GET['drafts_only'] === 'true';

if ($post_id) {
    $query = "SELECT p.*, c.name AS category_name, n.name AS notebook_name, u.username, u.full_name
              FROM posts p
              LEFT JOIN categories c ON p.category_id = c.id
              LEFT JOIN notebooks n ON p.notebook_id = n.id
              LEFT JOIN users u ON p.user_id = u.id
              WHERE p.id = :post_id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":post_id", $post_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $comment_query = "SELECT co.*, u.username, u.full_name 
                          FROM comments co
                          JOIN users u ON co.user_id = u.id
                          WHERE co.post_id = :post_id
                          ORDER BY co.created_at DESC";
        $comment_stmt = $db->prepare($comment_query);
        $comment_stmt->bindParam(":post_id", $post_id);
        $comment_stmt->execute();
        
        $post['comments'] = $comment_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($post);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Post not found."]);
    }

} elseif ($user_id) {
    $query = "SELECT p.*, c.name AS category_name, n.name AS notebook_name
              FROM posts p
              LEFT JOIN categories c ON p.category_id = c.id
              LEFT JOIN notebooks n ON p.notebook_id = n.id
              WHERE p.user_id = :user_id";
    
    if ($notebook_id) {
        $query .= " AND p.notebook_id = :notebook_id";
    }
    
    if ($drafts_only) {
        $query .= " AND p.is_draft = 1";
    }
    
    $query .= " ORDER BY p.is_pinned DESC, p.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    if ($notebook_id) {
        $stmt->bindParam(":notebook_id", $notebook_id);
    }
    $stmt->execute();

    $posts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $posts[] = $row;
    }

    http_response_code(200);
    echo json_encode($posts);

} else {
    $query = "SELECT p.*, c.name AS category_name, n.name AS notebook_name, u.username, u.full_name
              FROM posts p
              LEFT JOIN categories c ON p.category_id = c.id
              LEFT JOIN notebooks n ON p.notebook_id = n.id
              LEFT JOIN users u ON p.user_id = u.id
              WHERE p.is_public = 1 AND p.is_draft = 0
              ORDER BY p.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $posts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $comment_count_query = "SELECT COUNT(*) as count FROM comments WHERE post_id = :post_id";
        $count_stmt = $db->prepare($comment_count_query);
        $count_stmt->bindParam(":post_id", $row['id']);
        $count_stmt->execute();
        $count_row = $count_stmt->fetch(PDO::FETCH_ASSOC);
        $row['comment_count'] = $count_row['count'];
        
        $posts[] = $row;
    }

    http_response_code(200);
    echo json_encode($posts);
}
?>