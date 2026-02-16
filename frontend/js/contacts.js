// Todo
// Add header to show user name, and add logout function to the header
// This would be to delete the user id from the local storage.
// We assume that we do not need to delete the account 
// http://127.0.0.1:5500/frontend/contacts.html



// let table_body = [
//     ["CHANGE", "test@gmail.com", "1564352", `<div>${VIEW_BUTTON}</div>`],
// ]

// 
const ENDPOINT = "http://localhost:8000/api/contacts";
const SEARCH_SUFFIX = "/search/";

update_contact_id = 0;

function update_button(contact_id) {
    return `<button class="bg-emerald-800 text-center text-white px-1.5 py-0.5 rounded-md" onClick="open_update_win(${contact_id})">Update ${contact_id}</button>`;
}

/** 
 * @param {{
 *  contact_id: number,
 *  created_at: string,
 *  email: string,
 *  full_name: string,
 *  notes: string,
 *  phone: string
 * }[]} table_body
 */
function create_table(table_body) {
    let result = `<table><thead><tr>`;
    for (header of ["Name", "Email", "Phone", "Notes", "Actions"]) {
        result += `<th class="first:rounded-tl-xl last:rounded-tr-xl">${header}</th>`;
    }
    let contact_ids = [];
    if (Array.isArray(table_body)) {
        result += `</tr></thead><tbody>`;
        for (object of table_body) {
            result += `<tr>`;
            for (const key of [
                "full_name",
                "email",
                "phone",
                "notes",
                //"created_at"
            ]) {
                result += `<td>
                    <input
                        id="${object[key]}_${object["contact_id"]}"
                        class="bg-transparent text-center w-fit"
                        type="text"
                        value="${object[key]}"
                    ></input>
                </td>`;
            }
            result += `<td>${update_button(object["contact_id"])}</td></tr>`;
          contact_ids.push(object["contact_id"]);
        }
    }
    result += `</tbody></table>`;
    $('#contact_table').append(result);
}

function bind_event_functions(contact_id) {
  for (const contact_field of [
    "full_name",
    "email",
    "phone",
    "notes",
  ]){
    $(`${contact_field}_${contact_id}`).on("keypress", async (event)=> {
      if(event.key === "Enter") {
        let field_value = $(`${contact_field}_${contact_id}`).val();
        result = await update_contact_attribute(contact_field, contact_id, field_value);
        //Result may be used to display to the users errors or something along those lines
        /*So basically what it would look like would be like this
         * if(result.error === true) {
         * $("name_of_error_text_area").text(result.text);
         *
         * }
         */
      }
    });
  }
}
const CREATE_CONTACT_IDS = [
    "crc_full_name",
    "crc_email",
    "crc_phone",
    "crc_notes"
];

async function create_contact_api() {
    let [full_name, email, phone, notes] = CREATE_CONTACT_IDS.map(id => document.getElementById(id).value);
    let user_id = Number(localStorage.getItem("user_id"));
    let body = {
        user_id,
        full_name,
        email,
        phone,
        notes
    };
    console.log(body);
    const request = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const response = await request.json();
    console.log(response);
    return response
}

const UPDATE_CONTACT_IDS = [
    "updated_full_name",
    "updated_email",
    "updated_phone",
    "updated_notes",
];


// TODO: Check for empty field and replace them with original content,
// TODO: Setup the PUT method
async function update_contact_api() {
    let [full_name, email, phone, notes] = UPDATE_CONTACT_IDS.map(id => document.getElementById(id).value);
    let user_id = Number(localStorage.getItem("user_id"));
    let body = {
        user_id,
        full_name,
        email,
        phone,
        notes
    };
    console.log(body);
    const request = await fetch(ENDPOINT, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const response = await request.json();
    console.log(response);
    return response
}
/**
 * @param {string} contact_attribute
 * @param {number} contact_id
 * @returns {Object} result
 */
async function update_contact_attribute(contact_attribute, contact_id, new_value) {
  user_id = Number(localStorage.getItem("user_id"));
  const request = await fetch(ENDPOINT + "${contact_id}", {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_attribute: new_value, //Might need to be `${contact_attribute}`
        }),
      });
  const response = await request.json();

  return response.body;
}


function create_contact() {
    console.log("Called create contact");
    $("#create_contact_form").toggleClass("hidden", "flex");
    $("#crc_cancel").on("click", async () => {
        CREATE_CONTACT_IDS.forEach(id => {
            document.getElementById(id).value = "";
        })
    })
    $("#crc_submit").on("click", async () => {
        console.log("Did some HTTP request")
        await create_contact_api();
    })
}

/**
 * 
 * @returns {{
 *  contact_id: number,
 *  created_at: string,
 *  email: string,
 *  full_name: string,
 *  notes: string,
 *  phone: string
 * }[]}
 */
async function get_contacts() {
    const user_id = localStorage.getItem("user_id");
    const request = await fetch(ENDPOINT + `?user_id=${user_id}`, {
        method: 'GET',
    });

    const response = await request.json();

    console.log(response);
    return response.contacts
}

/**
 * @param {number} contact_id
 */
function open_update_win(contact_id) {
    $("#update_dialog").toggle();
    update_contact_id = contact_id;
}
async function init_table() {
    // $("#update_dialog_button").toggle("hidden", false);
    $("#create_contact").on("click", create_contact);
    let user_id = localStorage.getItem("user_id");
    if (!user_id) {
        window.location.href = "login.html";
    }
    console.log($('#contacts-box').val());
    const table_body = await get_contacts();
    create_table(table_body);

}

$(document).ready(init_table());
