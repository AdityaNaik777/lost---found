document.addEventListener("DOMContentLoaded", () => {
  const itemsList = document.getElementById("itemsList");
  const form = document.getElementById("itemForm");

  async function fetchItems() {
    try {
      const res = await fetch("/api/items");
      const items = await res.json();
      renderItems(items);
    } catch (err) {
      console.error("fetchItems error", err);
    }
  }

  function renderItems(items) {
    // Update Stats (Make sure these IDs exist in list.ejs)
    if (document.getElementById("totalCount"))
      document.getElementById("totalCount").innerText = items.length;
    if (document.getElementById("lostCount"))
      document.getElementById("lostCount").innerText = items.filter(
        (i) => i.status === "lost",
      ).length;
    if (document.getElementById("foundCount"))
      document.getElementById("foundCount").innerText = items.filter(
        (i) => i.status === "found",
      ).length;

    if (!itemsList) return;
    itemsList.innerHTML = "";

    if (!items || items.length === 0) {
      itemsList.innerHTML = "<li>No items yet.</li>";
      return;
    }

    items.forEach((it) => {
      // --- BADGE LOGIC START ---
      const isFound = it.status === "found";
      const statusLabel = isFound ? "FOUND" : "LOST";
      const badgeBg = isFound ? "#10b981" : "#ef4444"; // Green for Found, Red for Lost
      // --- BADGE LOGIC END ---

      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <div class="item-left">
          ${it.image ? `<img src="${it.image}" class="thumb" alt="${escapeHtml(it.title)}" />` : ""}
        </div>
        <div class="item-right">
          <span style="background: ${badgeBg}; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-weight: bold; margin-bottom: 8px; display: inline-block;">
            ${statusLabel}
          </span>

          <strong>${escapeHtml(it.title)}</strong>
          <div class="meta">${new Date(it.createdAt).toLocaleString()} - ${escapeHtml(it.contact)}</div>
          <p>${escapeHtml(it.description)}</p>
          <button data-id="${it.id}" class="delete-btn">Delete</button>
        </div>
      `;
      itemsList.appendChild(li);
    });
  }

  // DELETE HANDLER
  if (itemsList) {
    itemsList.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;
        if (!confirm("Delete this item?")) return;
        try {
          const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
          if (res.ok) fetchItems();
        } catch (err) {
          console.error("Delete failed", err);
        }
      }
    });
  }

  // SUBMIT HANDLER
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // This stops the URL from getting those "?" parameters
      const formData = new FormData(form);
      try {
        const res = await fetch("/api/items", {
          method: "POST",
          body: formData,
        });
        if (res.ok) window.location.href = "/items";
      } catch (err) {
        console.error("Save error:", err);
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

  fetchItems();
});
