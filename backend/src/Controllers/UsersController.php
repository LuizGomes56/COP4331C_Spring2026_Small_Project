<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Utils\Responder;

final class UsersController {
    public function register(Request $req, Response $res): Response {
        $body = Responder::getBody($req);

        // Example of db querying
        // $db = db();

        // $db->execute_query(
        //     "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)",
        //     [
        //         ':name' => $body['name'],
        //         ':email' => $body['email'],
        //         ':password' => $body['password'],
        //     ]
        // );

        $json = ["data" => $body, "ok" => true, "time" => date('c')];

        return Responder::json($res, $json);
    }
}
