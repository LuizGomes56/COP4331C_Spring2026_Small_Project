<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Utils\Responder;

use const App\Utils\BAD_REQUEST;
use const App\Utils\CONFLICT;
use const App\Utils\INTERNAL_SERVER_ERROR;

ini_set('log_errors', 1);
final class UsersController {
    public function login(Request $req, Response $res): Response {
        $inData = Responder::getBody($req);

        $email    = trim((string)($inData["email"] ?? ""));
        $password = trim((string)($inData["password"] ?? ""));


        foreach (["email" => $email, "password" => $password] as $field => $value) {
            if ($value === "") {
                return Responder::json($res, ["ok" => false, "error" => "Missing field `$field`, field:`$value`'"], BAD_REQUEST);
            }
        }

        $conn = db();

        // Busca o usuário pelo email
        $stmt = $conn->prepare("SELECT user_id, password_hash FROM users WHERE email = ? LIMIT 1");
        if (!$stmt) {
            $err = $conn->error;
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Login query failed: $err"], INTERNAL_SERVER_ERROR);
        }

        $userId = "";
        $passwordHash = "";

        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->bind_result($userId, $passwordHash);

        if (!$stmt->fetch()) {
            $stmt->close();
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "[fetch] Invalid credentials"], BAD_REQUEST);
        }

        $stmt->close();
        $conn->close();

        if (!password_verify($password, $passwordHash)) {
            return Responder::json($res, ["ok" => false, "error" => "[password_verify] Invalid credentials"], BAD_REQUEST);
        }

        return Responder::json($res, ["ok" => true, "user_id" => $userId]);
    }

    public function register(Request $req, Response $res): Response {
        $inData = Responder::getBody($req);

        $fullName = trim((string)($inData["full_name"] ?? ""));
        $email    = trim((string)($inData["email"] ?? ""));
        $password = trim((string)($inData["password"] ?? ""));

        foreach (["full_name" => $fullName, "email" => $email, "password" => $password] as $field => $value) {
            if ($value === "") {
                return Responder::json($res, ["ok" => false, "error" => "Missing field `$field`"], BAD_REQUEST);
            }
        }

        $conn = db();

        // verifiy if user already exists
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
        if (!$stmt) {
            return Responder::json($res, ["ok" => false, "error" => "Check user existence failed: " . $conn->error], INTERNAL_SERVER_ERROR);
        }

        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->close();
            return Responder::json($res, ["ok" => false, "error" => "User Already Exists"], CONFLICT);
        }
        $stmt->close();

        // insert new user (if gets here then there's no existent user)
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)");
        if (!$stmt) {
            return Responder::json($res, ["ok" => false, "error" => "Prepare failed: " . $conn->error], INTERNAL_SERVER_ERROR);
        }

        $stmt->bind_param("sss", $fullName, $email, $hash);

        if (!$stmt->execute()) {
            $err = $stmt->error;
            $stmt->close();
            return Responder::json($res, ["ok" => false, "error" => "Registration failed: " . $err], INTERNAL_SERVER_ERROR);
        }

        $stmt->close();

        return Responder::json($res, ["ok" => true, "out" => "Registration successful"]);
    }
}
