function get_value(
    /**
     * @type {string[]}
     */
    ids
) {
    return ids.map(x => document.getElementById(x).value);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login_submit").addEventListener("click", login)
});

const login = async () => {
    /**
     * @type {string[]}
     */
    let [email, password] = get_value([
        "login_email",
        "login_password"
    ]);

    if (password.length < 4) {
        document.getElementById("login_message").innerText = "Password must be at least 4 characters long";
        return;
    }

    if (!email.includes("@")) {
        document.getElementById("login_message").innerText = "Emails must contain '@' symbol";
        return;
    }

    if (!email.split("@")[1]) {
        console.log("No domain found after '@' symbol");
    }

    const body = {
        email,
        password
    };

    try {
        const request = await fetch(`${BASE_ENDPOINT}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        /**
         * @type {{
         *     user_id: number,
         * } | { error: string }}
         */
        const response = await request.json();

        if (response.error) {
            document.getElementById("login_message").innerText = response.error;
        } else {
            localStorage.setItem("user_id", response.user_id);
            document.getElementById("login_message").innerText = "Login successful, redirecting to main page...";
            window.location.href = "/contacts.html";
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(`Request error: ${e.message}`);
        } else {
            console.error(`Unknown class error: ${e}`);
        }
    }
}
