<?php

declare(strict_types=1);

use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

function db(): mysqli {
    static $conn = null;

    if ($conn instanceof mysqli) {
        return $conn;
    }

    $conn = new mysqli('localhost', 'root', 'root', 'contact_manager');
    if ($conn->connect_error) {
        throw new RuntimeException('DB connect error: ' . $conn->connect_error);
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}

(require __DIR__ . '/../src/routes.php')($app);

$app->run();
