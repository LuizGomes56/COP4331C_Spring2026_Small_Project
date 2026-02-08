<?php

declare(strict_types=1);

namespace App\Utils;

use Slim\Psr7\Request;
use Slim\Psr7\Response;

final class Responder {
    public static function unimplemented(Response $res): Response {
        return Responder::json($res, ["ok" => false, "error" => "Unimplemented"]);
    }

    public static function json(Response $res, array $data, int $status = 200): Response {
        $res->getBody()->write(json_encode($data, JSON_UNESCAPED_SLASHES));
        return $res->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public static function getBody(Request $req): null | array | object {
        return $req->getParsedBody();
    }
}
