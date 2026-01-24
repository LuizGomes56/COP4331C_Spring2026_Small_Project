<?php

declare(strict_types=1);

use Slim\App;
use App\Controllers\HealthController;

return function (App $app): void {
    $app->get('/health', [HealthController::class, 'health']);
    $app->post('/echo',  [HealthController::class, 'echo']);
};
