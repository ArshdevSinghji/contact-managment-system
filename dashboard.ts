(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.querySelector("input[type='text']") as HTMLInputElement;
        searchInput.addEventListener('input', () => {
            const filter = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll("table tbody tr");
            rows.forEach(row => {
                const emailCell = (row as HTMLTableRowElement).cells[4];
                if (emailCell) {
                    const email = emailCell.textContent?.toLowerCase() || '';
                    (row as HTMLTableRowElement).style.display = email.indexOf(filter) !== -1 ? '' : 'none';
                }
            });
        });
    });

    const dbInstance : IDBFactory = window.indexedDB;
    const request = dbInstance.open('contactsDB', 2);

    let db: IDBDatabase;

    request.onerror = (event) => {
            console.error("Database error!");
    };

    request.onupgradeneeded = () => {
        db  = request.result;
        if (!db.objectStoreNames.contains('contacts')) {
            const objectStore = db.createObjectStore('contacts', { keyPath: 'email' });
        }
    }

    request.onsuccess = () => {
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

        const transaction = db.transaction("contacts", "readonly");
        const store = transaction.objectStore("contacts");
        const request = store.getAll();

        request.onsuccess = () => {
            const contacts = request.result;
            const tbody = document.querySelector('tbody');
            if (!tbody) {
                console.error("Table body (tbody) not found in the document.");
                return;
            }
            tbody.innerHTML = '';
            contacts.forEach(contact => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-cell="name">${contact.name}</td>
                    <td data-cell="designation">${contact.designation}</td>
                    <td data-cell="company">${contact.company}</td>
                    <td data-cell="industry">${contact.industry}</td>
                    <td data-cell="email">${contact.email}</td>
                    <td data-cell="phone number">${contact.phoneNumber}</td>
                    <td data-cell="country">${contact.country}</td>
                    <td data-cell="action">
                        <i class="fa-solid fa-pen" style="color:rgba(8, 132, 255, 1);" onclick="editContact('${contact.email}')"></i>
                        <i class="fa-solid fa-trash" style="color:rgba(248, 29, 29, 1);" onclick="deleteContact('${contact.email}')"></i>
                    </td>`;
                tbody.appendChild(row);
            });
        };
    }
    
    
    interface Contact {
        name: string;
        designation: string;
        company: string;
        industry: string;
        email: string;
        phoneNumber: string;
        country: string;
        [key: string]: any;
    }

    function addOrUpdateContact(contact: Contact): void {
        const transaction: IDBTransaction = db.transaction("contacts", "readwrite");
        const store: IDBObjectStore = transaction.objectStore("contacts");
        if (contact.email) {
            store.put(contact);
        } else {
            store.add(contact);
        }
        transaction.oncomplete = (): void => {
            console.log("Contact added/updated successfully");
            displayContacts();
        };
    };


    function deleteContact(email : string) : void {
        const transaction = db.transaction("contacts", "readwrite");
        const store = transaction.objectStore("contacts");
        store.delete(String(email));
        transaction.oncomplete = () => {
            console.log("Contact deleted successfully");
            displayContacts();
        };
    };

    function addUpdateForm() {
        const modal = document.createElement('div');
        modal.id = 'contact-form-modal';
        modal.innerHTML = `
            <form id="contact-form">
                <input type="hidden" id="contact-id">
                <input type="text" id="name" placeholder="Name" required>
                <input type="text" id="designation" placeholder="Designation" required>
                <input type="text" id="company" placeholder="Company" required>
                <input type="text" id="industry" placeholder="Industry" required>
                <input type="email" id="email" placeholder="Email" required>
                <input type="text" id="phone" placeholder="Phone Number" required>
                <input type="text" id="country" placeholder="Country" required>
                <input type="submit" value="submit">
                <button type="button" id="cancel-btn">Cancel</button>
            </form>
        `;
        document.body.appendChild(modal);

        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                modal.remove();
            };
        }

        document.getElementById('contact-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const contact = {
                name: (document.getElementById('name') as HTMLInputElement)?.value || '',
                designation: (document.getElementById('designation') as HTMLInputElement)?.value || '',
                company: (document.getElementById('company') as HTMLInputElement)?.value || '',
                industry: (document.getElementById('industry') as HTMLInputElement)?.value || '',
                email: (document.getElementById('email') as HTMLInputElement)?.value || '',
                phoneNumber: (document.getElementById('phone') as HTMLInputElement)?.value || '',
                country: (document.getElementById('country') as HTMLInputElement)?.value || ''
            };
            console.log(contact);
            addOrUpdateContact(contact);
            console.log("Contact added/updated successfully");
            modal.remove();
        })
    }

    function editContact(email : string) : void{
        const transaction = db.transaction("contacts", "readonly");
        const store = transaction.objectStore("contacts");
        const request = store.get(String(email));
        request.onsuccess = () => {
            const contact = request.result;
            if (contact) {
                addUpdateForm();
                const nameInput = document.getElementById('name') as HTMLInputElement | null;
                const designationInput = document.getElementById('designation') as HTMLInputElement | null;
                const companyInput = document.getElementById('company') as HTMLInputElement | null;
                const industryInput = document.getElementById('industry') as HTMLInputElement | null;
                const emailInput = document.getElementById('email') as HTMLInputElement | null;
                const phoneInput = document.getElementById('phone') as HTMLInputElement | null;
                const countryInput = document.getElementById('country') as HTMLInputElement | null;

                if (nameInput) nameInput.value = contact.name;
                if (designationInput) designationInput.value = contact.designation;
                if (companyInput) companyInput.value = contact.company;
                if (industryInput) industryInput.value = contact.industry;
                if (emailInput) emailInput.value = contact.email;
                if (phoneInput) phoneInput.value = contact.phoneNumber;
                if (countryInput) countryInput.value = contact.country;
            } else {
                console.error("Contact not found");
            }
        };
    }    

})();