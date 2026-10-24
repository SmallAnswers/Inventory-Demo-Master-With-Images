const API_URL =
  "https://script.google.com/macros/s/AKfycbxxaf_a6UciSY1J-Q1iPH9iwZshM1bmoRTEvXvVAsjFQvyCypnj6Knb-5yEadz7dQHO/exec";


let globalInventory = [];
let globalLogs = [];


// =====================================================
// LOAD DASHBOARD DATA
// =====================================================

async function loadData() {

  try {

    /*
      Cache-buster ensures the dashboard asks
      Apps Script for fresh inventory + logs.
    */

    const url =
      `${API_URL}?cacheBust=${Date.now()}`;


    const res =
      await fetch(
        url,
        {
          cache: "no-store"
        }
      );


    const data =
      await res.json();


    if (
      data.success === false
    ) {

      throw new Error(
        data.error ||
        "Could not load data."
      );

    }


    globalInventory =
      data.inventory || [];


    globalLogs =
      data.logs || [];


    populateCategories();


    renderInventory(
      globalInventory
    );


    renderLogs(
      globalLogs
    );


  } catch (err) {

    console.error(
      err
    );


    alert(
      "Cannot load dashboard data."
    );

  }

}


// =====================================================
// CATEGORY FILTER
// =====================================================

function populateCategories() {

  const select =
    document.getElementById(
      "categoryFilter"
    );


  if (!select) {

    return;

  }


  const currentValue =
    select.value;


  select.innerHTML =
    `<option value="">All Categories</option>`;


  const categories =

    [
      ...new Set(

        globalInventory
          .map(
            item =>
              String(
                item.category || ""
              ).trim()
          )
          .filter(
            Boolean
          )

      )
    ]
    .sort();


  categories.forEach(
    category => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        category;


      option.textContent =
        category;


      select.appendChild(
        option
      );

    }
  );


  if (
    categories.includes(
      currentValue
    )
  ) {

    select.value =
      currentValue;

  }

}


// =====================================================
// FILTER INVENTORY
// =====================================================

function filterItems() {

  const select =
    document.getElementById(
      "categoryFilter"
    );


  if (!select) {

    return;

  }


  const category =
    select.value;


  let list =
    globalInventory;


  if (category) {

    list =
      list.filter(
        item =>
          item.category ===
          category
      );

  }


  renderInventory(
    list
  );

}


// =====================================================
// GOOGLE DRIVE IMAGE URL
// =====================================================

function getDriveImageUrl(
  url
) {

  if (!url) {

    return "";

  }


  const text =
    String(
      url
    ).trim();


  /*
    Base64 image from Google Sheets
    Insert → Image in cell.
  */

  if (
    text.startsWith(
      "data:image/"
    )
  ) {

    return text;

  }


  /*
    Standard Google Drive sharing URL.
  */

  const fileMatch =
    text.match(
      /\/file\/d\/([^/]+)/
    );


  if (
    fileMatch &&
    fileMatch[1]
  ) {

    return (
      "https://drive.google.com/thumbnail?id=" +
      fileMatch[1] +
      "&sz=w400"
    );

  }


  /*
    Google Drive ?id=FILE_ID format.
  */

  const idMatch =
    text.match(
      /[?&]id=([^&]+)/
    );


  if (
    idMatch &&
    idMatch[1]
  ) {

    return (
      "https://drive.google.com/thumbnail?id=" +
      idMatch[1] +
      "&sz=w400"
    );

  }


  /*
    Any other direct image URL.
  */

  return text;

}


// =====================================================
// RENDER INVENTORY
// =====================================================

function renderInventory(
  list
) {

  const container =
    document.getElementById(
      "inventoryList"
    );


  if (!container) {

    return;

  }


  container.innerHTML =
    "";


  if (
    !list.length
  ) {

    container.textContent =
      "No inventory items found.";

    return;

  }


  list.forEach(
    item => {

      const qty =
        Number(
          item.qty
        ) || 0;


      const div =
        document.createElement(
          "div"
        );


      div.className =
        "item";


      if (
        qty <= 3
      ) {

        div.classList.add(
          "low"
        );

      }


      const imageUrl =
        getDriveImageUrl(
          item.image
        );


      /*
        Only add an image if this dashboard's
        CSS/layout supports it.
      */

      if (imageUrl) {

        const img =
          document.createElement(
            "img"
          );


        img.src =
          imageUrl;


        img.alt =
          item.name || "Inventory item";


        img.style.width =
          "55px";


        img.style.height =
          "55px";


        img.style.objectFit =
          "cover";


        img.style.borderRadius =
          "8px";


        img.style.marginRight =
          "10px";


        img.style.verticalAlign =
          "middle";


        div.appendChild(
          img
        );

      }


      const text =
        document.createElement(
          "span"
        );


      text.textContent =

        `${item.name}` +

        (
          item.category
            ? ` (${item.category})`
            : ""
        )

        +

        ` — ${qty}`;


      div.appendChild(
        text
      );


      container.appendChild(
        div
      );

    }
  );

}


// =====================================================
// RENDER RECENT ACTIVITY
// =====================================================

function renderLogs(
  logs
) {

  const list =
    document.getElementById(
      "logList"
    );


  if (!list) {

    return;

  }


  list.innerHTML =
    "";


  if (
    !logs.length
  ) {

    const li =
      document.createElement(
        "li"
      );


    li.textContent =
      "No recent activity.";


    list.appendChild(
      li
    );


    return;

  }


  /*
    IMPORTANT:

    Code.gs already sends Logs NEWEST FIRST.

    Therefore we take the FIRST 10.

    Do NOT use:
    logs.slice(-10).reverse()
  */

  logs
    .slice(
      0,
      10
    )
    .forEach(
      log => {

        const li =
          document.createElement(
            "li"
          );


        const orderText =
          log.orderId
            ? ` [${log.orderId}]`
            : "";


        const activityText =
          log.activity
            ? ` — ${log.activity}`
            : "";


        const timeText =
          log.time
            ? `${log.time} — `
            : "";


        li.textContent =

          `${timeText}` +

          `${log.name} ` +

          `${log.action} ` +

          `${log.qty} ` +

          `${log.item}` +

          `${orderText}` +

          `${activityText}`;


        list.appendChild(
          li
        );

      }
    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

window.addEventListener(
  "load",
  loadData
);


// =====================================================
// REFRESH IF BROWSER RESTORES OLD DASHBOARD FROM CACHE
// =====================================================

window.addEventListener(
  "pageshow",
  event => {

    if (
      event.persisted
    ) {

      loadData();

    }

  }
);
