<?php

function get_request_info() {
    return json_decode(file_get_contents('php://input'), true);
}

$conn = new mysqli("localhost", "root", "root", "cop4331c_small_project");

// @import("Users.php");
// @import("Contacts.php");

// $login($conn);
// $register($conn);
// $add_contact($conn);
// $remove_contact($conn);
// $update_contact($conn);
