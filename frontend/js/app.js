const API_BASE = "http://localhost:3000";

// --- Add Book ---
const addBookForm = document.getElementById("add-book-form");
const addBookMessage = document.getElementById("add-book-message");

if (addBookForm && addBookMessage) {
  addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    addBookMessage.hidden = true;
    const id = document.getElementById("book-id").value.trim();
    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();
    if (!id || !title || !author) {
      showElMessage(addBookMessage, "Please fill in all book ID, title and author.", true);
      return;
    }
    const btn = addBookForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, author }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showElMessage(addBookMessage, data.message || "Add book successfully!");
        addBookForm.reset();
      } else {
        showElMessage(addBookMessage, data.error || "An error occurred.", true);
      }
    } catch (err) {
      showElMessage(addBookMessage, "Cannot connect to server. Check backend at " + API_BASE, true);
    } finally {
      btn.disabled = false;
    }
  });
}

// --- Add User ---
const addUserForm = document.getElementById("add-user-form");
const addUserMessage = document.getElementById("add-user-message");

if (addUserForm && addUserMessage) {
  addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    addUserMessage.hidden = true;
    const id = document.getElementById("user-id").value.trim();
    const name = document.getElementById("user-name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    if (!id || !name || !email) {
      showElMessage(addUserMessage, "Please fill in all user ID, name and email.", true);
      return;
    }
    const btn = addUserForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showElMessage(addUserMessage, data.message || "Add user successfully!");
        addUserForm.reset();
      } else {
        showElMessage(addUserMessage, data.error || "An error occurred.", true);
      }
    } catch (err) {
      showElMessage(addUserMessage, "Cannot connect to server. Check backend at " + API_BASE, true);
    } finally {
      btn.disabled = false;
    }
  });
}

// --- Borrow Book ---
const borrowForm = document.getElementById("borrow-form");
const borrowMessage = document.getElementById("borrow-message");
if (borrowForm && borrowMessage) {
  borrowForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    borrowMessage.hidden = true;
    const userId = document.getElementById("borrow-user-id").value.trim();
    const bookId = document.getElementById("borrow-book-id").value.trim();
    if (!userId || !bookId) {
      showElMessage(borrowMessage, "Please fill in all borrower ID and book ID.", true);
      return;
    }
    const btn = borrowForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/borrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showElMessage(borrowMessage, data.message || "Borrow book successfully!");
        borrowForm.reset();
      } else {
        showElMessage(borrowMessage, data.error || "An error occurred.", true);
      }
    } catch (err) {
      showElMessage(borrowMessage, "Cannot connect to server. Check backend at " + API_BASE, true);
    } finally {
      btn.disabled = false;
    }
  });
}

// --- Return Book ---
const returnForm = document.getElementById("return-form");
const returnMessage = document.getElementById("return-message");
if (returnForm && returnMessage) {
  returnForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    returnMessage.hidden = true;
    const userId = document.getElementById("return-user-id").value.trim();
    const bookId = document.getElementById("return-book-id").value.trim();
    if (!userId || !bookId) {
      showElMessage(returnMessage, "Please fill in all borrower ID and book ID.", true);
      return;
    }
    const btn = returnForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bookId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showElMessage(returnMessage, data.message || "Return book successfully!");
        returnForm.reset();
      } else {
        showElMessage(returnMessage, data.error || "An error occurred.", true);
      }
    } catch (err) {
      showElMessage(returnMessage, "Cannot connect to server. Check backend at " + API_BASE, true);
    } finally {
      btn.disabled = false;
    }
  });
}

// --- Lookup by ID ---
const lookupForm = document.getElementById("lookup-form");
const lookupMessage = document.getElementById("lookup-message");
const lookupResult = document.getElementById("lookup-result");
const lookupResultBody = document.getElementById("lookup-result-body");

function showElMessage(el, text, isError = false) {
  if (!el) return;
  el.textContent = text;
  el.className = "message " + (isError ? "error" : "success");
  el.hidden = false;
}

if (lookupForm && lookupMessage && lookupResult && lookupResultBody) {
  lookupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    lookupMessage.hidden = true;
    lookupResult.hidden = true;
    const type = document.getElementById("lookup-type").value;
    const id = document.getElementById("lookup-id").value.trim();
    if (!id) {
      showElMessage(lookupMessage, "Please fill in ID.", true);
      return;
    }
    const endpoint = type === "book" ? "books" : "users";
    const btn = lookupForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${encodeURIComponent(id)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        lookupResultBody.textContent = JSON.stringify(data, null, 2);
        lookupResult.hidden = false;
        showElMessage(lookupMessage, "Found.");
      } else {
        showElMessage(lookupMessage, data.error || "Not found.", true);
      }
    } catch (err) {
      showElMessage(lookupMessage, "Cannot connect to server.", true);
    } finally {
      btn.disabled = false;
    }
  });
}
