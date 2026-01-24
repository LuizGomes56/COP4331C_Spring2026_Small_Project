<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class HealthController {
    public function health(Request $req, Response $res): Response {
        $res->getBody()->write(json_encode([
            "ok" => true,
            "time" => date('c'),
        ], JSON_UNESCAPED_SLASHES));

        return $res->withHeader('Content-Type', 'application/json');
    }

    public function echo(Request $req, Response $res): Response {
        $data = $req->getParsedBody();
        $res->getBody()->write(json_encode(["you_sent" => $data], JSON_UNESCAPED_SLASHES));
        return $res->withHeader('Content-Type', 'application/json');
    }
}
