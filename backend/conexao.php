<?php
try {
    $pdo = new PDO("sqlite:" . __DIR__ . "/banco.sqlite");
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro."]);
    exit;
}
?>