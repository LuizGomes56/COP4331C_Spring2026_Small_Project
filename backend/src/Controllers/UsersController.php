<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Utils\Responder;

final class UsersController {
    public function register(Request $req, Response $res): Response {
        $inData = Responder::getBody($req);

        $fullName = trim((string)($inData["full_name"] ?? ""));
        $email    = trim((string)($inData["email"] ?? ""));
        $password = trim((string)($inData["password"] ?? ""));

        foreach (["full_name" => $fullName, "email" => $email, "password" => $password] as $field => $value) {
            if ($value === "") {
                return Responder::json($res, ["ok" => false, "error" => "Missing field `$field`"]);
            }
        }

        $conn = db();

        // verifiy if user already exists
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
        if (!$stmt) {
            return Responder::json($res, ["ok" => false, "error" => "Prepare failed: " . $conn->error]);
        }

        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->close();
            return Responder::json($res, ["ok" => false, "error" => "User Already Exists"]);
        }
        $stmt->close();

        // insert new user (if gets here then there's no existent user)
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)");
        if (!$stmt) {
            return Responder::json($res, ["ok" => false, "error" => "Prepare failed: " . $conn->error]);
        }

        $stmt->bind_param("sss", $fullName, $email, $hash);

        if (!$stmt->execute()) {
            $err = $stmt->error;
            $stmt->close();
            return Responder::json($res, ["ok" => false, "error" => "Registration failed: " . $err]);
        }

        $stmt->close();

        return Responder::json($res, ["ok" => true, "out" => "Registration successful"]);
    }
}
