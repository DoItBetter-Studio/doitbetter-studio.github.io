const linksContainer = document.body;
const content = document.getElementById("content");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

document.querySelectorAll('.dropdown-header').forEach(header => {
  header.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(drop => {
      if (drop !== header.parentElement) drop.classList.remove('open');
    });
    header.parentElement.classList.toggle('open');
  });
});

// Load Markdown content function
async function loadMarkdown(file, scrollToId) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("File not found: " + file);
    let text = await res.text();

    // Override function
    const renderer = {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);

        const slug = slugify(text);
        return `<h${depth} id="${slug}">${text}</h${depth}>`;
      },
    };

    marked.use({ renderer });

    content.innerHTML = marked.parse(text);

    if (scrollToId) {
      const el = document.getElementById(scrollToId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        el.classList.add("highlight");
        setTimeout(() => el.classList.remove("highlight"), 3000);
      }
    }
  } catch (e) {
    content.innerHTML = `<p style="color:#f88;">Error loading document: ${e.message}</p>`;
  }
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
}

// Set active link
function setActiveLink(link) {
  [...linksContainer.querySelectorAll("a")].forEach((l) =>
    l.classList.remove("active")
  );
  if (link) link.classList.add("active");
}

// Clear search results
function clearSearchResults() {
  searchResults.innerHTML = "";
  searchResults.style.display = "none";
}

// Build sidebar links dynamically (optional enhancement)
// Keeping your static links for now for simplicity

// Handle sidebar navigation clicks
linksContainer.addEventListener("click", (e) => {
  if (e.target.tagName !== "A") return;

  if (e.target.hasAttribute("data-file") !== true) return;

  e.preventDefault();
  const file = e.target.getAttribute("data-file");
  setActiveLink(e.target);
  clearSearchResults();
  searchInput.value = "";
  loadMarkdown(file);
});

// Load initial overview
loadMarkdown("DoItBetterStudio.md");

// Fetch and setup Fuse.js search index
let fuse;
let docsIndex = [];

async function setupSearch() {
  try {
    const res = await fetch("doc-index.json");
    if (!res.ok) throw new Error("Failed to load doc-index.json");
    const docs = await res.json();

    // Flatten sections into individual entries
    const flatIndex = [];
    docs.forEach((doc) => {
      doc.sections.forEach((section) => {
        flatIndex.push({
          id: section.id,
          title: section.title,
          content: section.content,
          url: section.url,
          pageTitle: doc.title,
          pageFile: doc.url,
        });
      });
    });

    const options = {
      keys: ["title", "content"],
      includeMatches: true,
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2,
    };

    fuse = new Fuse(flatIndex, options);
  } catch (e) {
    console.error("Search setup error:", e);
  }
}

function renderSearchResults(results) {
  if (!results.length) {
    clearSearchResults();
    return;
  }

  searchResults.innerHTML = "";
  results.forEach((result) => {
    const { title, url, pageTitle, pageFile, id } = result.item;

    const div = document.createElement("div");
    div.textContent = `${pageTitle} → ${title}`;
    div.title = url;
    div.dataset.file = pageFile;
    div.dataset.sectionId = id;
    searchResults.appendChild(div);
  });

  searchResults.style.display = "block";
}

// On search input
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (!query || !fuse) {
    clearSearchResults();
    return;
  }
  const results = fuse.search(query, { limit: 10 });
  renderSearchResults(results);
});

// Handle click on search results
searchResults.addEventListener("click", (e) => {
  if (e.target.dataset.file) {
    const file = e.target.dataset.file;
    const sectionId = e.target.dataset.sectionId || "";
    clearSearchResults();
    searchInput.value = "";

    const sidebarLink = [...linksContainer.querySelectorAll("a")].find(
      (a) => a.getAttribute("data-file") === file
    );
    setActiveLink(sidebarLink);

    loadMarkdown(file, sectionId);
  }
});

// Initialize search index
setupSearch();