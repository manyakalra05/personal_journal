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
    $query = "SELECT streak_date FROM writing_streaks 
              WHERE user_id = :user_id 
              ORDER BY streak_date DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    
    $dates = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $dates[] = $row['streak_date'];
    }
    
    $current_streak = 0;
    $today = new DateTime();
    $check_date = clone $today;
    
    foreach ($dates as $date) {
        $streak_date = new DateTime($date);
        $diff = $check_date->diff($streak_date)->days;
        
        if ($diff == 0) {
            $current_streak++;
            $check_date->modify('-1 day');
        } else {
            break;
        }
    }
    
    http_response_code(200);
    echo json_encode([
        "current_streak" => $current_streak,
        "total_days" => count($dates),
        "dates" => $dates
    ]);
} else {
    http_response_code(400);
    echo json_encode(["message" => "User ID required."]);
}
?>