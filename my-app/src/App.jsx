import { useEffect, useState } from "react";

const initialBooks = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", status: "available", borrower: "" },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", status: "borrowed", borrower: "Ravi" },
  { id: 3, title: "A Brief History of Time", author: "Stephen Hawking", status: "available", borrower: "" },
];

const coverColors = [
  ["#2f5d46", "#5b9a78"],
  ["#8a4b2a", "#c9854f"],
  ["#2d4a7a", "#5f87c4"],
  ["#6b2f5c", "#b0689c"],
  ["#7a6a1f", "#c4b04a"],
  ["#334155", "#64748b"],
];

const STORAGE_KEY = "online-library-books";

function loadBooks() {
  try {
    const savedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedBooks) ? savedBooks : initialBooks;
  } catch {
    return initialBooks;
  }
}

function App() {
  const [books, setBooks] = useState(loadBooks);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [editId, setEditId] = useState(null);
  const [borrowId, setBorrowId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const total = books.length;
  const available = books.filter((b) => b.status === "available").length;
  const borrowed = total - available;

  const q = search.trim().toLowerCase();
  const visibleBooks = books.filter((b) => {
    const matchesQuery =
      !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const matchesFilter = filter === "all" || b.status === filter;
    return matchesQuery && matchesFilter;
  });

  function addBook(e) {
    e.preventDefault();
    const t = title.trim();
    const a = author.trim();
    const pageCount = pages === "" ? null : Number(pages);
    if (!t || !a || (pageCount !== null && (!Number.isSafeInteger(pageCount) || pageCount < 1))) return;
    const details = { title: t, author: a, pages: pageCount };
    if (editId === null) {
      const book = { id: Date.now(), ...details, status: "available", borrower: "" };
      setBooks((current) => [...current, book]);
    } else {
      setBooks((current) => current.map((book) =>
        book.id === editId ? { ...book, ...details } : book
      ));
    }
    resetForm();
  }

  function borrowBook(event, id) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const borrower = form.get("borrower").trim();
    const phone = form.get("phone").trim();
    const email = form.get("email").trim();
    if (!borrower || !phone || !email) return;
    setBooks((current) => current.map((book) =>
      book.id === id && book.status === "available"
        ? { ...book, status: "borrowed", borrower, phone, email }
        : book
    ));
    setBorrowId(null);
  }

  function returnBook(id) {
    setBooks(
      books.map((b) =>
        b.id === id ? { ...b, status: "available", borrower: "", phone: "", email: "" } : b
      )
    );
  }

  function editBook(book) {
    setEditId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setPages(String(book.pages ?? ""));
    document.getElementById("book-title").focus();
  }

  function resetForm() {
    setEditId(null);
    setTitle("");
    setAuthor("");
    setPages("");
  }

  function removeBook(id) {
    const book = books.find((item) => item.id === id);
    if (!book || !confirm(`Delete “${book.title}” from the library?`)) return;
    setBooks(books.filter((b) => b.id !== id));
    if (editId === id) resetForm();
    if (borrowId === id) setBorrowId(null);
  }

  const filters = [
    { key: "all", label: `All (${total})` },
    { key: "available", label: `Available (${available})` },
    { key: "borrowed", label: `Borrowed (${borrowed})` },
  ];

  return (
    <>
      <header className="hero">
        <span className="badge">Library Portal</span>
        <h1>Online Library Management System</h1>
        <p>Search, borrow and return books, all in one place.</p>
      </header>

      <main>
        <div className="stats">
          <div className="stat">
            <div className="icon">📚</div>
            <div>
              <div className="num">{total}</div>
              <div className="label">Total Books</div>
            </div>
          </div>
          <div className="stat">
            <div className="icon">✅</div>
            <div>
              <div className="num">{available}</div>
              <div className="label">Available</div>
            </div>
          </div>
          <div className="stat gold">
            <div className="icon">📖</div>
            <div>
              <div className="num">{borrowed}</div>
              <div className="label">Borrowed</div>
            </div>
          </div>
        </div>

        <section className="panel">
          <h2>{editId === null ? "Add a Book" : "Edit Book"}</h2>
          <form className="add-form" onSubmit={addBook}>
            <input
              id="book-title"
              type="text"
              aria-label="Book title"
              placeholder="Book title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              aria-label="Book author"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
            <input
              type="number"
              aria-label="Number of pages"
              placeholder="Pages (optional)"
              min="1"
              max={Number.MAX_SAFE_INTEGER}
              step="1"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
            />
            <button type="submit">{editId === null ? "+ Add Book" : "Save Changes"}</button>
            {editId !== null && (
              <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
            )}
          </form>
        </section>

        <section className="panel">
          <h2>Library Catalog</h2>

          <div className="toolbar">
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="text"
                aria-label="Search books"
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="chips">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`chip ${filter === f.key ? "active" : ""}`}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {visibleBooks.length === 0 ? (
            <div className="empty">
              <div className="big">🔍</div>
              No books match your search.
            </div>
          ) : (
            <div className="grid">
              {visibleBooks.map((b) => {
                const [c1, c2] = coverColors[b.id % coverColors.length];
                return (
                  <article className="book" key={b.id}>
                    <div
                      className="cover"
                      style={{ background: `linear-gradient(145deg, ${c1}, ${c2})` }}
                    >
                      {b.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="info">
                      <h3>{b.title}</h3>
                      <div className="author">by {b.author}</div>
                      <div className="book-pages">{b.pages == null ? "Page count unknown" : `${b.pages} pages`}</div>
                      <span className={`status ${b.status}`}>
                        {b.status === "available" ? "Available" : "Borrowed"}
                      </span>
                      {borrowId === b.id && (b.status === "borrowed" ? (
                        <div className="borrower" role="status">
                          <div>Already borrowed by {b.borrower}</div>
                          <div>Phone: {b.phone || "Unavailable"}</div>
                          <div>Email: {b.email || "Unavailable"}</div>
                        </div>
                      ) : (
                        <form className="borrow-form" onSubmit={(event) => borrowBook(event, b.id)}>
                          <label>Name<input name="borrower" autoComplete="name" pattern={String.raw`.*\S.*`} title="Enter the borrower's name." required /></label>
                          <label>Phone<input name="phone" type="tel" autoComplete="tel" pattern=".*[0-9].*" title="Enter a phone number with at least one digit." required /></label>
                          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
                          <div className="actions">
                            <button type="submit">Confirm Borrow</button>
                            <button type="button" className="secondary" onClick={() => setBorrowId(null)}>Cancel</button>
                          </div>
                        </form>
                      ))}
                      <div className="actions">
                        <button type="button" aria-expanded={borrowId === b.id}
                          onClick={() => setBorrowId(borrowId === b.id ? null : b.id)}>
                          Borrow
                        </button>
                        {b.status === "borrowed" && (
                          <button type="button" className="secondary" onClick={() => {
                            returnBook(b.id);
                            if (borrowId === b.id) setBorrowId(null);
                          }}>
                            Return
                          </button>
                        )}
                        <button type="button" className="secondary" onClick={() => editBook(b)}>
                          Edit
                        </button>
                        <button type="button" className="danger" onClick={() => removeBook(b.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer>Your library is saved privately in this browser.</footer>
    </>
  );
}

export default App;
