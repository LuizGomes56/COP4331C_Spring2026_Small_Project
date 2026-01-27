<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Utils\Responder;

final class UsersController {
    public function register(Request $req, Response $res): Response {
        $inData = Responder::getBody($req);
        
        $conn = new \SQLite3(__DIR__ . "/test.db");

        //Check if User Exists
        //$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login = ?");
        //$stmt->bind_param("s", $inData["login"]);
        //$result = $stmt->get_result();
        $stmt = $conn->prepare("SELECT id FROM Users WHERE Login = :login");
        $stmt->bindValue(":login", $inData["login"], SQLITE3_TEXT);
        $result = $stmt->execute();

        //If user was already registered (login conflict)
        //if($row = $result->fetch_assoc() ) {
        if( $result->fetchArray(SQLITE3_ASSOC) ) {
            $json = ["ok" => false, "error" => "User Already Exists"];
            return Responder::json($res, $json);
        }
        
        //$passwordHash = password_hash($inData["password"], PASSWORD_DEFAULT);
        //$stmt = $conn->prepare("INSERT INTO Users (Login, Password, Name) VALUES (?, ?, ?)");
        //$stmt->bind_param("sss", $inData["login"], passwordHash, $inData["name"]);
        
        //Prepares to insert new User
        $stmt = $conn->prepare("INSERT INTO Users (Login, Password, Name) VALUES (:login, :password, :name)");
        $stmt->bindValue(":login", $inData["login"], SQLITE3_TEXT);
        $stmt->bindValue(":password", password_hash($inData["password"], PASSWORD_DEFAULT), SQLITE3_TEXT);
        $stmt->bindValue(":name", $inData["name"], SQLITE3_TEXT);

        //If execution failure
        if(!$stmt->execute()) {
            $json = ["ok" => false, "error" => "Registration failed"];
            return Responder::json($res, $json);
        }

        //Close DB and return success

        $conn->close();

        $json = ["ok" => true, "out" => "Registration successful"];
        return Responder::json($res, $json);
    }
}
