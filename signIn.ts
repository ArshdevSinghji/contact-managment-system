(() => {
    const dbInstance: IDBFactory = window.indexedDB;
    const request: IDBOpenDBRequest = dbInstance.open("contactsDB", 1);
    let db: IDBDatabase | undefined;

    request.onsuccess = () => {
        db = (request.result as IDBDatabase);
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelector('form')?.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            const mail = (document.querySelector('input[type="email"]') as HTMLInputElement).value;
            const password = (document.querySelector('input[type="password"]') as HTMLInputElement).value;

            if (!db) {
                alert("Database not ready. Please try again in a moment.");
                return;
            }

            const transaction = db.transaction("user", "readonly");
            const store = transaction.objectStore("user");
            const getRequest = store.get(mail);

            getRequest.onsuccess = () => {
                const user = getRequest.result;
                if (user && user.password === password) {
                    alert("Sign in successful!");
                    window.location.href = "index.html";
                } else {
                    alert("Invalid email or password.");
                }
            };

            getRequest.onerror = () => {
                alert("Error retrieving user data.");
            };
            
        });
    });
})();