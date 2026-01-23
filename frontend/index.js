// Test branch

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

/**
 * @type {{
 *     login: {
 *          input: {
 *              email: string,    
 *              password: string
 *          },
 *          output: Record<string, any>
 *     },
 *     register: {
 *          input: {
 *              email: string,
 *              password: string,
 *              first_name: string,
 *              last_name: string 
 *         },
 *         output: {
 *              id: number,
 *              first_name: string,
 *              last_name: string,
 *              error: string
 *         }
 *     }
 * }}
 */
var _schema = {};

document.addEventListener("DOMContentLoaded", () => {
    [
        ["reg_submit", login],
        ["reg_reset", reset_register]
    ].forEach(([id, fn]) => {
        document.getElementById(id).addEventListener("click", fn)
    });
});

const reset_register = () => {
    ["reg_first_name", "reg_last_name", "reg_password"]
        .forEach(x => document.getElementById(x).value = "");

    first_name = "";
    last_name = "";
}

function get_value(
    /**
     * @type {string[]}
     */
    ids
) {
    return ids.map(x => document.getElementById(x).value);
}

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

const register = async () => {
    const [first_name, last_name, email, password] = get_value([
        "reg_first_name",
        "reg_last_name",
        "reg_email",
        "reg_password"
    ]);

    const body = {
        email,
        first_name,
        last_name,
        password
    };

    console.log(body);

    try {
        const request = await fetch("http://localhost:8080/register", {
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