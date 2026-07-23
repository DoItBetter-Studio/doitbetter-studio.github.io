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
      code({ text, lang }) {
        // 1. Run escaping first so angle brackets don't break the HTML layout
        let html = escapeHtml(text);

        if (lang === 'c' || lang === 'xenoscript') {
          const placeholders = [];

          // 1. Safeguard Comments (Extract and hold)
          html = html.replace(/(\/\/.*)/g, (match) => {
            placeholders.push(`<span style="color:#6a9955; font-style:italic;">${match}</span>`);
            return `___XENO_COMMENT_${placeholders.length - 1}___`;
          });

          // 2. Safeguard System Imports: import <math>; (Extract and hold)
          html = html.replace(/\bimport\s+(&lt;.*?&gt;)/g, (match, library) => {
            placeholders.push(`<span style="color:#569cd6; font-weight:bold;">import</span> <span style="color:#ce9178;">${library}</span>`);
            return `___XENO_SYS_IMP_${placeholders.length - 1}___`;
          });

          // 3. Safeguard Local Project Imports: import "local_integration"; (Extract and hold)
          html = html.replace(/\bimport\s+(?:&quot;|&#34;|["'])(.*?)(?:&quot;|&#34;|["'])/g, (match, path) => {
            placeholders.push(`<span style="color:#569cd6; font-weight:bold;">import</span> <span style="color:#ce9178;">"${path}"</span>`);
            return `___XENO_LOCAL_IMP_${placeholders.length - 1}___`;
          });

          // 4. Color & Safeguard All Remaining String Literals (Extract and hold)
          html = html.replace(/(?:&quot;|&#34;|["'])(.*?)(?:&quot;|&#34;|["'])/g, (match, content) => {
            placeholders.push(`<span style="color:#cece78;">"${content}"</span>`);
            return `___XENO_STR_${placeholders.length - 1}___`;
          });

          // 5. Core Keywords & Statements
          html = html.replace(/\b(class|interface|enum|function|return|if|match|case|break|static|final|new)\b/g,
            '<span style="color:#569cd6; font-weight:bold;">$1</span>');

          // 6. Access Blocks (C++ style scopes)
          html = html.replace(/\b(public:|private:|protected:)\b/g, '<span style="color:#f25c54; font-weight:bold;">$1</span>');

          // 7. Capitalized Class Names / Custom Types (Item, Inventory, MyMod)
          html = html.replace(/\b(?!(?:class|interface|enum|new)\b)([A-Z][a-zA-Z0-9_]*)\b(?!\s*\()/g,
            '<span style="color:#4ec9b0; font-weight:bold;">$1</span>');

          // 8. Mod Engine Metadata Annotations (@Mod)
          html = html.replace(/(@Mod)\b/g, '<span style="color:#ffb703; font-weight:bold;">$1</span>');

          // 9. Primitives
          html = html.replace(/\b(int|string|void|float|boolean)\b/g, '<span style="color:#569cd6;">$1</span>');

          // 10. Digits & Numbers
          html = html.replace(/\b(\d+)\b/g, '<span style="color:#b5cea8;">$1</span>');

          // 11. Native Standard Library Calls
          html = html.replace(/\b(print|Math\.sqrt|Int\.toFloat)\b/g, '<span style="color:#dcdcaa;">$1</span>');

          // 12. Restore all placeholders back into the finalized HTML structure
          for (let i = placeholders.length - 1; i >= 0; i--) {
            html = html.replace(new RegExp(`___XENO_[A-Z_]+_${i}___`, 'g'), () => placeholders[i]);
          }
        }

        return `<div style="text-align: left; width: 100%;">
    <pre style="white-space: pre-wrap; overflow-wrap: break-word; padding: 10px; color: #e2e8f0; font-family: 'Consolas', 'Courier New', monospace;"><code class="language-xenoscript">${html}</code></pre>
  </div>`;
      }
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

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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