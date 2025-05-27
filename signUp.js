"use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
var dbInstance = window.indexedDB;
var request = dbInstance.open("contactsDB", 1);
var db;
request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("user")) {
        db.createObjectStore("user", { keyPath: "email" });
    }
};
request.onsuccess = function (event) {
    db = event.target.result;
};
document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("form");
    if (!form)
        return;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var mail = document.querySelector('input[placeholder="Mail ID"]').value;
        var password = document.querySelectorAll('input[type="password"]')[0].value;
        var confirmPassword = document.querySelectorAll('input[type="password"]')[1].value;
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        if (!db) {
            alert("Database not ready. Please try again in a moment.");
            return;
        }
        var transaction = db.transaction("user", "readwrite");
        var store = transaction.objectStore("user");
        var getRequest = store.get(mail);
        getRequest.onsuccess = function () {
            if (getRequest.result) {
                alert("User already exists. Please sign in.");
            }
            else {
                var addRequest = store.add({ email: mail, password: password });
                addRequest.onsuccess = function () {
                    alert("Account created successfully!");
                    window.location.href = "index.html";
                };
                addRequest.onerror = function () {
                    alert("Error creating account.");
                };
            }
        };
    });
});
