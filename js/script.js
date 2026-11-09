/* =========================================================
   script.js
   Blood Bank Management System - BCA Frontend Project
   ---------------------------------------------------------
   Every page includes this one file. The <body> tag of each
   page has a "data-page" attribute (login, dashboard, donors,
   inventory, requests, donations, reports). At the bottom of
   this file we read that attribute and run only the code
   needed for that page.

   Data functions (getDonors, saveDonors, ...) come from data.js
   ========================================================= */

const currentPage = document.body.dataset.page;

/* =========================================================
   1. DEMO AUTHENTICATION
   (JavaScript-only login - NOT real security. Anyone can
   read these credentials in the source code.)
   ========================================================= */

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

function isLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.login) === "true";
}

// Protect the inner pages: go back to login if not logged in
if (currentPage !== "login" && !isLoggedIn()) {
    window.location.href = "index.html";
}

function logout() {
    showConfirm("Logout", "Are you sure you want to logout?", function () {
        localStorage.removeItem(STORAGE_KEYS.login);
        window.location.href = "index.html";
    }, "Logout");
}

/* =========================================================
   2. COMMON HELPER FUNCTIONS
   ========================================================= */

// Prevents HTML injection when showing user-typed text in tables
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Converts "2026-11-09" into "09 Nov 2026"
function formatDate(dateStr) {
    if (!dateStr) return "-";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = dateStr.split("-");
    return parts[2] + " " + months[parseInt(parts[1], 10) - 1] + " " + parts[0];
}

// Returns "out", "low" or "ok" depending on the number of units
function getStockStatus(units) {
    if (units <= 0) return "out";
    if (units <= LOW_STOCK_LIMIT) return "low";
    return "ok";
}

function stockBadge(units) {
    const status = getStockStatus(units);
    if (status === "out") return '<span class="badge badge-out">Out of Stock</span>';
    if (status === "low") return '<span class="badge badge-low">Low Stock</span>';
    return '<span class="badge badge-ok">Available</span>';
}

function statusBadge(status) {
    return '<span class="badge badge-' + status.toLowerCase() + '">' + status + "</span>";
}

function priorityBadge(priority) {
    return '<span class="badge badge-' + priority.toLowerCase() + '">' + priority + "</span>";
}

function groupBadge(group) {
    return '<span class="badge badge-group">' + escapeHtml(group) + "</span>";
}

function totalUnits() {
    const inventory = getInventory();
    let total = 0;
    BLOOD_GROUPS.forEach(function (g) { total += inventory[g] || 0; });
    return total;
}

/* ---------- Toast notifications ---------- */

// type can be "success", "error" or "warning"
function showToast(message, type) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast " + (type || "success");
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("hide");
        setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
}

/* ---------- Modals ---------- */

function openModal(id) {
    document.getElementById(id).classList.add("show");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

// Any element with data-close="modalId" closes that modal
document.addEventListener("click", function (e) {
    const closeTarget = e.target.closest("[data-close]");
    if (closeTarget) {
        closeModal(closeTarget.dataset.close);
        return;
    }
    // Clicking the dark background around a modal closes it
    if (e.target.classList.contains("modal")) {
        e.target.classList.remove("show");
    }
});

// Pressing Escape closes any open modal
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        document.querySelectorAll(".modal.show").forEach(function (m) { m.classList.remove("show"); });
    }
});

/* ---------- Confirmation popup ---------- */

let confirmCallback = null;

function showConfirm(title, message, onYes, yesText) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;
    document.getElementById("confirmYesBtn").textContent = yesText || "Yes, Continue";
    confirmCallback = onYes;
    openModal("confirmModal");
}

/* ---------- Form validation helpers ---------- */

function setError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorBox = document.getElementById(fieldId + "Error");
    if (message) field.classList.add("invalid");
    else field.classList.remove("invalid");
    if (errorBox) errorBox.textContent = message || "";
    return !message; // true means the field is valid
}

function clearErrors(form) {
    form.querySelectorAll(".invalid").forEach(function (f) { f.classList.remove("invalid"); });
    form.querySelectorAll(".error-text").forEach(function (e) { e.textContent = ""; });
}

function isValidName(text) { return /^[A-Za-z][A-Za-z .']{1,49}$/.test(text); }
function isValidPhone(text) { return /^[6-9][0-9]{9}$/.test(text); }

/* ---------- Common layout: sidebar toggle + logout ---------- */

function setupLayout() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const toggle = document.getElementById("menuToggle");

    toggle.addEventListener("click", function () {
        sidebar.classList.add("open");
        overlay.classList.add("show");
    });
    overlay.addEventListener("click", function () {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    });

    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("sidebarLogout").addEventListener("click", function (e) {
        e.preventDefault();
        logout();
    });

    document.getElementById("confirmYesBtn").addEventListener("click", function () {
        closeModal("confirmModal");
        if (confirmCallback) confirmCallback();
        confirmCallback = null;
    });
}

/* =========================================================
   3. LOGIN PAGE
   ========================================================= */

function initLogin() {
    // Already logged in? Go straight to the dashboard
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
        return;
    }

    const form = document.getElementById("loginForm");
    const errorBox = document.getElementById("loginError");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (username === "" || password === "") {
            errorBox.textContent = "Please enter both username and password.";
            errorBox.classList.add("show");
            return;
        }

        if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
            localStorage.setItem(STORAGE_KEYS.login, "true");
            errorBox.classList.remove("show");
            showToast("Login successful. Redirecting...");
            setTimeout(function () { window.location.href = "dashboard.html"; }, 600);
        } else {
            errorBox.textContent = "Invalid username or password. Use the demo credentials shown above.";
            errorBox.classList.add("show");
        }
    });
}

/* =========================================================
   4. DASHBOARD
   ========================================================= */

function initDashboard() {
    const donors = getDonors();
    const inventory = getInventory();
    const requests = getRequests();
    const donations = getDonations();

    // ---- Statistic cards ----
    document.getElementById("statDonors").textContent = donors.length;
    document.getElementById("statUnits").textContent = totalUnits();
    document.getElementById("statDonations").textContent = donations.length;
    document.getElementById("statRequests").textContent = requests.length;

    // ---- Bar chart (built with plain divs) ----
    let maxUnits = 1;
    BLOOD_GROUPS.forEach(function (g) { if ((inventory[g] || 0) > maxUnits) maxUnits = inventory[g]; });

    let barsHtml = "";
    let labelsHtml = "";
    BLOOD_GROUPS.forEach(function (g) {
        const units = inventory[g] || 0;
        const height = Math.round((units / maxUnits) * 85); // max 85% so the value label fits
        const lowClass = getStockStatus(units) !== "ok" ? " low" : "";
        barsHtml += '<div class="bar-item" title="' + g + ": " + units + ' units">' +
                    '<div class="bar-value">' + units + "</div>" +
                    '<div class="bar' + lowClass + '" style="height:0%" data-height="' + height + '%"></div></div>';
        labelsHtml += "<span>" + g + "</span>";
    });
    document.getElementById("stockChart").innerHTML = barsHtml;
    document.getElementById("stockChartLabels").innerHTML = labelsHtml;

    // Animate the bars growing to their height
    setTimeout(function () {
        document.querySelectorAll(".bar").forEach(function (bar) { bar.style.height = bar.dataset.height; });
    }, 50);

    // ---- Inventory summary ----
    const lowGroups = BLOOD_GROUPS.filter(function (g) { return getStockStatus(inventory[g] || 0) === "low"; });
    const outGroups = BLOOD_GROUPS.filter(function (g) { return getStockStatus(inventory[g] || 0) === "out"; });
    const countStatus = function (s) { return requests.filter(function (r) { return r.status === s; }).length; };

    let highest = BLOOD_GROUPS[0];
    BLOOD_GROUPS.forEach(function (g) { if ((inventory[g] || 0) > (inventory[highest] || 0)) highest = g; });

    document.getElementById("inventorySummary").innerHTML =
        "<li><span>Total units available</span><strong>" + totalUnits() + "</strong></li>" +
        "<li><span>Highest stock group</span><strong>" + highest + " (" + (inventory[highest] || 0) + ")</strong></li>" +
        "<li><span>Low stock groups</span><strong>" + lowGroups.length + "</strong></li>" +
        "<li><span>Out of stock groups</span><strong>" + outGroups.length + "</strong></li>" +
        "<li><span>Pending requests</span><strong>" + countStatus("Pending") + "</strong></li>" +
        "<li><span>Approved requests</span><strong>" + countStatus("Approved") + "</strong></li>" +
        "<li><span>Fulfilled requests</span><strong>" + countStatus("Fulfilled") + "</strong></li>";

    // ---- Blood group-wise stock mini cards ----
    let miniHtml = "";
    BLOOD_GROUPS.forEach(function (g) {
        const units = inventory[g] || 0;
        const low = getStockStatus(units) !== "ok" ? " low" : "";
        miniHtml += '<div class="group-mini' + low + '"><div class="g">' + g + '</div><div class="u">' + units + " units</div></div>";
    });
    document.getElementById("groupMiniGrid").innerHTML = miniHtml;

    // ---- Low stock alerts ----
    let alertHtml = "";
    BLOOD_GROUPS.forEach(function (g) {
        const units = inventory[g] || 0;
        const status = getStockStatus(units);
        if (status === "out") {
            alertHtml += '<div class="alert-item out"><span>&#9888; <strong>' + g + "</strong> is out of stock</span><span>0 units</span></div>";
        } else if (status === "low") {
            alertHtml += '<div class="alert-item"><span>&#9888; <strong>' + g + "</strong> is running low</span><span>" + units + " units</span></div>";
        }
    });
    document.getElementById("lowStockAlerts").innerHTML =
        alertHtml || '<div class="alert-ok">&#10004; All blood groups have sufficient stock.</div>';

    // ---- Recent donors (latest 5) ----
    const recentDonors = donors.slice().sort(function (a, b) {
        return (b.registeredOn || "").localeCompare(a.registeredOn || "") || b.id.localeCompare(a.id);
    }).slice(0, 5);
    document.getElementById("recentDonors").innerHTML = recentDonors.length ? recentDonors.map(function (d) {
        return "<tr><td>" + d.id + "</td><td>" + escapeHtml(d.name) + "</td><td>" + groupBadge(d.bloodGroup) +
               "</td><td>" + escapeHtml(d.city) + "</td><td>" + formatDate(d.registeredOn) + "</td></tr>";
    }).join("") : '<tr class="empty-row"><td colspan="5">No donors registered yet.</td></tr>';

    // ---- Recent requests (latest 5) ----
    const recentRequests = requests.slice().sort(function (a, b) {
        return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
    }).slice(0, 5);
    document.getElementById("recentRequests").innerHTML = recentRequests.length ? recentRequests.map(function (r) {
        return "<tr><td>" + r.id + "</td><td>" + escapeHtml(r.patientName) + "</td><td>" + groupBadge(r.bloodGroup) +
               "</td><td>" + r.units + "</td><td>" + statusBadge(r.status) + "</td></tr>";
    }).join("") : '<tr class="empty-row"><td colspan="5">No blood requests yet.</td></tr>';
}

/* =========================================================
   5. DONOR MANAGEMENT
   ========================================================= */

function initDonors() {
    const searchInput = document.getElementById("donorSearch");
    const groupFilter = document.getElementById("donorGroupFilter");
    const form = document.getElementById("donorForm");

    function renderDonors() {
        const search = searchInput.value.trim().toLowerCase();
        const group = groupFilter.value;
        const allDonors = getDonors();

        const list = allDonors.filter(function (d) {
            const matchName = d.name.toLowerCase().includes(search);
            const matchGroup = group === "" || d.bloodGroup === group;
            return matchName && matchGroup;
        });

        document.getElementById("donorCount").textContent = "Showing " + list.length + " of " + allDonors.length + " donors";

        const tbody = document.getElementById("donorTableBody");
        if (list.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No donors found.</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (d) {
            return "<tr>" +
                "<td>" + d.id + "</td>" +
                "<td><strong>" + escapeHtml(d.name) + "</strong></td>" +
                "<td>" + d.age + "</td>" +
                "<td>" + escapeHtml(d.gender) + "</td>" +
                "<td>" + groupBadge(d.bloodGroup) + "</td>" +
                "<td>" + escapeHtml(d.phone) + "</td>" +
                "<td>" + escapeHtml(d.address) + "</td>" +
                "<td>" + escapeHtml(d.city) + "</td>" +
                '<td><div class="actions">' +
                    '<button class="btn btn-light btn-sm" data-edit="' + d.id + '">Edit</button>' +
                    '<button class="btn btn-danger btn-sm" data-delete="' + d.id + '">Delete</button>' +
                "</div></td></tr>";
        }).join("");
    }

    // Open modal in "Add" mode
    document.getElementById("addDonorBtn").addEventListener("click", function () {
        form.reset();
        clearErrors(form);
        document.getElementById("donorId").value = "";
        document.getElementById("donorModalTitle").textContent = "Add Donor";
        document.getElementById("donorSaveBtn").textContent = "Save Donor";
        openModal("donorModal");
        document.getElementById("donorName").focus();
    });

    // Edit and Delete buttons inside the table
    document.getElementById("donorTableBody").addEventListener("click", function (e) {
        const editBtn = e.target.closest("[data-edit]");
        const deleteBtn = e.target.closest("[data-delete]");

        if (editBtn) {
            const donor = getDonors().find(function (d) { return d.id === editBtn.dataset.edit; });
            if (!donor) return;
            clearErrors(form);
            document.getElementById("donorId").value = donor.id;
            document.getElementById("donorName").value = donor.name;
            document.getElementById("donorAge").value = donor.age;
            document.getElementById("donorGender").value = donor.gender;
            document.getElementById("donorBloodGroup").value = donor.bloodGroup;
            document.getElementById("donorPhone").value = donor.phone;
            document.getElementById("donorAddress").value = donor.address;
            document.getElementById("donorCity").value = donor.city;
            document.getElementById("donorModalTitle").textContent = "Edit Donor (" + donor.id + ")";
            document.getElementById("donorSaveBtn").textContent = "Update Donor";
            openModal("donorModal");
        }

        if (deleteBtn) {
            const id = deleteBtn.dataset.delete;
            const donor = getDonors().find(function (d) { return d.id === id; });
            if (!donor) return;
            showConfirm("Delete Donor", "Delete donor " + donor.name + " (" + id + ")? This cannot be undone.", function () {
                saveDonors(getDonors().filter(function (d) { return d.id !== id; }));
                renderDonors();
                showToast("Donor " + donor.name + " deleted.");
            }, "Delete");
        }
    });

    // Save (add or update) donor
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const id = document.getElementById("donorId").value;
        const name = document.getElementById("donorName").value.trim();
        const age = parseInt(document.getElementById("donorAge").value, 10);
        const gender = document.getElementById("donorGender").value;
        const bloodGroup = document.getElementById("donorBloodGroup").value;
        const phone = document.getElementById("donorPhone").value.trim();
        const address = document.getElementById("donorAddress").value.trim();
        const city = document.getElementById("donorCity").value.trim();

        // Validate every field
        let valid = true;
        valid = setError("donorName", !name ? "Name is required." : (!isValidName(name) ? "Use letters only (2-50 characters)." : "")) && valid;
        valid = setError("donorAge", isNaN(age) ? "Age is required." : (age < 18 || age > 65 ? "Donor age must be between 18 and 65." : "")) && valid;
        valid = setError("donorGender", gender ? "" : "Please select gender.") && valid;
        valid = setError("donorBloodGroup", bloodGroup ? "" : "Please select blood group.") && valid;
        valid = setError("donorPhone", !phone ? "Phone is required." : (!isValidPhone(phone) ? "Enter a valid 10-digit mobile number." : "")) && valid;
        valid = setError("donorAddress", address.length < 3 ? "Please enter the address." : "") && valid;
        valid = setError("donorCity", !city ? "City is required." : (!isValidName(city) ? "Enter a valid city name." : "")) && valid;

        const donors = getDonors();
        // Phone number must be unique
        if (phone && donors.some(function (d) { return d.phone === phone && d.id !== id; })) {
            valid = setError("donorPhone", "This phone number is already registered.") && valid;
        }

        if (!valid) {
            showToast("Please correct the highlighted fields.", "error");
            return;
        }

        if (id) {
            // Update existing donor
            const donor = donors.find(function (d) { return d.id === id; });
            Object.assign(donor, { name: name, age: age, gender: gender, bloodGroup: bloodGroup, phone: phone, address: address, city: city });
            saveDonors(donors);
            showToast("Donor " + name + " updated successfully.");
        } else {
            // Add new donor
            const newDonor = {
                id: generateId("D", donors, 3),
                name: name, age: age, gender: gender, bloodGroup: bloodGroup,
                phone: phone, address: address, city: city,
                registeredOn: today()
            };
            donors.push(newDonor);
            saveDonors(donors);
            showToast("Donor " + name + " added with ID " + newDonor.id + ".");
        }

        closeModal("donorModal");
        renderDonors();
    });

    searchInput.addEventListener("input", renderDonors);
    groupFilter.addEventListener("change", renderDonors);
    renderDonors();
}

/* =========================================================
   6. BLOOD INVENTORY
   ========================================================= */

function initInventory() {
    const searchInput = document.getElementById("inventorySearch");
    const statusFilter = document.getElementById("inventoryStatusFilter");

    function renderInventory() {
        const inventory = getInventory();
        const search = searchInput.value.trim().toUpperCase();
        const status = statusFilter.value;

        const groups = BLOOD_GROUPS.filter(function (g) {
            const matchSearch = g.includes(search);
            const matchStatus = status === "" || getStockStatus(inventory[g] || 0) === status;
            return matchSearch && matchStatus;
        });

        document.getElementById("inventoryTotal").textContent = "Total available: " + totalUnits() + " units";

        const grid = document.getElementById("inventoryGrid");
        if (groups.length === 0) {
            grid.innerHTML = '<div class="card" style="grid-column:1/-1"><div class="card-body" style="text-align:center;color:#6B6B6B">No blood group matches your search.</div></div>';
            return;
        }
        grid.innerHTML = groups.map(function (g) {
            const units = inventory[g] || 0;
            const s = getStockStatus(units);
            return '<div class="blood-card ' + (s === "ok" ? "" : s) + '">' +
                '<div class="group-name">' + g + "</div>" +
                '<div class="units"><strong>' + units + "</strong> units available</div>" +
                stockBadge(units) +
                '<div class="card-actions">' +
                    '<button class="btn btn-primary btn-sm" data-add="' + g + '">+ Add</button>' +
                    '<button class="btn btn-outline btn-sm" data-update="' + g + '">Update</button>' +
                "</div></div>";
        }).join("");
    }

    function openAddUnits(group) {
        const form = document.getElementById("addUnitsForm");
        form.reset();
        clearErrors(form);
        document.getElementById("addUnitsGroup").value = group || "";
        openModal("addUnitsModal");
    }

    document.getElementById("addUnitsBtn").addEventListener("click", function () { openAddUnits(""); });

    document.getElementById("inventoryGrid").addEventListener("click", function (e) {
        const addBtn = e.target.closest("[data-add]");
        const updateBtn = e.target.closest("[data-update]");
        if (addBtn) openAddUnits(addBtn.dataset.add);
        if (updateBtn) {
            const g = updateBtn.dataset.update;
            const form = document.getElementById("updateStockForm");
            clearErrors(form);
            document.getElementById("updateStockGroup").value = g;
            document.getElementById("updateStockGroupLabel").textContent = g;
            document.getElementById("updateStockValue").value = getInventory()[g] || 0;
            openModal("updateStockModal");
        }
    });

    // Add units to a blood group
    document.getElementById("addUnitsForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const group = document.getElementById("addUnitsGroup").value;
        const units = parseInt(document.getElementById("addUnitsCount").value, 10);

        let valid = setError("addUnitsGroup", group ? "" : "Please select blood group.");
        valid = setError("addUnitsCount", isNaN(units) || units < 1 || units > 100 ? "Enter units between 1 and 100." : "") && valid;
        if (!valid) return;

        const inventory = getInventory();
        inventory[group] = (inventory[group] || 0) + units;
        saveInventory(inventory);
        closeModal("addUnitsModal");
        renderInventory();
        showToast(units + " unit(s) added to " + group + ". New stock: " + inventory[group] + ".");
    });

    // Set the exact stock of a blood group
    document.getElementById("updateStockForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const group = document.getElementById("updateStockGroup").value;
        const valueText = document.getElementById("updateStockValue").value;
        const units = parseInt(valueText, 10);

        if (!setError("updateStockValue", valueText === "" || isNaN(units) || units < 0 || units > 500 ? "Enter a number between 0 and 500." : "")) return;

        const inventory = getInventory();
        inventory[group] = units;
        saveInventory(inventory);
        closeModal("updateStockModal");
        renderInventory();
        showToast("Stock of " + group + " updated to " + units + " units.", units <= LOW_STOCK_LIMIT ? "warning" : "success");
    });

    searchInput.addEventListener("input", renderInventory);
    statusFilter.addEventListener("change", renderInventory);
    renderInventory();
}

/* =========================================================
   7. BLOOD REQUESTS
   ========================================================= */

function initRequests() {
    const searchInput = document.getElementById("requestSearch");
    const statusFilter = document.getElementById("requestStatusFilter");
    const groupFilter = document.getElementById("requestGroupFilter");
    const priorityFilter = document.getElementById("requestPriorityFilter");
    const form = document.getElementById("requestForm");

    function renderRequests() {
        const search = searchInput.value.trim().toLowerCase();
        const all = getRequests();

        const list = all.filter(function (r) {
            const text = (r.id + " " + r.patientName + " " + r.hospital).toLowerCase();
            return text.includes(search) &&
                (statusFilter.value === "" || r.status === statusFilter.value) &&
                (groupFilter.value === "" || r.bloodGroup === groupFilter.value) &&
                (priorityFilter.value === "" || r.priority === priorityFilter.value);
        }).sort(function (a, b) { return b.date.localeCompare(a.date) || b.id.localeCompare(a.id); });

        document.getElementById("requestCount").textContent = "Showing " + list.length + " of " + all.length + " requests";

        const tbody = document.getElementById("requestTableBody");
        if (list.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="10">No requests found.</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (r) {
            // Show only the actions that make sense for the current status
            let actions = "";
            if (r.status === "Pending") {
                actions += '<button class="btn btn-info btn-sm" data-action="approve" data-id="' + r.id + '">Approve</button>';
                actions += '<button class="btn btn-light btn-sm" data-action="reject" data-id="' + r.id + '">Reject</button>';
            }
            if (r.status === "Approved") {
                actions += '<button class="btn btn-success btn-sm" data-action="fulfill" data-id="' + r.id + '">Mark Fulfilled</button>';
            }
            actions += '<button class="btn btn-danger btn-sm" data-action="delete" data-id="' + r.id + '">Delete</button>';

            return "<tr>" +
                "<td>" + r.id + "</td>" +
                "<td><strong>" + escapeHtml(r.patientName) + "</strong></td>" +
                "<td>" + escapeHtml(r.hospital) + "</td>" +
                "<td>" + groupBadge(r.bloodGroup) + "</td>" +
                "<td>" + r.units + "</td>" +
                "<td>" + escapeHtml(r.contact) + "</td>" +
                "<td>" + formatDate(r.date) + "</td>" +
                "<td>" + priorityBadge(r.priority) + "</td>" +
                "<td>" + statusBadge(r.status) + "</td>" +
                '<td><div class="actions">' + actions + "</div></td></tr>";
        }).join("");
    }

    function updateStatus(id, newStatus) {
        const requests = getRequests();
        const req = requests.find(function (r) { return r.id === id; });
        req.status = newStatus;
        saveRequests(requests);
        renderRequests();
    }

    document.getElementById("addRequestBtn").addEventListener("click", function () {
        form.reset();
        clearErrors(form);
        document.getElementById("reqDate").value = today();
        openModal("requestModal");
        document.getElementById("reqPatient").focus();
    });

    // Approve / Reject / Fulfil / Delete buttons
    document.getElementById("requestTableBody").addEventListener("click", function (e) {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const id = btn.dataset.id;
        const req = getRequests().find(function (r) { return r.id === id; });
        if (!req) return;
        const action = btn.dataset.action;

        if (action === "approve") {
            showConfirm("Approve Request", "Approve request " + id + " for " + req.patientName + " (" + req.units + " unit(s) of " + req.bloodGroup + ")?", function () {
                updateStatus(id, "Approved");
                const stock = getInventory()[req.bloodGroup] || 0;
                if (stock < req.units) {
                    showToast("Request " + id + " approved, but only " + stock + " unit(s) of " + req.bloodGroup + " in stock.", "warning");
                } else {
                    showToast("Request " + id + " approved.");
                }
            }, "Approve");
        }

        if (action === "reject") {
            showConfirm("Reject Request", "Reject request " + id + " for " + req.patientName + "?", function () {
                updateStatus(id, "Rejected");
                showToast("Request " + id + " rejected.", "warning");
            }, "Reject");
        }

        if (action === "fulfill") {
            const inventory = getInventory();
            const stock = inventory[req.bloodGroup] || 0;
            if (stock < req.units) {
                showToast("Cannot fulfil: only " + stock + " unit(s) of " + req.bloodGroup + " available. Add stock first.", "error");
                return;
            }
            showConfirm("Mark as Fulfilled", "Issue " + req.units + " unit(s) of " + req.bloodGroup + " for " + req.patientName + "? Stock will reduce from " + stock + " to " + (stock - req.units) + ".", function () {
                inventory[req.bloodGroup] = stock - req.units;
                saveInventory(inventory);
                updateStatus(id, "Fulfilled");
                showToast("Request " + id + " fulfilled. " + req.bloodGroup + " stock is now " + inventory[req.bloodGroup] + ".");
            }, "Mark Fulfilled");
        }

        if (action === "delete") {
            showConfirm("Delete Request", "Delete request " + id + "? This cannot be undone.", function () {
                saveRequests(getRequests().filter(function (r) { return r.id !== id; }));
                renderRequests();
                showToast("Request " + id + " deleted.");
            }, "Delete");
        }
    });

    // Create new request
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const patientName = document.getElementById("reqPatient").value.trim();
        const hospital = document.getElementById("reqHospital").value.trim();
        const bloodGroup = document.getElementById("reqGroup").value;
        const units = parseInt(document.getElementById("reqUnits").value, 10);
        const contact = document.getElementById("reqContact").value.trim();
        const date = document.getElementById("reqDate").value;
        const priority = document.getElementById("reqPriority").value;

        let valid = true;
        valid = setError("reqPatient", !patientName ? "Patient name is required." : (!isValidName(patientName) ? "Use letters only (2-50 characters)." : "")) && valid;
        valid = setError("reqHospital", hospital.length < 3 ? "Hospital name is required." : "") && valid;
        valid = setError("reqGroup", bloodGroup ? "" : "Please select blood group.") && valid;
        valid = setError("reqUnits", isNaN(units) || units < 1 || units > 20 ? "Enter units between 1 and 20." : "") && valid;
        valid = setError("reqContact", !isValidPhone(contact) ? "Enter a valid 10-digit mobile number." : "") && valid;
        valid = setError("reqDate", !date ? "Request date is required." : (date > today() ? "Date cannot be in the future." : "")) && valid;

        if (!valid) {
            showToast("Please correct the highlighted fields.", "error");
            return;
        }

        const requests = getRequests();
        const newRequest = {
            id: generateId("R", requests, 3),
            patientName: patientName, hospital: hospital, bloodGroup: bloodGroup,
            units: units, contact: contact, date: date, priority: priority, status: "Pending"
        };
        requests.push(newRequest);
        saveRequests(requests);
        closeModal("requestModal");
        renderRequests();
        showToast("Request " + newRequest.id + " created for " + patientName + ".");
    });

    searchInput.addEventListener("input", renderRequests);
    statusFilter.addEventListener("change", renderRequests);
    groupFilter.addEventListener("change", renderRequests);
    priorityFilter.addEventListener("change", renderRequests);
    renderRequests();
}

/* =========================================================
   8. DONATION RECORDS
   ========================================================= */

// Minimum gap between two donations by the same donor (demo rule)
const DONATION_GAP_DAYS = 90;

function initDonations() {
    const searchInput = document.getElementById("donationSearch");
    const groupFilter = document.getElementById("donationGroupFilter");
    const form = document.getElementById("donationForm");
    const donorSelect = document.getElementById("donationDonor");

    function renderDonations() {
        const search = searchInput.value.trim().toLowerCase();
        const all = getDonations();

        const list = all.filter(function (d) {
            const text = (d.id + " " + d.donorId + " " + d.donorName).toLowerCase();
            return text.includes(search) && (groupFilter.value === "" || d.bloodGroup === groupFilter.value);
        }).sort(function (a, b) { return b.date.localeCompare(a.date) || b.id.localeCompare(a.id); });

        document.getElementById("donationCount").textContent = "Showing " + list.length + " of " + all.length + " donations";

        const tbody = document.getElementById("donationTableBody");
        if (list.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No donation records found.</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(function (d) {
            return "<tr>" +
                "<td>" + d.id + "</td>" +
                "<td>" + d.donorId + "</td>" +
                "<td><strong>" + escapeHtml(d.donorName) + "</strong></td>" +
                "<td>" + groupBadge(d.bloodGroup) + "</td>" +
                "<td>" + d.units + "</td>" +
                "<td>" + formatDate(d.date) + "</td>" +
                '<td><div class="actions">' +
                    '<button class="btn btn-light btn-sm" data-view="' + d.donorId + '">View Donor</button>' +
                    '<button class="btn btn-danger btn-sm" data-delete="' + d.id + '">Delete</button>' +
                "</div></td></tr>";
        }).join("");
    }

    // Returns the most recent donation date of a donor (or null)
    function lastDonationDate(donorId) {
        const dates = getDonations().filter(function (d) { return d.donorId === donorId; })
            .map(function (d) { return d.date; }).sort();
        return dates.length ? dates[dates.length - 1] : null;
    }

    function daysBetween(dateA, dateB) {
        return Math.round((new Date(dateB) - new Date(dateA)) / (1000 * 60 * 60 * 24));
    }

    function showDonorPreview() {
        const preview = document.getElementById("donorPreview");
        const donor = getDonors().find(function (d) { return d.id === donorSelect.value; });
        if (!donor) {
            preview.classList.remove("show");
            return;
        }
        const last = lastDonationDate(donor.id);
        preview.innerHTML = "<strong>" + escapeHtml(donor.name) + "</strong> &middot; " + donor.bloodGroup +
            " &middot; Age " + donor.age + " &middot; " + escapeHtml(donor.phone) + " &middot; " + escapeHtml(donor.city) +
            "<br>Last donation: " + (last ? formatDate(last) : "No previous donation");
        preview.classList.add("show");
    }

    document.getElementById("addDonationBtn").addEventListener("click", function () {
        const donors = getDonors();
        if (donors.length === 0) {
            showToast("No donors found. Please add a donor first.", "error");
            return;
        }
        form.reset();
        clearErrors(form);
        donorSelect.innerHTML = '<option value="">Select donor</option>' + donors.map(function (d) {
            return '<option value="' + d.id + '">' + d.id + " - " + escapeHtml(d.name) + " (" + d.bloodGroup + ")</option>";
        }).join("");
        document.getElementById("donationDate").value = today();
        document.getElementById("donationUnits").value = 1;
        showDonorPreview();
        openModal("donationModal");
    });

    donorSelect.addEventListener("change", showDonorPreview);

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const donorId = donorSelect.value;
        const date = document.getElementById("donationDate").value;
        const units = parseInt(document.getElementById("donationUnits").value, 10);
        const donor = getDonors().find(function (d) { return d.id === donorId; });

        let valid = true;
        valid = setError("donationDonor", donor ? "" : "Please select a donor.") && valid;
        valid = setError("donationDate", !date ? "Date is required." : (date > today() ? "Date cannot be in the future." : "")) && valid;
        valid = setError("donationUnits", isNaN(units) || units < 1 || units > 2 ? "Units must be 1 or 2." : "") && valid;

        // Demo eligibility rule: 90 days gap between donations
        if (donor && date) {
            const last = lastDonationDate(donorId);
            if (last && Math.abs(daysBetween(last, date)) < DONATION_GAP_DAYS) {
                valid = setError("donationDonor", "This donor last donated on " + formatDate(last) + ". A gap of " + DONATION_GAP_DAYS + " days is required.") && valid;
            }
        }

        if (!valid) {
            showToast("Please correct the highlighted fields.", "error");
            return;
        }

        const donations = getDonations();
        const record = {
            id: generateId("DN", donations, 3),
            donorId: donor.id, donorName: donor.name, bloodGroup: donor.bloodGroup,
            units: units, date: date
        };
        donations.push(record);
        saveDonations(donations);

        // Donated blood is added to the inventory
        const inventory = getInventory();
        inventory[donor.bloodGroup] = (inventory[donor.bloodGroup] || 0) + units;
        saveInventory(inventory);

        closeModal("donationModal");
        renderDonations();
        showToast("Donation " + record.id + " recorded. " + units + " unit(s) added to " + donor.bloodGroup + " stock.");
    });

    document.getElementById("donationTableBody").addEventListener("click", function (e) {
        const viewBtn = e.target.closest("[data-view]");
        const deleteBtn = e.target.closest("[data-delete]");

        if (viewBtn) {
            const donorId = viewBtn.dataset.view;
            const donor = getDonors().find(function (d) { return d.id === donorId; });
            const count = getDonations().filter(function (d) { return d.donorId === donorId; }).length;
            const body = document.getElementById("donorInfoBody");
            if (!donor) {
                body.innerHTML = "<p>Donor <strong>" + donorId + "</strong> has been removed from the donor list. The donation record is kept for history.</p>";
            } else {
                body.innerHTML = '<table class="info-table">' +
                    "<tr><td>Donor ID</td><td>" + donor.id + "</td></tr>" +
                    "<tr><td>Name</td><td><strong>" + escapeHtml(donor.name) + "</strong></td></tr>" +
                    "<tr><td>Age / Gender</td><td>" + donor.age + " / " + escapeHtml(donor.gender) + "</td></tr>" +
                    "<tr><td>Blood Group</td><td>" + groupBadge(donor.bloodGroup) + "</td></tr>" +
                    "<tr><td>Phone</td><td>" + escapeHtml(donor.phone) + "</td></tr>" +
                    "<tr><td>Address</td><td>" + escapeHtml(donor.address) + ", " + escapeHtml(donor.city) + "</td></tr>" +
                    "<tr><td>Registered On</td><td>" + formatDate(donor.registeredOn) + "</td></tr>" +
                    "<tr><td>Total Donations</td><td>" + count + "</td></tr>" +
                    "</table>";
            }
            openModal("donorInfoModal");
        }

        if (deleteBtn) {
            const id = deleteBtn.dataset.delete;
            const record = getDonations().find(function (d) { return d.id === id; });
            if (!record) return;
            showConfirm("Delete Donation Record", "Delete donation " + id + "? " + record.units + " unit(s) will also be removed from " + record.bloodGroup + " stock.", function () {
                saveDonations(getDonations().filter(function (d) { return d.id !== id; }));
                const inventory = getInventory();
                inventory[record.bloodGroup] = Math.max(0, (inventory[record.bloodGroup] || 0) - record.units);
                saveInventory(inventory);
                renderDonations();
                showToast("Donation " + id + " deleted.");
            }, "Delete");
        }
    });

    searchInput.addEventListener("input", renderDonations);
    groupFilter.addEventListener("change", renderDonations);
    renderDonations();
}

/* =========================================================
   9. REPORTS
   ========================================================= */

function initReports() {
    function renderReport() {
        const donors = getDonors();
        const inventory = getInventory();
        const requests = getRequests();
        const donations = getDonations();
        const countStatus = function (s) { return requests.filter(function (r) { return r.status === s; }).length; };

        const now = new Date();
        document.getElementById("reportDate").textContent = "Generated on " + formatDate(today()) + " at " +
            now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const stats = [
            ["Total Donors", donors.length],
            ["Total Blood Units", totalUnits()],
            ["Total Donations", donations.length],
            ["Total Blood Requests", requests.length],
            ["Fulfilled Requests", countStatus("Fulfilled")],
            ["Pending Requests", countStatus("Pending")]
        ];
        document.getElementById("reportStats").innerHTML = stats.map(function (s) {
            return '<div class="stat-card"><div><div class="label">' + s[0] + '</div><div class="value">' + s[1] + "</div></div></div>";
        }).join("");

        document.getElementById("reportInventory").innerHTML = BLOOD_GROUPS.map(function (g) {
            const units = inventory[g] || 0;
            const donationCount = donations.filter(function (d) { return d.bloodGroup === g; }).length;
            return "<tr><td>" + groupBadge(g) + "</td><td><strong>" + units + "</strong></td><td>" + donationCount + "</td><td>" + stockBadge(units) + "</td></tr>";
        }).join("") + "<tr><td><strong>Total</strong></td><td><strong>" + totalUnits() + "</strong></td><td><strong>" + donations.length + "</strong></td><td></td></tr>";

        const statuses = ["Pending", "Approved", "Rejected", "Fulfilled"];
        document.getElementById("reportRequests").innerHTML = statuses.map(function (s) {
            const list = requests.filter(function (r) { return r.status === s; });
            const units = list.reduce(function (sum, r) { return sum + r.units; }, 0);
            return "<tr><td>" + statusBadge(s) + "</td><td>" + list.length + "</td><td>" + units + "</td></tr>";
        }).join("") + "<tr><td><strong>Total</strong></td><td><strong>" + requests.length + "</strong></td><td><strong>" +
            requests.reduce(function (sum, r) { return sum + r.units; }, 0) + "</strong></td></tr>";
    }

    document.getElementById("printReportBtn").addEventListener("click", function () { window.print(); });

    document.getElementById("resetDataBtn").addEventListener("click", function () {
        showConfirm("Reset Demo Data", "This will delete all your changes and restore the original sample records. Continue?", function () {
            resetAllData();
            renderReport();
            showToast("Demo data has been reset.", "warning");
        }, "Reset Data");
    });

    renderReport();
}

/* =========================================================
   10. START THE CORRECT PAGE
   ========================================================= */

if (currentPage === "login") {
    initLogin();
} else if (isLoggedIn()) {
    setupLayout();
    if (currentPage === "dashboard") initDashboard();
    if (currentPage === "donors") initDonors();
    if (currentPage === "inventory") initInventory();
    if (currentPage === "requests") initRequests();
    if (currentPage === "donations") initDonations();
    if (currentPage === "reports") initReports();
}
