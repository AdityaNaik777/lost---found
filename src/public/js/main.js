// Frontend JS: uses fetch to talk to REST API at /report-item
document.addEventListener("DOMContentLoaded", () => {
  const itemsList = document.getElementById("itemsList");
  const form = document.getElementById("itemForm");

  async function fetchItems() {
    try {
      const res = await fetch("/api/items"); // ensure this matches app.js mount
      if (!res.ok)
        throw new Error("Network response was not ok: " + res.status);
      const items = await res.json();
      renderItems(items);
    } catch (err) {
      console.error("fetchItems error", err);
      if (itemsList) itemsList.innerHTML = "<li>Error loading items</li>";
    }
  }

  function renderItems(items) {
    if (!itemsList) return;
    itemsList.innerHTML = "";
    if (!items || items.length === 0) {
      itemsList.innerHTML = "<li>No items yet.</li>";
      return;
    }
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <div class="item-left">
          ${it.image ? <img src="${it.image}" class="thumb" alt="${escapeHtml(it.title)}" /> : ""}}
        </div>
        <div class="item-right">
          <strong>${escapeHtml(it.title)}</strong>
          <div class="meta">${new Date(it.createdAt).toLocaleString()} - ${escapeHtml(it.contact)}</div>
          <p>${escapeHtml(it.description)}</p>
          <button data-id="${it.id}" class="delete-btn">Delete</button>
        </div>
      `;
      itemsList.appendChild(li);
    });

    // attach delete handlers
    itemsList.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        try {
          const res = await fetch("/api/items/" + id, { method: "DELETE" });
          if (!res.ok) throw new Error("Delete failed: " + res.status);
          fetchItems();
        } catch (err) {
          console.error("delete error", err);
        }
      });
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData();
      fd.append("title", (document.getElementById("title") || {}).value || "");
      fd.append(
        "description",
        (document.getElementById("description") || {}).value || "",
      );
      fd.append(
        "contact",
        (document.getElementById("contact") || {}).value || "",
      );
      const imageEl = document.getElementById("image");
      if (imageEl && imageEl.files[0]) fd.append("image", imageEl.files[0]);

      try {
        const res = await fetch("/report-item", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error("Post failed: " + res.status);
        // go back to list after submit
        window.location.href = "/items";
      } catch (err) {
        console.error("submit error", err);
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(
      /[&<>"']/g,
      (s) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[s],
    );
  }

  // initial load
  if (itemsList) fetchItems();
});
