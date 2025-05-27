(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var searchInput = document.querySelector("input[type='text']");
        searchInput.addEventListener('input', function () {
            var filter = searchInput.value.toLowerCase();
            var rows = document.querySelectorAll("table tbody tr");
            rows.forEach(function (row) {
                var _a;
                var emailCell = row.cells[4];
                if (emailCell) {
                    var email = ((_a = emailCell.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                    row.style.display = email.indexOf(filter) !== -1 ? '' : 'none';
                }
            });
        });
    });
    var dbInstance = window.indexedDB;
    var request = dbInstance.open('contactsDB', 2);
    var db;
    request.onerror = function (event) {
        console.error("Database error!");
    };
    request.onupgradeneeded = function () {
        db = request.result;
        if (!db.objectStoreNames.contains('contacts')) {
            var objectStore = db.createObjectStore('contacts', { keyPath: 'email' });
        }
    };
    request.onsuccess = function () {
        db = request.result;
        displayContacts();
    };
    function displayContacts() {
        console.log('db: ', db);
        if (!db) {
            console.error("Database not initialized");
            return;
        }
        if (!db.objectStoreNames.contains("contacts")) {
            console.log("Contacts object store does not exist");
            return;
        }
        var transaction = db.transaction("contacts", "readonly");
        var store = transaction.objectStore("contacts");
        var request = store.getAll();
        request.onsuccess = function () {
            var contacts = request.result;
            var tbody = document.querySelector('tbody');
            if (!tbody) {
                console.error("Table body (tbody) not found in the document.");
                return;
            }
            tbody.innerHTML = '';
            contacts.forEach(function (contact) {
                var row = document.createElement('tr');
                row.innerHTML = "\n                    <td data-cell=\"name\">".concat(contact.name, "</td>\n                    <td data-cell=\"designation\">").concat(contact.designation, "</td>\n                    <td data-cell=\"company\">").concat(contact.company, "</td>\n                    <td data-cell=\"industry\">").concat(contact.industry, "</td>\n                    <td data-cell=\"email\">").concat(contact.email, "</td>\n                    <td data-cell=\"phone number\">").concat(contact.phoneNumber, "</td>\n                    <td data-cell=\"country\">").concat(contact.country, "</td>\n                    <td data-cell=\"action\">\n                        <i class=\"fa-solid fa-pen\" style=\"color:rgba(8, 132, 255, 1);\" onclick=\"editContact('").concat(contact.email, "')\"></i>\n                        <i class=\"fa-solid fa-trash\" style=\"color:rgba(248, 29, 29, 1);\" onclick=\"deleteContact('").concat(contact.email, "')\"></i>\n                    </td>");
                tbody.appendChild(row);
            });
        };
    }
    function addOrUpdateContact(contact) {
        var transaction = db.transaction("contacts", "readwrite");
        var store = transaction.objectStore("contacts");
        if (contact.email) {
            store.put(contact);
        }
        else {
            store.add(contact);
        }
        transaction.oncomplete = function () {
            console.log("Contact added/updated successfully");
            displayContacts();
        };
    }
    ;
    function deleteContact(email) {
        var transaction = db.transaction("contacts", "readwrite");
        var store = transaction.objectStore("contacts");
        store.delete(String(email));
        transaction.oncomplete = function () {
            console.log("Contact deleted successfully");
            displayContacts();
        };
    }
    ;
    function addUpdateForm() {
        var _a;
        var modal = document.createElement('div');
        modal.id = 'contact-form-modal';
        modal.innerHTML = "\n            <form id=\"contact-form\">\n                <input type=\"hidden\" id=\"contact-id\">\n                <input type=\"text\" id=\"name\" placeholder=\"Name\" required>\n                <input type=\"text\" id=\"designation\" placeholder=\"Designation\" required>\n                <input type=\"text\" id=\"company\" placeholder=\"Company\" required>\n                <input type=\"text\" id=\"industry\" placeholder=\"Industry\" required>\n                <input type=\"email\" id=\"email\" placeholder=\"Email\" required>\n                <input type=\"text\" id=\"phone\" placeholder=\"Phone Number\" required>\n                <input type=\"text\" id=\"country\" placeholder=\"Country\" required>\n                <input type=\"submit\" value=\"submit\">\n                <button type=\"button\" id=\"cancel-btn\">Cancel</button>\n            </form>\n        ";
        document.body.appendChild(modal);
        var cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = function () {
                modal.remove();
            };
        }
        (_a = document.getElementById('contact-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (e) {
            var _a, _b, _c, _d, _e, _f, _g;
            e.preventDefault();
            var contact = {
                name: ((_a = document.getElementById('name')) === null || _a === void 0 ? void 0 : _a.value) || '',
                designation: ((_b = document.getElementById('designation')) === null || _b === void 0 ? void 0 : _b.value) || '',
                company: ((_c = document.getElementById('company')) === null || _c === void 0 ? void 0 : _c.value) || '',
                industry: ((_d = document.getElementById('industry')) === null || _d === void 0 ? void 0 : _d.value) || '',
                email: ((_e = document.getElementById('email')) === null || _e === void 0 ? void 0 : _e.value) || '',
                phoneNumber: ((_f = document.getElementById('phone')) === null || _f === void 0 ? void 0 : _f.value) || '',
                country: ((_g = document.getElementById('country')) === null || _g === void 0 ? void 0 : _g.value) || ''
            };
            console.log(contact);
            addOrUpdateContact(contact);
            console.log("Contact added/updated successfully");
            modal.remove();
        });
    }
    function editContact(email) {
        var transaction = db.transaction("contacts", "readonly");
        var store = transaction.objectStore("contacts");
        var request = store.get(String(email));
        request.onsuccess = function () {
            var contact = request.result;
            if (contact) {
                addUpdateForm();
                var nameInput = document.getElementById('name');
                var designationInput = document.getElementById('designation');
                var companyInput = document.getElementById('company');
                var industryInput = document.getElementById('industry');
                var emailInput = document.getElementById('email');
                var phoneInput = document.getElementById('phone');
                var countryInput = document.getElementById('country');
                if (nameInput)
                    nameInput.value = contact.name;
                if (designationInput)
                    designationInput.value = contact.designation;
                if (companyInput)
                    companyInput.value = contact.company;
                if (industryInput)
                    industryInput.value = contact.industry;
                if (emailInput)
                    emailInput.value = contact.email;
                if (phoneInput)
                    phoneInput.value = contact.phoneNumber;
                if (countryInput)
                    countryInput.value = contact.country;
            }
            else {
                console.error("Contact not found");
            }
        };
    }
})();
