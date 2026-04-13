// // Frontend JS: uses fetch to talk to REST API at /report-item
// document.addEventListener("DOMContentLoaded", () => {
//   const itemsList = document.getElementById("itemsList");
//   const form = document.getElementById("itemForm");

//   async function fetchItems() {
//     try {
//       const res = await fetch("/api/items"); // ensure this matches app.js mount
//       if (!res.ok)
//         throw new Error("Network response was not ok: " + res.status);
//       const items = await res.json();
//       renderItems(items);
//     } catch (err) {
//       console.error("fetchItems error", err);
//       if (itemsList) itemsList.innerHTML = "<li>Error loading items</li>";
//     }
//   }

//   function renderItems(items) {
//     if (!itemsList) return;
//     itemsList.innerHTML = "";
//     if (!items || items.length === 0) {
//       itemsList.innerHTML = "<li>No items yet.</li>";
//       return;
//     }
//     items.forEach((it) => {
//       const li = document.createElement("li");
//       li.className = "item";
//       li.innerHTML = `
//         <div class="item-left">
//           ${it.image ? `<img src="${it.image}" class="thumb" alt="${escapeHtml(it.title)}" />` : ""}
//         </div>
//         <div class="item-right">
//           <strong>${escapeHtml(it.title)}</strong>
//           <div class="meta">${new Date(it.createdAt).toLocaleString()} - ${escapeHtml(it.contact)}</div>
//           <p>${escapeHtml(it.description)}</p>
//           <button data-id="${it.id}" class="delete-btn">Delete</button>
//         </div>
//       `;
//       itemsList.appendChild(li);
//     });
//   }

//   if (form) {
//     form.addEventListener("submit", async (e) => {
//       e.preventDefault(); // Stops the page from refreshing with query params

//       const formData = new FormData(form);

//       try {
//         const res = await fetch("/api/items", {
//           // Send to the router endpoint
//           method: "POST",
//           body: formData,
//         });

//         if (res.ok) {
//           window.location.href = "/items"; // Redirect to homepage after success
//         }
//       } catch (err) {
//         console.error("Save error:", err);
//       }
//     });
//   }

//   function escapeHtml(str) {
//     if (!str) return "";
//     return str.replace(
//       /[&<>"']/g,
//       (s) =>
//         ({
//           "&": "&amp;",
//           "<": "&lt;",
//           ">": "&gt;",
//           '"': "&quot;",
//           "'": "&#39;",
//         })[s],
//     );
//   }

//   if (itemsList) {
//     itemsList.addEventListener("click", async (e) => {
//       if (e.target.classList.contains("delete-btn")) {
//         const id = e.target.dataset.id;
//         if (!confirm("Delete this item?")) return;

//         try {
//           const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
//           if (res.ok) fetchItems(); // Refresh the list
//         } catch (err) {
//           console.error("Delete failed", err);
//         }
//       }
//     });
//   }

//   // initial load
//   if (itemsList) fetchItems();
// });

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
    if (!itemsList) return;
    itemsList.innerHTML = "";
    if (!items || items.length === 0) {
      itemsList.innerHTML = "<li>No items yet.</li>";
      return;
    }
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "item";
      // FIXED SYNTAX BELOW: Added backticks around the img tag
      li.innerHTML = `
        <div class="item-left">
          ${it.image ? `<img src="${it.image}" class="thumb" alt="${escapeHtml(it.title)}" />` : ""}
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
