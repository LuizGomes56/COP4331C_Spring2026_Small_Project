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

function update_button(contact_id) {
    return `<button 
        class="bg-rose-800 text-center text-white px-4 py-1.5 rounded-md" 
        onClick="delete_contact(${contact_id})"
    >
        Delete
    </button>`;
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
                        id="${key}_${object["contact_id"]}"
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
    document.getElementById("contact_table").innerHTML = result;
    return contact_ids;

}

function findEvents(element) {

    var events = element.data('events');
    if (events !== undefined)
        return events;

    events = $.data(element, 'events');
    if (events !== undefined)
        return events;

    events = $._data(element, 'events');
    if (events !== undefined)
        return events;

    events = $._data(element[0], 'events');
    if (events !== undefined)
        return events;

    return undefined;
}

function bind_event_functions(contact_id) {
    for (const contact_field of [
        "full_name",
        "email",
        "phone",
        "notes",
    ]) {
        element = `#${contact_field}_${contact_id}`;
        console.log(element)
        $(element).on("keypress", async (event) => {
            console.log("Event Occured");
            if (event.which === 13) {
                let field_value = $(`#${contact_field}_${contact_id}`).val();
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

    if (!response.ok && response.error) {
        $("#crc_error").text(response.error);
        notify("error", response.error);
    }

    return response;
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
    console.log(ENDPOINT + "/" + `${contact_id}`)
    let body = {
        [contact_attribute]: new_value, //Might need to be `${contact_attribute}`
    };

    const request = await fetch(ENDPOINT + "/" + `${contact_id}`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    });
    const response = await request.json();

    return response.body;
}

async function delete_contact(contact_id) {
    const request = await fetch(ENDPOINT + "/" + `${contact_id}`, {
        method: "DELETE",
    });
    const response = await request.json();
    console.log(response);
    if (response.ok) {
        notify("success", response.message);
    } else {
        notify("error", response.error);
    }
    await init_table();
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
        const response = await create_contact_api();
        notify("success", response.message);
        $("#create_contact_form").toggleClass("hidden", "flex");
        await init_table();
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

async function init_table() {
    // $("#update_dialog_button").toggle("hidden", false);
    $("#create_contact").on("click", create_contact);
    let user_id = localStorage.getItem("user_id");
    if (!user_id) {
        window.location.href = "login.html";
    }
    console.log($('#contacts-box').val());
    const table_body = await get_contacts();
    const contact_ids = create_table(table_body);
    console.log($("#full_name_2")[0]);
    contact_ids.forEach((element) => {
        bind_event_functions(element);
    });

}

$(document).ready(init_table());
