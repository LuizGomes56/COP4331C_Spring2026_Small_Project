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

let invalid_div = null;
let field_missing_text = null;
let invalid_input_text = null;

let register_api_point = "http://localhost:8080/register";
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
        ["reg_submit", register],
        ["reg_reset", reset_register]
    ].forEach(([id, fn]) => {
        document.getElementById(id).addEventListener("click", fn)
    });
  invalid_div = document.getElementById("register-invalid-box");
  field_missing_text = document.getElementById("field-missing");
  invalid_input_text = document.getElementById("invalid-input");

});

const reset_register = () => {
    ["reg_first_name", "reg_last_name", "reg_email", "reg_password"]
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
    //regex for the emails to validate
    const regex = /^[a-zA-Z0-9._+%-]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/gm;
    const passwd_regex = ""; //Might implement this for pwd val although unsure if this is already overkill
    let pattern_result = regex.exec(email);
    console.log(pattern_result);

    //Generally for giving the user feedback if the inputed info is invalid
    if(pattern_result != null && first_name.length > 4 && last_name.length > 4 && password.length > 4) {
      invalid_div.hidden = true;
      invalid_input_text.hidden = true;
      field_missing_text.hidden = true;
      try {
          const request = await fetch(register_api_point, {
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

          console.log("ID: ${json.id}");

          
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
    else if(pattern_result === null) {
      console.log("invalid pattern");
      invalid_div.hidden = false;
      invalid_input_text.hidden = false;
      field_missing_text.hidden = true;
    }
    else {
      console.log("invalid input");
      invalid_div.hidden = false;
      field_missing_text.hidden = false;
      invalid_input_text.hidden = true;
    }
}
