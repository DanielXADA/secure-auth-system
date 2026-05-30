<?php
require 'conexao.php';

$dts = json_decode(file_get_contents("php://input"), true);
$eml = $dts['email'] ?? '';
$snh = $dts['senha'] ?? '';

try {
    $stm = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stm->execute([$eml]);
    $usr = $stm->fetch();

    if (!$usr) {
        echo json_encode(["success" => false, "message" => "Nao encontrado."]);
        exit;
    }

    $agr = new DateTime();
    
    if ($usr['bloqueado_ate']) {
        $tmpBlq = new DateTime($usr['bloqueado_ate']);
        if ($agr < $tmpBlq) {
            echo json_encode(["success" => false, "is_blocked" => true, "message" => "Acesso bloqueado."]);
            exit;
        }
    }

    if (password_verify($snh, $usr['senha'])) {
        $stm = $pdo->prepare("UPDATE usuarios SET tentativas_falhas = 0, bloqueado_ate = NULL WHERE id = ?");
        $stm->execute([$usr['id']]);
        
        echo json_encode(["success" => true, "message" => "Login OK."]);
    } else {
        $tent = $usr['tentativas_falhas'] + 1;
        $blqAte = null;
        $blq = false;
        
        if ($tent >= 3) {
            $agr->modify('+30 seconds');
            $blqAte = $agr->format('Y-m-d H:i:s');
            $blq = true;
        }

        $stm = $pdo->prepare("UPDATE usuarios SET tentativas_falhas = ?, bloqueado_ate = ? WHERE id = ?");
        $stm->execute([$tent, $blqAte, $usr['id']]);

        echo json_encode([
            "success" => false, 
            "is_blocked" => $blq, 
            "message" => $blq ? "Bloqueado." : "Senha errada."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erro no login."]);
}
?>