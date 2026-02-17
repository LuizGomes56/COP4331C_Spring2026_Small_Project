<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Utils\Responder;
use mysqli;

final class ContactsController {

    public function getContacts(Request $req, Response $res): Response {
        $queryParams = $req->getQueryParams();

        //Check if input is valid
        if (!is_numeric($queryParams['user_id']) || ($queryParams['user_id'] === "")) {
            return Responder::json($res, ["ok" => false, "error" => "The User ID is invalid"], 400);
        }

        $conn = db();

        $userId = (int)$queryParams['user_id'];

        //Search for all contacts relating to the user
        $stmt = $conn->prepare("SELECT contact_id, full_name, email, phone, notes, created_at FROM contacts WHERE user_id = ?");

        $stmt->bind_param("i", $userId);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $results = [];
            while ($row = $result->fetch_assoc()) {
                $results[] = $row;
            }
        } else {
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Failed to get contacts"]);
        }

        $conn->close();

        return Responder::json($res, ["ok" => true, "contacts" => $results]);
    }

    public function getContactByID(Request $req, Response $res, array $args): Response {
        $contactId = $args['contact_id'] ?? "";

        if (!is_numeric($contactId)) {
            return Responder::json($res, ["ok" => false, "error" => "contact_id must be numeric"], 400);
        }

        $contactId = (int) $contactId;

        $conn = db();

        $stmt = $conn->prepare("SELECT contact_id, user_id, full_name, email, phone, notes, created_at FROM contacts WHERE contact_id = ?");
        $stmt->bind_param("i", $contactId);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $contact = $result->fetch_assoc();

            if ($contact === null) {
                $conn->close();
                return Responder::json($res, ["ok" => false, "error" => "Contact not found"], 404);
            }

            $conn->close();
            return Responder::json($res, ["ok" => true, "contact" => $contact]);
        } else {
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Failed to get contact"], 500);
        }
    }

    public function createContact(Request $req, Response $res): Response {
        $inData = Responder::getBody($req);

        // Basic validation
        if (!is_string($inData['full_name']) || !is_numeric($inData['user_id'])) {
            return Responder::json($res, ["ok" => false, "error" => "The name must be a string and user_id must be a number"], 400);
        }


        $conn = db();

        $stmt = $conn->prepare("INSERT INTO contacts (full_name, phone, email, notes, user_id) VALUES (?, ?, ?, ?, ?)");

        $fullName = $inData["full_name"];
        $userId = (int) $inData["user_id"];
        $phone = $inData["phone"] ?? "";
        $email = $inData["email"] ?? "";
        $notes = $inData["notes"] ?? "";

        if (!is_string($phone) || !is_string($email)) {
            return Responder::json($res, ["ok" => false, "error" => "The phone and email must be strings"], 400);
        }

        if (!str_contains($email, "@")) {
            return Responder::json($res, ["ok" => false, "error" => "The email must be a valid email"], 400);
        }

        $stmt->bind_param("ssssi", $fullName, $phone, $email, $notes, $userId);

        if ($stmt->execute()) {
            $conn->close();
            return Responder::json($res, ["ok" => true, "message" => "Contact added successfully"]);
        } else {
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Failed to add contact"]);
        }
    }

    public function updateContact(Request $req, Response $res, array $args): Response {
        $contactId = (int) $args['contact_id'];
        $inData = Responder::getBody($req);

        $fields = [];
        $types = "";
        $values = [];

        if (isset($inData['full_name'])) {
            $fields[] = "full_name=?";
            $types .= "s";
            $values[] = $inData['full_name'];
        }
        if (isset($inData['phone'])) {
            $fields[] = "phone=?";
            $types .= "s";
            $values[] = $inData['phone'];
        }
        if (isset($inData['email'])) {
            $fields[] = "email=?";
            $types .= "s";
            $values[] = $inData['email'];
        }
        if (isset($inData['notes'])) {
            $fields[] = "notes=?";
            $types .= "s";
            $values[] = $inData['notes'];
        }

        if (empty($fields)) {
            return Responder::json($res, ["ok" => false, "error" => "No fields provided to update"]);
        }

        $conn = db();

        $sql = "UPDATE contacts SET " . implode(", ", $fields) . " WHERE contact_id=?";
        $types .= "i";
        $values[] = $contactId;

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$values);

        if ($stmt->execute()) {
            $conn->close();
            return Responder::json($res, ["ok" => true, "message" => "Contact updated successfully"]);
        } else {
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Failed to update contact"]);
        }
    }

    public function replaceContact(Request $req, Response $res, array $args): Response {
        $inData = Responder::getbody($req);

        $contactID = $args['contact_id'] ?? "";

        //Check the input
        if (!is_numeric($contactID)) {
            return Responder::json($res, ["ok" => false, "error" => "contact_id must be numeric"]);
        }

        if (!isset($inData['user_id'], $inData['full_name'], $inData['email'], $inData['phone'], $inData['notes'])) {
            return Responder::json($res, ["ok" => false, "error" => "Missing required fields"]);
        }

        $conn = db();

        $stmt = $conn->prepare("UPDATE contacts SET user_id = ?, full_name = ?, email = ?, phone = ?, notes = ? WHERE contact_id = ?");

        $stmt->bind_param("issssi", $inData['user_id'], $inData['full_name'], $inData['email'], $inData['phone'], $inData['notes'], $contactID);

        //Replace contact if found
        if ($stmt->execute()) {
            if ($stmt->affected_rows === 0) {
                $conn->close();
                return Responder::json($res, ["ok" => false, "error" => "Contact not found or nothing to replace"]);
            }
            $conn->close();

            return Responder::json($res, ["ok" => true, "message" => "Contact replaced succesfully"]);
        } else {
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Failed to replace contact"]);
        }
    }

    public function deleteContact(Request $req, Response $res, array $args): Response {
        $contactId = (int) $args['contact_id'];

        $conn = db();
        $stmt = $conn->prepare("DELETE FROM contacts WHERE contact_id=?");
        $stmt->bind_param("i", $contactId);

        if ($stmt->execute()) {
            $conn->close();
            return Responder::json($res, ["ok" => true, "message" => "Contact deleted successfully"]);
        } else {
            $conn->close();
            return Responder::json($res, ["ok" => false, "error" => "Failed to delete contact"]);
        }
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
