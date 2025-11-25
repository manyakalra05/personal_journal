<?php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: PUT, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->id) &&
    !empty($data->user_id) &&
    !empty($data->title)
) {
    $check_query = "SELECT id FROM posts WHERE id = :id AND user_id = :user_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":id", $data->id);
    $check_stmt->bindParam(":user_id", $data->user_id);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() == 0) {
        http_response_code(403);
        echo json_encode(["message" => "Unauthorized to update this post."]);
        exit();
    }
    
    if (!isset($data->is_draft) || !$data->is_draft) {
        $streak_query = "INSERT INTO writing_streaks (user_id, streak_date) 
                         VALUES (:user_id, CURDATE()) 
                         ON DUPLICATE KEY UPDATE streak_date = streak_date";
        $streak_stmt = $db->prepare($streak_query);
        $streak_stmt->bindParam(":user_id", $data->user_id);
        $streak_stmt->execute();
    }
    
    $query = "UPDATE posts
              SET title = :title,
                  content = :content,
                  category_id = :category_id,
                  notebook_id = :notebook_id,
                  is_public = :is_public,
                  is_pinned = :is_pinned,
                  is_draft = :is_draft,
                  featured_image = :featured_image,
                  tags = :tags
              WHERE id = :id AND user_id = :user_id";

    $stmt = $db->prepare($query);

    $id = htmlspecialchars(strip_tags($data->id));
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

    $stmt->bindParam(":id", $id);
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
        http_response_code(200);
        echo json_encode(["message" => "Post updated successfully."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to update post."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>