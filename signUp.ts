(() => {
    const dbInstance: IDBFactory = window.indexedDB;
    const request: IDBOpenDBRequest = dbInstance.open("contactsDB", 1);
    let db: IDBDatabase | undefined;

    request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
        db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("user")) {
            db.createObjectStore("user", { keyPath: "email" });
        }
    };

    request.onsuccess = function (event: Event) {
        db = (event.target as IDBOpenDBRequest).result;
    };

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector("form");
        if (!form) return;

        form.addEventListener("submit", function (event: Event) {
            event.preventDefault();
            const mail = (document.querySelector('input[placeholder="Mail ID"]') as HTMLInputElement).value;
            const password = (document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement).value;
            const confirmPassword = (document.querySelectorAll('input[type="password"]')[1] as HTMLInputElement).value;

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            if (!db) {
                alert("Database not ready. Please try again in a moment.");
                return;
            }

            const transaction = db.transaction("user", "readwrite");
            const store = transaction.objectStore("user");
            const getRequest = store.get(mail);

            getRequest.onsuccess = function () {
                if (getRequest.result) {
                    alert("User already exists. Please sign in.");
                } else {
                    const addRequest = store.add({ email: mail, password: password });
                    addRequest.onsuccess = () => {
                        alert("Account created successfully!");
                        window.location.href = "index.html";
                    };
                    addRequest.onerror = () => {
                        alert("Error creating account.");
                    };
                }
            };
        });
    });
})();