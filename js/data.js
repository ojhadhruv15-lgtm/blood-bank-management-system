/* =========================================================
   data.js
   Blood Bank Management System - BCA Frontend Project
   ---------------------------------------------------------
   This file handles:
   1. Sample (demo) records shown on first launch
   2. Saving and loading data using browser LocalStorage
   3. Small helper functions used by every page

   NOTE: This is a frontend simulation for academic purposes.
   It is NOT a real hospital or medical system.
   ========================================================= */

// All eight blood groups
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// If units of a blood group fall to this number or below, it is "Low Stock"
const LOW_STOCK_LIMIT = 5;

// Keys used to store data in LocalStorage
const STORAGE_KEYS = {
    donors: "bb_donors",
    inventory: "bb_inventory",
    requests: "bb_requests",
    donations: "bb_donations",
    login: "bb_logged_in"
};

/* ---------- Date helpers ---------- */

// Returns a date string (YYYY-MM-DD) for "n" days before today
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toDateString(d);
}

// Converts a Date object into YYYY-MM-DD format (local time)
function toDateString(d) {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
}

// Today's date in YYYY-MM-DD format
function today() {
    return toDateString(new Date());
}

/* ---------- Sample demo data ---------- */

function getSampleDonors() {
    return [
        { id: "D001", name: "Rahul Sharma",   age: 28, gender: "Male",   bloodGroup: "O+",  phone: "9876543210", address: "12, MG Road",          city: "Delhi",     registeredOn: daysAgo(40) },
        { id: "D002", name: "Priya Verma",    age: 24, gender: "Female", bloodGroup: "A+",  phone: "9812345678", address: "45, Civil Lines",      city: "Jaipur",    registeredOn: daysAgo(35) },
        { id: "D003", name: "Amit Patel",     age: 35, gender: "Male",   bloodGroup: "B+",  phone: "9823456789", address: "7, Navrangpura",       city: "Ahmedabad", registeredOn: daysAgo(30) },
        { id: "D004", name: "Sneha Iyer",     age: 30, gender: "Female", bloodGroup: "AB+", phone: "9834567890", address: "22, T Nagar",          city: "Chennai",   registeredOn: daysAgo(26) },
        { id: "D005", name: "Vikram Singh",   age: 42, gender: "Male",   bloodGroup: "O-",  phone: "9845678901", address: "9, Hazratganj",        city: "Lucknow",   registeredOn: daysAgo(21) },
        { id: "D006", name: "Anjali Gupta",   age: 26, gender: "Female", bloodGroup: "B-",  phone: "9856789012", address: "31, Salt Lake",        city: "Kolkata",   registeredOn: daysAgo(17) },
        { id: "D007", name: "Karan Mehta",    age: 33, gender: "Male",   bloodGroup: "A-",  phone: "9867890123", address: "18, Andheri West",     city: "Mumbai",    registeredOn: daysAgo(12) },
        { id: "D008", name: "Neha Joshi",     age: 22, gender: "Female", bloodGroup: "O+",  phone: "9878901234", address: "5, Kothrud",           city: "Pune",      registeredOn: daysAgo(8) },
        { id: "D009", name: "Rohit Kumar",    age: 38, gender: "Male",   bloodGroup: "AB-", phone: "9889012345", address: "64, Boring Road",      city: "Patna",     registeredOn: daysAgo(4) },
        { id: "D010", name: "Pooja Nair",     age: 29, gender: "Female", bloodGroup: "A+",  phone: "9890123456", address: "11, MG Road",          city: "Kochi",     registeredOn: daysAgo(1) }
    ];
}

// Available units for every blood group
function getSampleInventory() {
    return {
        "A+": 18, "A-": 4, "B+": 22, "B-": 3,
        "AB+": 9, "AB-": 2, "O+": 25, "O-": 6
    };
}

function getSampleRequests() {
    return [
        { id: "R001", patientName: "Suresh Rao",    hospital: "City Care Hospital",     bloodGroup: "O+",  units: 2, contact: "9900112233", date: daysAgo(10), priority: "High",   status: "Fulfilled" },
        { id: "R002", patientName: "Meena Das",     hospital: "Apollo Clinic",          bloodGroup: "A+",  units: 3, contact: "9900223344", date: daysAgo(7),  priority: "Normal", status: "Approved" },
        { id: "R003", patientName: "Arjun Reddy",   hospital: "Sunrise Hospital",       bloodGroup: "B-",  units: 2, contact: "9900334455", date: daysAgo(5),  priority: "Urgent", status: "Pending" },
        { id: "R004", patientName: "Kavita Mishra", hospital: "Lifeline Medical Centre",bloodGroup: "AB-", units: 1, contact: "9900445566", date: daysAgo(3),  priority: "High",   status: "Pending" },
        { id: "R005", patientName: "Imran Khan",    hospital: "Green Valley Hospital",  bloodGroup: "O-",  units: 4, contact: "9900556677", date: daysAgo(2),  priority: "Normal", status: "Rejected" },
        { id: "R006", patientName: "Deepa Menon",   hospital: "City Care Hospital",     bloodGroup: "B+",  units: 2, contact: "9900667788", date: daysAgo(0),  priority: "Normal", status: "Pending" }
    ];
}

function getSampleDonations() {
    return [
        { id: "DN001", donorId: "D001", donorName: "Rahul Sharma", bloodGroup: "O+",  units: 1, date: daysAgo(38) },
        { id: "DN002", donorId: "D002", donorName: "Priya Verma",  bloodGroup: "A+",  units: 1, date: daysAgo(33) },
        { id: "DN003", donorId: "D003", donorName: "Amit Patel",   bloodGroup: "B+",  units: 1, date: daysAgo(28) },
        { id: "DN004", donorId: "D004", donorName: "Sneha Iyer",   bloodGroup: "AB+", units: 1, date: daysAgo(24) },
        { id: "DN005", donorId: "D005", donorName: "Vikram Singh", bloodGroup: "O-",  units: 1, date: daysAgo(19) },
        { id: "DN006", donorId: "D007", donorName: "Karan Mehta",  bloodGroup: "A-",  units: 1, date: daysAgo(11) },
        { id: "DN007", donorId: "D008", donorName: "Neha Joshi",   bloodGroup: "O+",  units: 1, date: daysAgo(6) },
        { id: "DN008", donorId: "D009", donorName: "Rohit Kumar",  bloodGroup: "AB-", units: 1, date: daysAgo(2) }
    ];
}

/* ---------- LocalStorage helpers ---------- */

// Read a value from LocalStorage (converts JSON text back to an object)
function loadData(key) {
    const text = localStorage.getItem(key);
    return text ? JSON.parse(text) : null;
}

// Save a value into LocalStorage (converts object to JSON text)
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// On first launch, fill LocalStorage with the sample records
function initData() {
    if (loadData(STORAGE_KEYS.donors) === null)    saveData(STORAGE_KEYS.donors, getSampleDonors());
    if (loadData(STORAGE_KEYS.inventory) === null) saveData(STORAGE_KEYS.inventory, getSampleInventory());
    if (loadData(STORAGE_KEYS.requests) === null)  saveData(STORAGE_KEYS.requests, getSampleRequests());
    if (loadData(STORAGE_KEYS.donations) === null) saveData(STORAGE_KEYS.donations, getSampleDonations());
}

// Remove all saved records and load the sample data again
function resetAllData() {
    saveData(STORAGE_KEYS.donors, getSampleDonors());
    saveData(STORAGE_KEYS.inventory, getSampleInventory());
    saveData(STORAGE_KEYS.requests, getSampleRequests());
    saveData(STORAGE_KEYS.donations, getSampleDonations());
}

// Short functions to get / save each type of record
function getDonors()        { return loadData(STORAGE_KEYS.donors) || []; }
function getInventory()     { return loadData(STORAGE_KEYS.inventory) || {}; }
function getRequests()      { return loadData(STORAGE_KEYS.requests) || []; }
function getDonations()     { return loadData(STORAGE_KEYS.donations) || []; }
function saveDonors(list)   { saveData(STORAGE_KEYS.donors, list); }
function saveInventory(obj) { saveData(STORAGE_KEYS.inventory, obj); }
function saveRequests(list) { saveData(STORAGE_KEYS.requests, list); }
function saveDonations(list){ saveData(STORAGE_KEYS.donations, list); }

/* ---------- ID generator ---------- */

// Creates the next ID, e.g. prefix "D" and list [D001, D002] -> "D003"
function generateId(prefix, list, digits) {
    let max = 0;
    list.forEach(function (item) {
        const num = parseInt(item.id.replace(prefix, ""), 10);
        if (!isNaN(num) && num > max) max = num;
    });
    return prefix + String(max + 1).padStart(digits || 3, "0");
}

// Make sure the data exists as soon as this file loads
initData();
