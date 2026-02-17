<?php

declare(strict_types=1);

use App\Controllers\ContactsController;
use Slim\App;
use App\Controllers\HealthController;
use App\Controllers\UsersController;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

return function (App $app): void {
        $app->setBasePath("/api");
        $app->get("/health", [HealthController::class, "health"]);
        $app->post("/echo",  [HealthController::class, "echo"]);
        $app->post("/users/register", [UsersController::class, "register"]);
        $app->post("/users/login", [UsersController::class, "login"]);
        // Returns all contacts
        $app->get("/contacts", [ContactsController::class, "getContacts"]);
        // Creates a new contact
        $app->post("/contacts", [ContactsController::class, "createContact"]);
        $app->get("/contacts/{contact_id}", [ContactsController::class, "getContactByID"]);
        // Updates only one field from some contact
        $app->patch("/contacts/{contact_id}", [ContactsController::class, "updateContact"]);
        // Replace the whole contact
        $app->put("/contacts/{contact_id}", [ContactsController::class, "replaceContact"]);
        // Deletes a contact
        $app->delete("/contacts/{contact_id}", [ContactsController::class, "deleteContact"]);
        // lists contacts with partial search match.
        $app->get("/contacts/search/{query}", [ContactsController::class, "searchContacts"]);
};
