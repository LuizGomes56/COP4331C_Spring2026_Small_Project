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
        if (!is_string($inData['name']) || !is_numeric($inData['user_id'])) {
            return Responder::json($res, ["ok" => false, "error" => "The name must be a string and user_id must be a number"], 400);
        }


        $conn = db();

        $stmt = $conn->prepare("INSERT INTO Contacts (Name, Phone, Email, UserID) VALUES (?, ?, ?, ?)");

        // Empty strings if phone/email aren't provided
        $phone = $inData["phone"] ?? "";
        $email = $inData["email"] ?? "";

        if (!is_string($phone) || !is_string($email)) {
            return Responder::json($res, ["ok" => false, "error" => "The phone and email must be strings"], 400);
        }

        if (!str_contains($email, "@")) {
            return Responder::json($res, ["ok" => false, "error" => "The email must be a valid email"], 400);
        }

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

    public function searchContacts(Request $req, Response $res, array $args): Response {
        $queryParams = $req->getQueryParams();

        if (!is_numeric($queryParams['user_id'])) {
            return Responder::json($res, ["ok" => false, "error" => "The user_id must be a number"], 400);
        }

        $search = $args['query'] ?? "";

        if (!is_string($search)) {
            return Responder::json($res, ["ok" => false, "error" => "Search query must be a string"], 400);
        }

        $userId = (int) $queryParams['user_id'];

        $conn = db();

        $searchPattern = "%" . $search . "%";
        $stmt = $conn->prepare(
            "SELECT *
             FROM contacts
             WHERE user_id = ? AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR notes LIKE ?)"
        );
        $stmt->bind_param("issss", $userId, $searchPattern, $searchPattern, $searchPattern, $searchPattern);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $contacts = [];
            while ($row = $result->fetch_assoc()) {
                $contacts[] = $row;
            }
            $conn->close();
            return Responder::json($res, ["ok" => true, "contacts" => $contacts]);
        } else {
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Failed to search contacts"], 500);
        }
    }
}
