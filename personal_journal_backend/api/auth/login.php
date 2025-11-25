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

if (!empty($data->username) && !empty($data->password)) {

    $query = "SELECT id, username, email, full_name, password FROM users WHERE username = :username";
    $stmt = $db->prepare($query);

    $username = htmlspecialchars(strip_tags($data->username));
    $stmt->bindParam(":username", $username);
    $stmt->execute();

    if ($stmt->rowCount() == 1) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (password_verify($data->password, $row['password'])) {

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful.",
                "user" => [
                    "id" => $row['id'],
                    "username" => $row['username'],
                    "email" => $row['email'],
                    "full_name" => $row['full_name']
                ]
            ]);

        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid password."]);
        }

    } else {
        http_response_code(401);
        echo json_encode(["message" => "User not found."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to login. Data is incomplete."]);
}
?>
