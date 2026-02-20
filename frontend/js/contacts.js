// Todo
// Add header to show user name, and add logout function to the header
// This would be to delete the user id from the local storage.
// We assume that we do not need to delete the account 
// http://127.0.0.1:5500/frontend/contacts.html

// let table_body = [
//     ["CHANGE", "test@gmail.com", "1564352", `<div>${VIEW_BUTTON}</div>`],
// ]

let REQUEST_CONTROL = false;

async function search_contacts(query) {
    console.log("Search function was called with query: " + query);

    if (!query || !query.trim()) {
        await init_table();
        return;
    }

    let user_id = localStorage.getItem("user_id");

    if (!user_id) {
        notify("error", "Can't search contacts without user_id being defined");
    }

    try {
        const url =
            `${BASE_ENDPOINT}/contacts/search/${encodeURIComponent(query)}` +
            `?user_id=${user_id}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Failed to search for new contacts");
        }

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.error || "Search query returned an error");
        }

        create_table(data.contacts, "No contacts match your search query");
    } catch (err) {
        console.error(err);
        notify("error", err.message);
    }
}

// 
const ENDPOINT = `${BASE_ENDPOINT}/contacts`;
const SEARCH_SUFFIX = "/search/";

function update_button(contact_id) {
    return `
        <button
            class="bg-rose-600 hover:bg-rose-500 active:bg-rose-700
                   text-white px-4 py-1.5 rounded-lg font-medium
                   transition shadow hover:shadow-md
                   focus:outline-none focus:ring-2 focus:ring-rose-400
                   cursor-pointer"
            title="Delete this contact"
            onClick="delete_contact(${contact_id})"
        >
            Delete
        </button>
    `;
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
function create_table(table_body, message = "You have no registered contacts!") {
    if (table_body.length == 0) {
        document.getElementById("contact_table").innerHTML = `
        <h2 class="text-3xl font-bold text-center my-16">${message}</h2>`
        return [];
    }
    let result = `
        <table class="min-w-full text-sm text-left text-slate-300">
        <thead class="bg-slate-800 text-slate-200">
        <tr>`;
    for (header of ["Name", "Email", "Phone", "Notes", "Actions"]) {
        result += `<th class="px-3 py-2 font-semibold text-center">${header}</th>`;
    }
    let contact_ids = [];
    if (Array.isArray(table_body)) {
        result += `</tr></thead><tbody>`;
        for (const object of table_body) {
            result += `<tr>`;
            for (const key of [
                "full_name",
                "email",
                "phone",
                "notes",
                //"created_at"
            ]) {
                result += `<td class="px-3 py-2 border-t border-slate-700 text-center">
                    <input
                        id="${key}_${object.contact_id}"
                        class="bg-transparent text-center w-fit"
                        type="text"
                        value="${object[key]}"
                    ></input>
                </td>`;
            }
            result += `
                <td class="px-3 py-2 border-t border-slate-700 text-center align-middle">
                    ${update_button(object.contact_id)}
                </td>
                </tr>`;
            contact_ids.push(object.contact_id);
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

/**
 * 
 * @returns {boolean}
 */
async function create_contact_api() {
    if (REQUEST_CONTROL) return;
    REQUEST_CONTROL = true;
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

    let ok = false;
    if (!response.ok && response.error) {
        $("#crc_error").text(response.error);
        notify("error", response.error);
    } else {
        ok = true;
        notify("success", response.message);
    }

    REQUEST_CONTROL = false;
    return ok;
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
    if (REQUEST_CONTROL) return;
    REQUEST_CONTROL = true;

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
    REQUEST_CONTROL = false;
    return response
}
/**
 * @param {string} contact_attribute
 * @param {number} contact_id
 * @returns {Object} result
 */
async function update_contact_attribute(contact_attribute, contact_id, new_value) {
    if (REQUEST_CONTROL) return;
    REQUEST_CONTROL = true;

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
    if (!response.ok && response.error) {
        notify("error", response.error);
    } else {
        ok = true;
        notify("success", response.message);
    }
    REQUEST_CONTROL = false;
    return response.body;
}

async function delete_contact(contact_id) {
    if (REQUEST_CONTROL) return;
    REQUEST_CONTROL = true;

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

    REQUEST_CONTROL = false;
    await init_table();
}

function create_contact() {
    const form = $("#create_contact_form");
    const overlay = $("#create_contact_overlay");

    form.removeClass("hidden").addClass("flex");
    overlay.removeClass("hidden");

    const cancel = () => {
        CREATE_CONTACT_IDS.forEach(id => $("#" + id).val(""));
        form.addClass("hidden").removeClass("flex");
        overlay.addClass("hidden");
        overlay.off("click");
        $("#crc_cancel").off("click");
        $("#crc_submit").off("click");
    };
    overlay.off("click").on("click", cancel);
    $("#crc_cancel").off("click").on("click", cancel);
    $("#crc_submit").off("click").on("click", async () => {
        const ok = await create_contact_api();
        if (ok) {
            cancel()
        };
        await init_table();
    });
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
    if (REQUEST_CONTROL) return;
    REQUEST_CONTROL = true;

    const user_id = localStorage.getItem("user_id");
    const request = await fetch(ENDPOINT + `?user_id=${user_id}`, {
        method: 'GET',
    });

    const response = await request.json();

    console.log(response);
    REQUEST_CONTROL = false;
    return response.contacts
}

async function init_table() {
    let user_id = localStorage.getItem("user_id");
    if (!user_id) {
        window.location.href = "login.html";
    }
    $("#create_contact").on("click", create_contact);
    const table_body = await get_contacts();
    const contact_ids = create_table(table_body);
    contact_ids.forEach((element) => {
        bind_event_functions(element);
    });

}

$(document).ready(init_table());

function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "/login.html";
}
