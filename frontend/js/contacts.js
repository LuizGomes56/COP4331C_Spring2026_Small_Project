// Todo
// Add header to show user name, and add logout function to the header
// This would be to delete the user id from the local storage.
// We assume that we do not need to delete the account 
// http://127.0.0.1:5500/frontend/contacts.html

// let table_body = [
//     ["CHANGE", "test@gmail.com", "1564352", `<div>${VIEW_BUTTON}</div>`],
// ]

let REQUEST_CONTROL = false;
let ALL_CONTACTS = [];
let CURRENT_QUERY = "";
let SHOW_FAVORITES_ONLY = false;

// 
const ENDPOINT = `${BASE_ENDPOINT}/contacts`;

function get_user_id() {
    return localStorage.getItem("user_id");
}

function get_favorites_storage_key() {
    const user_id = get_user_id();
    return user_id ? `favorite_contacts_${user_id}` : null;
}

function get_favorite_contact_ids() {
    const key = get_favorites_storage_key();
    if (!key) {
        return new Set();
    }

    try {
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        if (!Array.isArray(stored)) {
            return new Set();
        }

        return new Set(stored.map(Number));
    } catch (error) {
        console.error(error);
        return new Set();
    }
}

function save_favorite_contact_ids(favorite_ids) {
    const key = get_favorites_storage_key();
    if (!key) {
        return;
    }

    localStorage.setItem(key, JSON.stringify([...favorite_ids]));
}

function is_favorite_contact(contact_id) {
    return get_favorite_contact_ids().has(Number(contact_id));
}

function set_contact_favorite(contact_id, should_be_favorite) {
    const favorite_ids = get_favorite_contact_ids();

    if (should_be_favorite) {
        favorite_ids.add(Number(contact_id));
    } else {
        favorite_ids.delete(Number(contact_id));
    }

    save_favorite_contact_ids(favorite_ids);
}

function prune_favorite_contact_ids() {
    const favorite_ids = get_favorite_contact_ids();
    const valid_contact_ids = new Set(ALL_CONTACTS.map(contact => Number(contact.contact_id)));
    const next_favorite_ids = new Set(
        [...favorite_ids].filter(contact_id => valid_contact_ids.has(Number(contact_id)))
    );

    if (next_favorite_ids.size !== favorite_ids.size) {
        save_favorite_contact_ids(next_favorite_ids);
    }
}

function escape_html(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function get_visible_contacts() {
    const favorite_ids = get_favorite_contact_ids();
    const contacts = SHOW_FAVORITES_ONLY
        ? ALL_CONTACTS.filter(contact => favorite_ids.has(Number(contact.contact_id)))
        : [...ALL_CONTACTS];

    contacts.sort((left, right) => {
        const left_is_favorite = favorite_ids.has(Number(left.contact_id));
        const right_is_favorite = favorite_ids.has(Number(right.contact_id));

        if (left_is_favorite !== right_is_favorite) {
            return left_is_favorite ? -1 : 1;
        }

        return left.full_name.localeCompare(right.full_name);
    });

    return contacts;
}

function get_empty_message() {
    const has_query = Boolean(CURRENT_QUERY.trim());

    if (SHOW_FAVORITES_ONLY && has_query) {
        return "No favorite contacts match your search query";
    }

    if (SHOW_FAVORITES_ONLY) {
        return "You have no favorite contacts yet";
    }

    if (has_query) {
        return "No contacts match your search query";
    }

    return "You have no registered contacts!";
}

function update_favorite_controls() {
    const favorite_button = document.getElementById("toggle_favorites");
    const favorite_count = document.getElementById("favorite_count");
    const favorite_total = get_favorite_contact_ids().size;

    favorite_button.setAttribute("aria-pressed", String(SHOW_FAVORITES_ONLY));
    favorite_button.textContent = SHOW_FAVORITES_ONLY
        ? "Show All Contacts"
        : "Show Favorites Only";
    favorite_button.className = SHOW_FAVORITES_ONLY
        ? "px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition shadow"
        : "px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold transition shadow";
    favorite_count.textContent = `${favorite_total} favorite${favorite_total === 1 ? "" : "s"}`;
}

function render_contacts_table() {
    const contact_ids = create_table(get_visible_contacts(), get_empty_message());
    contact_ids.forEach((contact_id) => {
        bind_event_functions(contact_id);
    });
    update_favorite_controls();
}

async function fetch_contacts(query = "") {
    const trimmed_query = query.trim();
    const user_id = get_user_id();

    if (!user_id) {
        window.location.href = "login.html";
        return [];
    }

    const url = trimmed_query
        ? `${BASE_ENDPOINT}/contacts/search/${encodeURIComponent(trimmed_query)}?user_id=${user_id}`
        : `${ENDPOINT}?user_id=${user_id}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
        throw new Error(data.error || "Unable to load contacts");
    }

    return Array.isArray(data.contacts) ? data.contacts : [];
}

async function refresh_contacts(query = CURRENT_QUERY) {
    CURRENT_QUERY = query;

    try {
        ALL_CONTACTS = await fetch_contacts(query);
        prune_favorite_contact_ids();
        render_contacts_table();
    } catch (error) {
        console.error(error);
        notify("error", error.message);
    }
}

async function search_contacts(query) {
    await refresh_contacts(query);
}

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

function favorite_button(contact_id) {
    const is_favorite = is_favorite_contact(contact_id);
    const button_label = is_favorite ? "Favorited" : "Favorite";
    const button_classes = is_favorite
        ? "bg-amber-500 text-slate-950 hover:bg-amber-400 focus:ring-amber-300"
        : "bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-400";

    return `
        <button
            class="${button_classes}
                   px-4 py-1.5 rounded-lg font-medium
                   transition shadow hover:shadow-md
                   focus:outline-none focus:ring-2
                   cursor-pointer"
            type="button"
            aria-pressed="${is_favorite}"
            aria-label="${is_favorite ? "Remove from favorites" : "Mark as favorite"}"
            onClick="toggle_favorite(${contact_id})"
        >
            ${button_label}
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
    for (const header of ["Favorite", "Name", "Email", "Phone", "Notes", "Actions"]) {
        result += `<th class="px-3 py-2 font-semibold text-center">${header}</th>`;
    }
    let contact_ids = [];
    if (Array.isArray(table_body)) {
        result += `</tr></thead><tbody>`;
        for (const object of table_body) {
            result += `<tr>`;
            result += `
                <td class="px-3 py-2 border-t border-slate-700 text-center align-middle">
                    ${favorite_button(object.contact_id)}
                </td>
            `;
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
                        value="${escape_html(object[key])}"
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
        const element = `#${contact_field}_${contact_id}`;
        console.log(element)
        $(element).on("keypress", async (event) => {
            console.log("Event Occured");
            if (event.which === 13) {
                const field_value = $(`#${contact_field}_${contact_id}`).val();
                await update_contact_attribute(contact_field, contact_id, field_value);
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
        notify("success", response.message);
    }
    REQUEST_CONTROL = false;
    return response.body;
}

function toggle_favorite(contact_id) {
    const should_be_favorite = !is_favorite_contact(contact_id);

    set_contact_favorite(contact_id, should_be_favorite);
    render_contacts_table();
    notify(
        should_be_favorite ? "success" : "info",
        should_be_favorite ? "Contact added to favorites" : "Contact removed from favorites"
    );
}

function toggle_favorites_filter() {
    SHOW_FAVORITES_ONLY = !SHOW_FAVORITES_ONLY;
    render_contacts_table();
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
        set_contact_favorite(contact_id, false);
        notify("success", response.message);
    } else {
        notify("error", response.error);
    }

    REQUEST_CONTROL = false;
    await refresh_contacts();
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
        await refresh_contacts();
    });
}

async function init_table() {
    const user_id = get_user_id();
    if (!user_id) {
        window.location.href = "login.html";
    }
    $("#create_contact").off("click").on("click", create_contact);
    $("#toggle_favorites").off("click").on("click", toggle_favorites_filter);
    await refresh_contacts();
}

$(document).ready(init_table);

function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "/login.html";
}
