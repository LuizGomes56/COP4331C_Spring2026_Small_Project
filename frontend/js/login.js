document.addEventListener("DOMContentLoaded", () => {
    [
        ["reg_submit", login]
    ].forEach(([id, fn]) => {
        document.getElementById(id).addEventListener("click", fn)
    });
});

const login = async () => {
    let [email, password] = get_value([
        "login_email",
        "login_password"
    ]);

    const body = {
        email,
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
    } catch (e) {
        if (e instanceof Error) {
            console.error(`Request error: ${e.message}`);
        } else {
            console.error(`Unknown class error: ${e}`);
        }
    }
}
