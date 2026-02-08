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

        if (!isset($inData['full_name']) || !isset($inData['user_id'])) {
            return Responder::json($res, ["ok" => false, "error" => "Full Name and User ID are required"]);
        }

        $conn = db();

        $stmt = $conn->prepare("INSERT INTO contacts (full_name, phone, email, notes, user_id) VALUES (?, ?, ?, ?, ?)");

        $fullName = $inData["full_name"];
        $userId = (int) $inData["user_id"];
        $phone = $inData["phone"] ?? "";
        $email = $inData["email"] ?? "";
        $notes = $inData["notes"] ?? "";

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

    public function replaceContact(Request $req, Response $res): Response {
        return Responder::unimplemented($res);
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

    public function searchContacts(Request $req, Response $res): Response {
        return Responder::unimplemented($res);
    }
}
