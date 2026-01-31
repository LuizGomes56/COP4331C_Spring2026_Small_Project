<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Utils\Responder;
use mysqli;

final class ContactsController {

    public function getContacts(Request $req, Response $res): Response {
        return Responder::unimplemented($res);
    }

    public function createContact(Request $req, Response $res): Response {
        $inData = Responder::getBody($req);

        // Basic validation
        if (!isset($inData['name']) || !isset($inData['user_id'])) {
            return Responder::json($res, ["ok" => false, "error" => "Name and User ID are required"]);
        }

        $conn = db();

        $stmt = $conn->prepare("INSERT INTO Contacts (Name, Phone, Email, UserID) VALUES (?, ?, ?, ?)");

        // Empty strings if phone/email aren't provided
        $phone = $inData["phone"] ?? "";
        $email = $inData["email"] ?? "";

        $stmt->bind_param("sssi", $inData["name"], $phone, $email, $inData["user_id"]);

        if ($stmt->execute()) {
            $conn->close();
            return Responder::json($res, ["ok" => true, "message" => "Contact added successfully"]);
        } else {
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Failed to add contact"]);
        }
    }

    public function updateContact(Request $req, Response $res): Response {
        return Responder::unimplemented($res);
    }

    public function replaceContact(Request $req, Response $res): Response {
        return Responder::unimplemented($res);
    }

    public function deleteContact(Request $req, Response $res): Response {
        return Responder::unimplemented($res);
    }

    public function searchContacts(Request $req, Response $res): Response {
        return Responder::unimplemented($res);
    }
}
