/*
$app->get("/health", [HealthController::class, "health"]);
$app->post("/echo",  [HealthController::class, "echo"]);
$app->post("/users/register", [UsersController::class, "register"]);
$app->post("/users/login", [UsersController::class, "login"]);
// Returns all contacts
$app->get("/contacts", [ContactsController::class, "getContacts"]);
// Creates a new contact
$app->post("/contacts", [ContactsController::class, "createContact"]);
// Updates only one field from some contact
$app->patch("/contacts/{contact_id}", [ContactsController::class, "updateContact"]);
// Replace the whole contact
$app->put("/contacts/{contact_id}", [ContactsController::class, "replaceContact"]);
// Deletes a contact
$app->delete("/contacts/{contact_id}", [ContactsController::class, "deleteContact"]);
// lists contacts with partial search match.
$app->get("/contacts/search/{query}", [ContactsController::class, "searchContacts"]);
};
*/

const ENDPOINT = "http://project.cop4331.cc/api";

// import const describe = jest.describe;
// console.log(jest);
// const test = jest.test;
// const expect = jest.expect;
// const { describe, expect, test } = require('@jest/globals');
require("jest-expect-message");
// jest my-test --notify --config=config.json
// !npx jest .\tests.cjs --notify
// import { describe, expect, test } from '@jest/globals';

const LOGIN_BODY = {
    email: "test@gmail.com",
    password: "test",
    full_name: "TestAccount"
};


async function login_test(login_body = LOGIN_BODY) {
    const request = await fetch(ENDPOINT + "/users/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(login_body)
    });
    const response = await request.json();
    return {
        status: request.status,
        body: response
    }

}


async function register_test(register_body = LOGIN_BODY) {
    const request = await fetch(ENDPOINT + "/users/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(register_body)
    });

    const response = await request.json();
    return {
        status: request.status,
        body: response
    };

}
describe('Exisitng User API Endpoint testing', () => {
    test('Registering as existing User', async () => {
        const data = await register_test();
        // expect(data.status).toBe(200);
        expect(data.status).toBe(409);
        expect(typeof data.body.error).toBe(typeof "");
        // expect(data.body).toEqual({ ok: true, out: "Registration successful" })
    });
    test('Loging in as Existing User', async () => {
        const data = await login_test();
        expect(data.status).toBe(200);
    });
    test('Login as Existing user and check response', async () => {
        const data = await login_test();
        expect(data.body.ok, `Login Error: ${data.body.error}, json body: ${JSON.stringify(LOGIN_BODY, 4)}`).toBe(true);
        expect(data.body.user_id).toBe(3);
    });
});


describe("Creating new User and loging in", () => {
    test('Creating New User', async () => {

    });
    test("login in", async () => {

    });
});

