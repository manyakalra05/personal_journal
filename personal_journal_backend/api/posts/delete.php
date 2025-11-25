<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->user_id)) {

    $check_query = "SELECT id FROM posts WHERE id = :id AND user_id = :user_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":id", $data->id);
    $check_stmt->bindParam(":user_id", $data->user_id);
    $check_stmt->execute();

    if ($check_stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(["message" => "Unauthorized to delete this post."]);
        exit();
    }

    $query = "DELETE FROM posts WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);

    $stmt->bindParam(":id", $data->id);
    $stmt->bindParam(":user_id", $data->user_id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Post deleted successfully."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete post."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to delete post. Data is incomplete."]);
}
?>
