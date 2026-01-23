<?php


$login = function ($conn) {
    function request_error($err) {
        $retValue = '{
            "id": 0,
            "firstName": "",
            "lastName": "",
            "error": "' . $err . '"
        }';
        send_json($retValue);
    }

    function send_json($obj) {
        header('Content-type: application/json');
        echo $obj;
    }

    if ($conn->connect_error) {
        request_error($conn->connect_error, 500);
    }

    $data = get_request_info();
    $username = $data["username"] ?? "";
    $password = $data["password"] ?? "";

    if ($username === "" || $password === "") {
        request_error("Missing username or password", 400);
    }

    $id = 0xFF;
    $firstName = "todo!";
    $lastName = "todo!";
    $error = null;

    send_json([
        "id" => $id,
        "firstName" => $firstName,
        "lastName" => $lastName,
        "error" => $error
    ]);
};

$register = function ($conn) {
    // todo!    
};