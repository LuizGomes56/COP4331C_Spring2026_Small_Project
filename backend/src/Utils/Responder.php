<?php

declare(strict_types=1);

namespace App\Utils;

use Slim\Psr7\Request;
use Slim\Psr7\Response;

final class Responder {
    public static function json(Response $res, array $data): Response {
        $res->getBody()->write(json_encode($data, JSON_UNESCAPED_SLASHES));
        return $res->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public static function getBody(Request $req): null | array | object {
        return $req->getParsedBody();
    }
}
