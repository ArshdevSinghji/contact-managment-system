(function () {
    var dbInstance = window.indexedDB;
    var request = dbInstance.open("contactsDB", 1);
    var db;
    request.onsuccess = function () {
        db = request.result;
    };
    document.addEventListener('DOMContentLoaded', function () {
        var _a;
        (_a = document.querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (e) {
            e.preventDefault();
            var mail = document.querySelector('input[type="email"]').value;
            var password = document.querySelector('input[type="password"]').value;
            if (!db) {
                alert("Database not ready. Please try again in a moment.");
                return;
            }
            var transaction = db.transaction("user", "readonly");
            var store = transaction.objectStore("user");
            var getRequest = store.get(mail);
            getRequest.onsuccess = function () {
                var user = getRequest.result;
                if (user && user.password === password) {
                    alert("Sign in successful!");
                    window.location.href = "index.html";
                }
                else {
                    alert("Invalid email or password.");
                }
            };
            getRequest.onerror = function () {
                alert("Error retrieving user data.");
            };
        });
    });
})();
