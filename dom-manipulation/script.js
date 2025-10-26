(function () {
  // Utility
  function uid() {
    return (
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)
    );
  }
  function now() {
    return Date.now();
  }
  function notify(msg, type = "info") {
    const n = document.getElementById("notification");
    n.innerHTML = `<div class="notification ${
      type === "info" ? "notif-info" : "notif-warn"
    }">${msg}</div>`;
    setTimeout(() => {
      if (n.firstChild) n.removeChild(n.firstChild);
    }, 5000);
  }

  // Default quotes
  const defaultQuotes = [
    {
      id: uid(),
      text: "The only limit to our realization of tomorrow is our doubts of today.",
      category: "inspiration",
      lastModified: now(),
    },
    {
      id: uid(),
      text: "Simplicity is the soul of efficiency.",
      category: "wisdom",
      lastModified: now(),
    },
    {
      id: uid(),
      text: "Code is like humor. When you have to explain it, it’s bad.",
      category: "programming",
      lastModified: now(),
    },
  ];

  let quotes = [];
  const LOCAL_KEY = "dmq_quotes_v1";
  const FILTER_KEY = "dmq_last_filter";
  const LAST_VIEWED_KEY = "dmq_last_viewed";

  let selectedCategory = "all"; // Track current category filter

  // Storage
  function saveQuotes() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
  }
  function loadQuotes() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      quotes = raw ? JSON.parse(raw) : defaultQuotes.slice();
    } catch (e) {
      quotes = defaultQuotes.slice();
    }
  }

  // UI helpers
  function populateCategories() {
    const sel = document.getElementById("categoryFilter");
    const cats = Array.from(
      new Set(quotes.map((q) => q.category).filter(Boolean))
    ).sort();
    sel.innerHTML = '<option value="all">All Categories</option>';
    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });

    // Restore last selected category
    const lastCategory = localStorage.getItem("lastSelectedCategory");
    if (lastCategory) {
      sel.value = lastCategory;
      selectedCategory = lastCategory;
    } else sel.value = "all";
  }

  function displayQuote(q) {
    const d = document.getElementById("quoteDisplay");
    if (!q) {
      d.innerHTML = "<em>No quotes available</em>";
      return;
    }
    d.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = q.text;
    const meta = document.createElement("div");
    meta.style.fontSize = "0.9em";
    meta.style.color = "#555";
    meta.textContent = `Category: ${q.category || "uncategorized"} • id: ${
      q.id
    }`;
    d.appendChild(p);
    d.appendChild(meta);
    sessionStorage.setItem(LAST_VIEWED_KEY, q.id);
  }

  function displayQuotesList(quotes) {
    const filteredQuotes = filterQuotesByCategory(quotes);
    const list = document.getElementById("quoteList");
    list.innerHTML = "";

    if (filteredQuotes.length === 0) {
      list.innerHTML = "<p>No quotes found in this category</p>";
      return;
    }

    filteredQuotes.forEach((q) => {
      const div = document.createElement("div");
      div.style.borderTop = "1px solid #eee";
      div.style.padding = "8px 0";
      const t = document.createElement("div");
      t.textContent = q.text;
      const m = document.createElement("div");
      m.style.fontSize = "0.85em";
      m.style.color = "#666";
      m.textContent = `Category: ${q.category} • id:${q.id}`;
      const btnDelete = document.createElement("button");
      btnDelete.textContent = "Delete";
      btnDelete.style.marginLeft = "8px";
      btnDelete.onclick = () => {
        if (!confirm("Delete this quote?")) return;
        quotes = quotes.filter((x) => x.id !== q.id);
        saveQuotes();
        populateCategories();
        filterQuotes();
        notify("Quote deleted.");
      };
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Edit";
      btnEdit.style.marginLeft = "8px";
      btnEdit.onclick = () => {
        const newText = prompt("Edit quote text:", q.text);
        if (newText !== null) {
          q.text = newText.trim() || q.text;
          q.lastModified = now();
          saveQuotes();
          populateCategories();
          filterQuotes();
          notify("Quote updated.");
        }
      };
      div.appendChild(t);
      div.appendChild(m);
      div.appendChild(btnEdit);
      div.appendChild(btnDelete);
      list.appendChild(div);
    });
  }

  function filterQuotesByCategory(quotes) {
    if (selectedCategory === "all") return quotes;
    return quotes.filter((quote) => quote.category === selectedCategory);
  }

  function updateCategoryFilter() {
    const select = document.getElementById("categoryFilter");
    selectedCategory = select.value;
    localStorage.setItem("lastSelectedCategory", selectedCategory);
    displayQuotesList(filterQuotesByCategory(quotes));
  }

  // Core functions
  function showRandomQuote() {
    const sel = document.getElementById("categoryFilter");
    const cat = sel.value;
    const pool =
      cat === "all" ? quotes.slice() : quotes.filter((q) => q.category === cat);
    if (!pool.length) {
      displayQuote(null);
      return;
    }
    const q = pool[Math.floor(Math.random() * pool.length)];
    displayQuote(q);
  }

  function addQuote(text, category) {
    const t = (text || "").trim();
    const c = (category || "").trim() || "uncategorized";
    if (!t) {
      notify("Quote text is required.", "warn");
      return;
    }
    const q = { id: uid(), text: t, category: c, lastModified: now() };
    quotes.push(q);
    saveQuotes();
    populateCategories();
    filterQuotes();
    notify("Quote added.");
  }

  function createAddQuoteForm() {
    const container = document.getElementById("addQuoteContainer");
    container.innerHTML = "";
    const wrapper = document.createElement("div");
    const inputText = document.createElement("input");
    inputText.type = "text";
    inputText.id = "newQuoteText";
    inputText.placeholder = "Enter a new quote";
    inputText.style.width = "60%";
    const inputCat = document.createElement("input");
    inputCat.type = "text";
    inputCat.id = "newQuoteCategory";
    inputCat.placeholder = "Enter quote category";
    const btn = document.createElement("button");
    btn.textContent = "Add Quote";
    btn.onclick = () => {
      addQuote(inputText.value, inputCat.value);
      inputText.value = "";
      inputCat.value = "";
    };
    wrapper.appendChild(inputText);
    wrapper.appendChild(inputCat);
    wrapper.appendChild(btn);
    container.appendChild(wrapper);
  }

  function filterQuotes() {
    const sel = document.getElementById("categoryFilter");
    const cat = sel.value;
    localStorage.setItem(FILTER_KEY, cat);
    const filtered =
      cat === "all" ? quotes.slice() : quotes.filter((q) => q.category === cat);
    displayQuotesList(filtered);
    // If the currently shown quote doesn't match filter, show a random one from filtered
    const lastViewedId = sessionStorage.getItem(LAST_VIEWED_KEY);
    const lastViewed = quotes.find((q) => q.id === lastViewedId);
    if (!lastViewed || (cat !== "all" && lastViewed.category !== cat))
      showRandomQuote();
  }

  // JSON import/export
  function exportToJson() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // add: wrapper with requested name
  function exportToJsonFile() {
    exportToJson();
  }

  function importFromJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        // merge, avoid duplicate ids
        const existingIds = new Set(quotes.map((q) => q.id));
        imported.forEach((imp) => {
          if (!imp.id) imp.id = uid();
          if (existingIds.has(imp.id)) {
            // keep whichever is newer based on lastModified, else skip
            const local = quotes.find((q) => q.id === imp.id);
            if (
              !local ||
              (imp.lastModified && imp.lastModified > local.lastModified)
            ) {
              quotes = quotes.map((q) =>
                q.id === imp.id
                  ? { ...imp, lastModified: imp.lastModified || now() }
                  : q
              );
            }
          } else {
            quotes.push({
              id: imp.id,
              text: imp.text || "",
              category: imp.category || "uncategorized",
              lastModified: imp.lastModified || now(),
            });
          }
        });
        saveQuotes();
        populateCategories();
        filterQuotes();
        notify("Quotes imported successfully.");
      } catch (err) {
        notify("Failed to import JSON: " + err.message, "warn");
      } finally {
        event.target.value = ""; // reset file input
      }
    };
    reader.readAsText(file);
  }

  // Mock API endpoints
  const API_URL = "https://jsonplaceholder.typicode.com/posts";
  let lastSyncTimestamp = 0;

  // Server interaction functions
  async function fetchFromServer() {
    try {
      const response = await fetch(`${API_URL}?_limit=5`);
      if (!response.ok) throw new Error("Network response was not ok");
      const posts = await response.json();
      return posts.map((post) => ({
        id: `server-${post.id}`,
        text: post.title,
        category: "server",
        lastModified: Date.now(),
      }));
    } catch (error) {
      notify("Server fetch failed: " + error.message, "warn");
      return [];
    }
  }

  async function postToServer(quote) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quote.text,
          body: quote.category,
          userId: 1,
        }),
      });
      if (!response.ok) throw new Error("Post failed");
      return true;
    } catch (error) {
      notify("Failed to post to server: " + error.message, "warn");
      return false;
    }
  }

  // Sync and conflict resolution
  async function syncQuotes() {
    notify("Syncing with server...", "info");
    const serverQuotes = await fetchFromServer();

    if (!serverQuotes.length) return;

    let updates = 0;
    let conflicts = 0;

    serverQuotes.forEach((serverQuote) => {
      const localQuote = quotes.find((q) => q.id === serverQuote.id);

      if (!localQuote) {
        quotes.push(serverQuote);
        updates++;
      } else if (serverQuote.lastModified > localQuote.lastModified) {
        // Server version is newer
        Object.assign(localQuote, serverQuote);
        conflicts++;
      }
    });

    if (updates || conflicts) {
      saveQuotes();
      notify(`Sync complete. New: ${updates}, Updated: ${conflicts}`);
      displayQuotesList(quotes);
    }

    lastSyncTimestamp = Date.now();
  }

  // Initialize the application
  function init() {
    loadQuotes();
    createAddQuoteForm();
    populateCategories();
    filterQuotes();
    
    // Set up event listeners
    document.getElementById("newQuote").addEventListener("click", showRandomQuote);
    document.getElementById("categoryFilter").addEventListener("change", updateCategoryFilter);
    document.getElementById("syncNow").addEventListener("click", syncQuotes);
    
    // Start periodic sync (every 60 seconds)
    setInterval(syncQuotes, 60000);
    
    // Initial sync
    syncQuotes();
  }

  // Expose functions for debugging (optional)
  window.showRandomQuote = showRandomQuote;
  window.addQuote = (t, c) => addQuote(t, c);
  window.filterQuotes = filterQuotes;
  window.populateCategories = populateCategories;
  window.syncQuotes = syncQuotes;
  // expose import/export by requested names
  window.exportToJsonFile = exportToJsonFile;
  window.importFromJsonFile = importFromJsonFile;

  // start
  document.addEventListener("DOMContentLoaded", init);
})();
