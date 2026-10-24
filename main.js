const API_URL = "https://script.google.com/macros/s/AKfycbzH7wQC_n2h135FTLZbr3dTwhR8W3g9WiB-ltA_lfi2qVO9boEmrepOuA4i8l-RASY/exec";

let globalInventory = [];
let globalLogs = [];

async function loadData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    globalInventory = data.inventory || [];
    globalLogs = data.logs || [];

    populateCategories();
    renderInventory(globalInventory);
    renderLogs(globalLogs);

  } catch (err) {
    console.error(err);
    alert("Cannot load data");
  }
}


// ===== CATEGORY FILTER =====

function populateCategories() {
  const select = document.getElementById("categoryFilter");

  select.innerHTML = `<option value="">All Categories</option>`;

  const categories = [
    ...new Set(globalInventory.map(i => i.category))
  ];

  categories.forEach(cat => {
    const opt = document.createElement("option");

    opt.value = cat;
    opt.textContent = cat;

    select.appendChild(opt);
  });
}


function filterItems() {
  const cat = document.getElementById("categoryFilter").value;

  let list = globalInventory;

  if (cat) {
    list = list.filter(i => i.category === cat);
  }

  renderInventory(list);
}


// ===== GOOGLE DRIVE IMAGE CONVERSION =====

function getDriveImageUrl(url) {
  if (!url) return "";

  let fileId = "";

  // Standard Drive link:
  // https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);

  if (fileMatch) {
    fileId = fileMatch[1];
  }

  // Alternative Drive link:
  // https://drive.google.com/open?id=FILE_ID
  if (!fileId) {
    const idMatch = url.match(/[?&]id=([^&]+)/);

    if (idMatch) {
      fileId = idMatch[1];
    }
  }

  if (!fileId) {
    return url;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}


// ===== INVENTORY DISPLAY =====

function renderInventory(list) {
  const el = document.getElementById("inventoryList");

  el.innerHTML = "";

  list.forEach(i => {
    const qty = isNaN(parseInt(i.qty))
      ? 0
      : parseInt(i.qty);

    const div = document.createElement("div");

    div.className = "item";

    if (qty <= 3) {
      div.classList.add("low");
    }

    // Image exists
    if (i.image) {
      const imageUrl = getDriveImageUrl(i.image);

      div.innerHTML = `
        <div style="
          display:flex;
          align-items:center;
          gap:12px;
        ">

          <img
            src="${imageUrl}"
            alt="${i.name}"
            style="
              width:70px;
              height:70px;
              object-fit:cover;
              border-radius:8px;
              border:1px solid #ddd;
              flex-shrink:0;
            "
          >

          <div>
            <strong>${i.name}</strong><br>
            <span>${i.category}</span><br>
            <span>Qty: ${qty}</span>
          </div>

        </div>
      `;
    }

    // No image
    else {
      div.innerHTML =
        `${i.name} (${i.category}) — ${qty}`;
    }

    el.appendChild(div);
  });
}


// ===== RECENT ACTIVITY =====

function renderLogs(logs) {
  const el = document.getElementById("logList");

  el.innerHTML = "";

  logs
    .slice(-10)
    .reverse()
    .forEach(l => {
      const li = document.createElement("li");

      li.textContent =
        `${l.name} ${l.action} ${l.qty} ${l.item}`;

      el.appendChild(li);
    });
}


window.onload = loadData;
