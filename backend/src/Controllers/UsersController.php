<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Responder;

final class UsersController {
    public function register(Request $req, Response $res): Response {
        $body = Responder::getBody($req);
        $json = ["data" => $body, "ok" => true, "time" => date('c')];

        return Responder::json($res, $json);
    }
}
