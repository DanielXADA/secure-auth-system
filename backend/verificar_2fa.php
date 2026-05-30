<?php
require 'conexao.php';

$dts = json_decode(file_get_contents("php://input"), true);
$eml = $dts['email'] ?? '';
$pin = $dts['pin'] ?? '';

if (!$eml || !$pin) {
    echo json_encode(["success" => false, "message" => "Dados vazios."]);
    exit;
}

try {
    $stm = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stm->execute([$eml]);
    $usr = $stm->fetch();

    if (!$usr) {
        echo json_encode(["success" => false, "message" => "Usuario invalido."]);
        exit;
    }

    if ($pin === '1234') {
        echo json_encode(["success" => true, "message" => "Validado."]);
    } else {
        echo json_encode(["success" => false, "message" => "PIN errado."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro no banco."]);
}
?>