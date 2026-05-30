<?php
require 'conexao.php';

$dts = json_decode(file_get_contents("php://input"), true);

$nom = $dts['nome'] ?? '';
$eml = $dts['email'] ?? '';
$snh = $dts['senha'] ?? '';

if (!$nom || !$eml || !$snh) {
    echo json_encode(["success" => false, "message" => "Dados vazios."]);
    exit;
}

try {
    $stm = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stm->execute([$eml]);
    
    if ($stm->fetch()) {
        echo json_encode(["success" => false, "message" => "Email em uso."]);
        exit;
    }

    $snhHsh = password_hash($snh, PASSWORD_DEFAULT);

    $stm = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, tentativas_falhas) VALUES (?, ?, ?, 0)");
    $stm->execute([$nom, $eml, $snhHsh]);

    echo json_encode(["success" => true, "message" => "Criado."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro no banco."]);
}
?>