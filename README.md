# Blood Bank Management System (Frontend Only)

A BCA Third-Year academic project built with **HTML5, CSS3 and Vanilla JavaScript only**.
No backend, no database server, no frameworks. All data is stored in the browser's **LocalStorage**.

> **Disclaimer:** This is a frontend simulation for academic demonstration. It is **not** a real
> hospital, blood inventory or secure medical system. The login is a JavaScript demo and is
> **not production-grade security**. All names and records are sample data.

---

## How to Run

1. Download / unzip the project folder.
2. Open the folder and **double-click `index.html`**. It opens in your web browser
   (Chrome, Edge or Firefox recommended).
3. Log in with the demo credentials:
   - **Username:** `admin`
   - **Password:** `admin123`

No installation, internet connection or server is needed.

---

## Folder Structure

```
blood-bank-management-system/
├── index.html        → Admin login page
├── dashboard.html    → Statistics, bar chart, alerts, recent records
├── donors.html       → Add / edit / delete / search / filter donors
├── inventory.html    → Blood group cards, add units, update stock
├── requests.html     → Create, approve, reject, fulfil blood requests
├── donations.html    → Record donations, view history and donor info
├── reports.html      → Summary report with print button
├── css/
│   └── style.css     → All styling (colours, layout, responsive, print)
├── js/
│   ├── data.js       → Sample data + LocalStorage save/load functions
│   └── script.js     → All page logic (login, CRUD, search, charts...)
└── README.md
```

---

## Modules and Features

| Module | Features |
|---|---|
| **Login** | Demo admin login, error message for wrong credentials, page protection (inner pages redirect to login if not logged in), logout with confirmation |
| **Dashboard** | Total donors, total blood units, total donations, total requests, CSS bar chart of stock, inventory summary, blood group-wise stock, low stock alerts, recent donors, recent requests |
| **Donors** | Add / edit donor in a modal form, delete with confirmation, search by name, filter by blood group, form validation (age 18–65, 10-digit phone, unique phone) |
| **Blood Inventory** | Cards for all 8 blood groups, add units, set exact stock, search by blood group, filter by stock level, Low / Out of Stock indicators |
| **Blood Requests** | Create request, approve, reject, mark fulfilled (deducts stock; blocked if stock is not enough), delete, search, filter by status / blood group / priority |
| **Donations** | Record a donation (adds units to inventory automatically), 90-day gap rule between donations, view donor information, search and filter, delete record |
| **Reports** | Total donors, inventory by blood group, total donations, request counts by status, fulfilled requests, **Print Report** button, **Reset Demo Data** button |

---

## How the Data Works

- `js/data.js` loads **sample records** into LocalStorage the first time the site opens.
- Every add / edit / delete is saved to LocalStorage, so data stays after refreshing or
  reopening the browser.
- LocalStorage keys used: `bb_donors`, `bb_inventory`, `bb_requests`, `bb_donations`, `bb_logged_in`.
- To start again with fresh sample data, go to **Reports → Reset Demo Data**
  (or clear the browser's site data).

### Business rules (simple, for demo)

- A blood group with **5 units or less** is shown as *Low Stock*; **0 units** is *Out of Stock*.
- Recording a donation **adds** units to that donor's blood group.
- Marking a request as fulfilled **removes** the required units from stock.
- A request can only be fulfilled after it is approved and if enough stock is available.
- A donor must wait **90 days** between two donations.

---

## Technologies Used

- **HTML5** – page structure and forms
- **CSS3** – Flexbox, Grid, transitions, media queries (responsive) and print styles
- **Vanilla JavaScript** – DOM manipulation, events, validation, LocalStorage
- The bar chart is made with plain HTML `div`s and CSS (no chart library), so it works offline.

## Colour Palette

| Use | Colour |
|---|---|
| Primary | `#A61B29` (dark red) |
| Secondary | `#FFFFFF` (white) |
| Background | `#F5F5F5` (light grey) |
| Text | `#333333` (dark grey) |
