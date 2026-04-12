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

function is_favorite_contact(contact_id) {
    const contact = ALL_CONTACTS.find((entry) => Number(entry.contact_id) === Number(contact_id));
    return contact ? contact_has_favorite_flag(contact) : false;
}

function contact_has_favorite_flag(contact) {
    return contact.is_favorite === true || Number(contact.is_favorite) === 1;
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
    const contacts = SHOW_FAVORITES_ONLY
        ? ALL_CONTACTS.filter(contact => contact_has_favorite_flag(contact))
        : [...ALL_CONTACTS];

    contacts.sort((left, right) => {
        const left_is_favorite = contact_has_favorite_flag(left);
        const right_is_favorite = contact_has_favorite_flag(right);

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
    const filter_all = document.getElementById("filter_all");
    const filter_favorites = document.getElementById("filter_favorites");
    const favorite_count_text = document.getElementById("favorite_count_text");
    const favorite_total = ALL_CONTACTS.filter(contact => contact_has_favorite_flag(contact)).length;

    const active_classes = "bg-indigo-600 text-white shadow-sm";
    const inactive_classes = "text-slate-400 hover:text-white";

    if (SHOW_FAVORITES_ONLY) {
        filter_all.className = `px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${inactive_classes}`;
        filter_favorites.className = `px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${active_classes}`;
    } else {
        filter_all.className = `px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${active_classes}`;
        filter_favorites.className = `px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${inactive_classes}`;
    }

    filter_all.setAttribute("aria-pressed", String(!SHOW_FAVORITES_ONLY));
    filter_favorites.setAttribute("aria-pressed", String(SHOW_FAVORITES_ONLY));
    favorite_count_text.textContent = `${favorite_total} favorite${favorite_total === 1 ? "" : "s"}`;
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
    const star_icon = is_favorite
        ? `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
           </svg>`
        : `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
           </svg>`;

    const button_classes = is_favorite
        ? "text-amber-400 hover:text-amber-300"
        : "text-slate-500 hover:text-amber-400";

    return `
        <button
            class="${button_classes} p-1.5 rounded-lg transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-amber-400/50
                   cursor-pointer hover:bg-slate-700/50"
            type="button"
            aria-pressed="${is_favorite}"
            aria-label="${is_favorite ? "Remove from favorites" : "Add to favorites"}"
            onClick="toggle_favorite(${contact_id})"
        >
            ${star_icon}
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
    const headers = [
        { label: '<svg class="w-4 h-4 mx-auto text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>', width: 'w-12' },
        { label: 'Name', width: '' },
        { label: 'Email', width: '' },
        { label: 'Phone', width: '' },
        { label: 'Notes', width: '' },
        { label: 'Actions', width: '' }
    ];
    for (const header of headers) {
        result += `<th class="px-3 py-2 font-semibold text-center ${header.width}">${header.label}</th>`;
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
async function update_contact_attribute(contact_attribute, contact_id, new_value, shouldNotify = true) {
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
        if (shouldNotify) {
            notify("error", response.error);
        }
    } else if (shouldNotify) {
        notify("success", response.message);
    }
    REQUEST_CONTROL = false;
    return response;
}

async function toggle_favorite(contact_id) {
    if (REQUEST_CONTROL) return;

    const should_be_favorite = !is_favorite_contact(contact_id);
    const response = await update_contact_attribute("is_favorite", contact_id, should_be_favorite ? 1 : 0, false);

    if (!response || response.ok === false) {
        if (response && response.error) {
            notify("error", response.error);
        }
        return;
    }

    await refresh_contacts();
    notify(
        should_be_favorite ? "success" : "info",
        should_be_favorite ? "Contact added to favorites" : "Contact removed from favorites"
    );
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
    $("#filter_all").off("click").on("click", () => {
        if (SHOW_FAVORITES_ONLY) {
            SHOW_FAVORITES_ONLY = false;
            render_contacts_table();
        }
    });
    $("#filter_favorites").off("click").on("click", () => {
        if (!SHOW_FAVORITES_ONLY) {
            SHOW_FAVORITES_ONLY = true;
            render_contacts_table();
        }
    });
    await refresh_contacts();
}

$(document).ready(init_table);

function logout() {
    localStorage.removeItem("user_id");
    window.location.href = "/login.html";
}
