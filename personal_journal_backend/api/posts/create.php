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

if (
    !empty($data->user_id) &&
    !empty($data->title)
) {
    $streak_query = "INSERT INTO writing_streaks (user_id, streak_date) 
                     VALUES (:user_id, CURDATE()) 
                     ON DUPLICATE KEY UPDATE streak_date = streak_date";
    $streak_stmt = $db->prepare($streak_query);
    $streak_stmt->bindParam(":user_id", $data->user_id);
    $streak_stmt->execute();
    
    $query = "INSERT INTO posts (user_id, title, content, category_id, notebook_id, is_public, is_pinned, is_draft, featured_image, tags)
              VALUES (:user_id, :title, :content, :category_id, :notebook_id, :is_public, :is_pinned, :is_draft, :featured_image, :tags)";
    $stmt = $db->prepare($query);
    
    $user_id = htmlspecialchars(strip_tags($data->user_id));
    $title = htmlspecialchars(strip_tags($data->title));
    $content = $data->content ?? '';
    $category_id = !empty($data->category_id) ? $data->category_id : null;
    $notebook_id = !empty($data->notebook_id) ? $data->notebook_id : null;
    $is_public = isset($data->is_public) ? ($data->is_public ? 1 : 0) : 0;
    $is_pinned = isset($data->is_pinned) ? ($data->is_pinned ? 1 : 0) : 0;
    $is_draft = isset($data->is_draft) ? ($data->is_draft ? 1 : 0) : 0;
    $featured_image = !empty($data->featured_image) ? htmlspecialchars(strip_tags($data->featured_image)) : null;
    $tags = !empty($data->tags) ? htmlspecialchars(strip_tags($data->tags)) : null;
    
    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":title", $title);
    $stmt->bindParam(":content", $content);
    $stmt->bindParam(":category_id", $category_id);
    $stmt->bindParam(":notebook_id", $notebook_id);
    $stmt->bindParam(":is_public", $is_public);
    $stmt->bindParam(":is_pinned", $is_pinned);
    $stmt->bindParam(":is_draft", $is_draft);
    $stmt->bindParam(":featured_image", $featured_image);
    $stmt->bindParam(":tags", $tags);
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "message" => "Post created successfully.",
            "post_id" => $db->lastInsertId()
        ]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to create post."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to create post. Data is incomplete."]);
}
?>