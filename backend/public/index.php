<?php

declare(strict_types=1);

use Slim\Factory\AppFactory;
use Slim\Handlers\Strategies\RequestHandler;
use Slim\Psr7\Request;
use Slim\Psr7\Response;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$app = AppFactory::create();

$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

function env(string $key, ?string $default = null): ?string {
    return $_ENV[$key] ?? $_SERVER[$key] ?? $default;
}

function db(): mysqli {
    $host = env('DB_HOST', '127.0.0.1');
    $port = (int) env('DB_PORT', '3306');
    $user = env('DB_USERNAME', 'root');
    $pass = env('DB_PASSWORD', '');
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
