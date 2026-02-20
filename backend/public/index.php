<?php

declare(strict_types=1);

use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
}

$app = AppFactory::create();

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->add(function (Request $request, $handler): Response {
    if ($request->getMethod() === 'OPTIONS') {
        $response = new \Slim\Psr7\Response();
    } else {
        $response = $handler->handle($request);
    }

    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
});

$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

function env(string $key, ?string $default = null): ?string {
    return $_ENV[$key] ?? $_SERVER[$key] ?? $default;
}

function db(): mysqli {
    $host = env('DB_HOST', '52.205.195.135');
    $port = (int) env('DB_PORT', '3306');
    $user = env('DB_USERNAME', 'contact_user');
    $pass = env('DB_PASSWORD', 'root');
    $name = env('DB_DATABASE', 'contact_manager');

    $conn = new mysqli($host, $user, $pass, $name, $port);

    if ($conn->connect_error) {
        throw new RuntimeException("MySQL connect error: " . $conn->connect_error);
    }

    $conn->set_charset('utf8mb4');

    return $conn;
}

(require __DIR__ . '/../src/routes.php')($app);

$app->run();
