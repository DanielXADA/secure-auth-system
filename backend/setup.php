<?php
require 'conexao.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        tentativas_falhas INTEGER DEFAULT 0,
        bloqueado_ate DATETIME DEFAULT NULL
    )";
    
    $pdo->exec($sql);
    echo "<h1>Setup concluido!</h1>";
} catch (PDOException $e) {
    echo "<h1>Erro no setup</h1>";
}
?>