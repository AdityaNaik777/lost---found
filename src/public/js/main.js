document.addEventListener("DOMContentLoaded", () => {
  const itemsList = document.getElementById("itemsList");
  const foundItemsList = document.getElementById("foundItemsList");
  const resolvedItemsList = document.getElementById("resolvedItemsList");
  const form = document.getElementById("itemForm");
  const openModalBtn = document.getElementById("openAddItemBtn");
  const closeModalBtn = document.getElementById("closeItemModal");
  const itemModal = document.getElementById("itemModal");
  const modalBackdrop = itemModal?.querySelector(".modal-backdrop");

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
    const activeLostItems = items.filter((i) => i.status === "lost");
    const foundItems = items.filter((i) => i.status === "found");
    const resolvedItems = items.filter((i) => i.status === "resolved");

    if (document.getElementById("totalCount"))
      document.getElementById("totalCount").innerText = items.length;
    if (document.getElementById("lostCount"))
      document.getElementById("lostCount").innerText = activeLostItems.length;
    if (document.getElementById("foundCount"))
      document.getElementById("foundCount").innerText = foundItems.length;
    if (document.getElementById("resolvedCount"))
      document.getElementById("resolvedCount").innerText = resolvedItems.length;

    if (itemsList) {
      itemsList.innerHTML = "";

      if (!activeLostItems.length) {
        itemsList.innerHTML = "<p class='empty-state'>No active lost items.</p>";
      } else {
        activeLostItems.forEach((it) => itemsList.appendChild(buildActiveCard(it)));
      }
    }

    if (foundItemsList) {
      foundItemsList.innerHTML = "";

      if (!foundItems.length) {
        foundItemsList.innerHTML = "<p class='empty-state'>No found reports right now.</p>";
      } else {
        foundItems.forEach((it) => foundItemsList.appendChild(buildFoundCard(it)));
      }
    }

    if (resolvedItemsList) {
      resolvedItemsList.innerHTML = "";

      if (!resolvedItems.length) {
        resolvedItemsList.innerHTML = "<p class='empty-state'>No success stories yet.</p>";
      } else {
        resolvedItems.forEach((it) =>
          resolvedItemsList.appendChild(buildResolvedRow(it)),
        );
      }
    }
  }

  function buildActiveCard(it) {
    const card = document.createElement("article");
    card.className = "item glass-card";
    card.innerHTML = `
      ${it.image ? `<img src="${it.image}" class="thumb" alt="${escapeHtml(it.title)}" />` : `<div class="thumb placeholder"><i class="fa-regular fa-image"></i></div>`}
      <div class="item-content">
        <span class="badge lost">LOST</span>
        <h4>${escapeHtml(it.title)}</h4>
        <p class="description">${escapeHtml(it.description || "No additional details provided.")}</p>
        <div class="meta">
          <span><i class="fa-regular fa-clock"></i> ${new Date(it.createdAt).toLocaleString()}</span>
          <span><i class="fa-regular fa-address-card"></i> ${escapeHtml(it.contact)}</span>
        </div>
        <div class="card-actions">
          <button data-id="${it.id}" class="resolve-btn">
            <i class="fa-solid fa-circle-check"></i> Claimed!
          </button>
          <button data-id="${it.id}" class="delete-btn">Delete</button>
        </div>
      </div>
    `;
    return card;
  }

  function buildResolvedRow(it) {
    const row = document.createElement("div");
    row.className = "resolved-row";
    row.innerHTML = `
      <div class="timeline-dot"><i class="fa-solid fa-check"></i></div>
      <div>
        <h4>${escapeHtml(it.title)}</h4>
        <p><i class="fa-regular fa-address-card"></i> ${escapeHtml(it.contact)}</p>
      </div>
      <span class="resolved-time"><i class="fa-regular fa-clock"></i> ${new Date(it.createdAt).toLocaleDateString()}</span>
    `;
    return row;
  }

  function buildFoundCard(it) {
    const card = document.createElement("article");
    card.className = "item glass-card";
    card.innerHTML = `
      ${it.image ? `<img src="${it.image}" class="thumb" alt="${escapeHtml(it.title)}" />` : `<div class="thumb placeholder"><i class="fa-regular fa-image"></i></div>`}
      <div class="item-content">
        <span class="badge found">FOUND</span>
        <h4>${escapeHtml(it.title)}</h4>
        <p class="description">${escapeHtml(it.description || "No additional details provided.")}</p>
        <div class="meta">
          <span><i class="fa-regular fa-clock"></i> ${new Date(it.createdAt).toLocaleString()}</span>
          <span><i class="fa-regular fa-address-card"></i> ${escapeHtml(it.contact)}</span>
        </div>
        <div class="card-actions">
          <button data-id="${it.id}" class="resolve-btn">
            <i class="fa-solid fa-circle-check"></i> Found My Item
          </button>
          <button data-id="${it.id}" class="delete-btn">Delete</button>
        </div>
      </div>
    `;
    return card;
  }

  // DELETE HANDLER
  async function handleCardActions(e) {
      const deleteBtn = e.target.closest(".delete-btn");
      const resolveBtn = e.target.closest(".resolve-btn");

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (!confirm("Delete this item?")) return;
        try {
          const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
          if (res.ok) fetchItems();
        } catch (err) {
          console.error("Delete failed", err);
        }
      }

      if (resolveBtn) {
        const id = resolveBtn.dataset.id;
        if (!confirm("Mark this item as resolved?")) return;
        try {
          const res = await fetch(`/api/items/${id}/resolve`, { method: "POST" });
          if (res.ok) {
            fetchItems();
          } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || "Unable to mark as resolved.");
          }
        } catch (err) {
          console.error("Resolve failed", err);
        }
      }
  }

  if (itemsList) {
    itemsList.addEventListener("click", handleCardActions);
  }
  if (foundItemsList) {
    foundItemsList.addEventListener("click", handleCardActions);
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
        if (res.ok) {
          form.reset();
          closeModal();
          fetchItems();
        }
      } catch (err) {
        console.error("Save error:", err);
      }
    });
  }

  function openModal() {
    if (!itemModal) return;
    itemModal.classList.remove("hidden");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    if (!itemModal) return;
    itemModal.classList.add("hidden");
    document.body.classList.remove("no-scroll");
  }

  openModalBtn?.addEventListener("click", openModal);
  closeModalBtn?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", closeModal);

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
