// Todo
// Add header to show user name, and add logout function to the header
// This would be to delete the user id from the local storage.
// We assume that we do not need to delete the account 
//
let table_body = [
    ["Test", "test@gmail.com", "1564352", "<button id=\"#\">View</div>"],
]

function create_table(table_body) {
    console.log('Create table being executed!');
    let result = `<table><thead><tr>`;
    for (header of ["Name", "Email", "Phone", "Actions"]) {
          result += `<th>${header}</th>`;
      }
    if (table_body != null){
      

      result += `</tr></thead><tbody>`;

      for (row of table_body) {
          for (data of row) {
              result += `<td>${data}</td>`;
          }
      }
    }
    result += `</tbody></table>`;
  $('#contacts-box').append(result);
}

function get_contacts() {
}

function init_table() {
  console.log($('#contacts-box').val());
  create_table(table_body);

}

$(document).ready(init_table());
