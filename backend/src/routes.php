<?php

declare(strict_types=1);

use Slim\App;
use App\Controllers\HealthController;
use App\Controllers\UsersController;

return function (App $app): void {
    $app->get('/health', [HealthController::class, 'health']);
    $app->post('/echo',  [HealthController::class, 'echo']);
    $app->post("/users/register", [UsersController::class, 'register']);
};
