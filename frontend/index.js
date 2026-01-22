/**
 * @type {number}
 */
let user_id = 0;
/**
 * @type {string}
 */
let first_name = "";
/**
 * @type {string}
 */
let last_name = "";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("reg_submit").addEventListener("click", login);
    document.getElementById("reg_reset").addEventListener("click", reset_register);
});

const reset_register = () => {
    document.getElementById("reg_first_name").value = "";
    document.getElementById("reg_last_name").value = "";
    document.getElementById("reg_password").value = "";

    first_name = "";
    last_name = "";
}

const login = async () => {
    let [first_name, last_name, password] = [
        "reg_first_name",
        "reg_last_name",
        "reg_password"
    ].map(x => document.getElementById(x).value);

    let body = {
        first_name,
        last_name,
        password
    };

    try {
        const request = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        /**
         * @type {{
         *     id: number,
         *     first_name: string,
         *     last_name: string,
         *     error: string
         * }}
         */
        const json = await request.json();

        if (json.error) {
            throw new Error(json.error);
        }

        // todo
    } catch (e) {
        if (e instanceof Error) {
            console.error(`Request error: ${e.message}`);
        } else {
            console.error(`Unknown class error: ${e}`);
        }
    } finally {
        console.log("Request submitted")
    }
}