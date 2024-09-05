import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "capstone",
  password: "Prem@3813",
  port: 5432,
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Sorting logic based on query parameters
app.get("/", async (req, res) => {
  const { sort } = req.query; // Getting the 'sort' query parameter
  let query = "SELECT * FROM books";
  
  if (sort === "rating") {
    query += " ORDER BY rating DESC"; // Sort by rating descending
  } else if (sort === "newest") {
    query += " ORDER BY published_date DESC"; // Sort by published date descending
  }

  try {
    const result = await db.query(query);
    const books = result.rows;
    res.render("index.ejs", { books: books });
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send a server error response if something goes wrong
  }
});

app.post("/notes/:id", async (req, res) => {
  try {
    const book_id = req.params.id;
    const result = await db.query("SELECT * FROM books WHERE id = $1", [book_id]);
    const books = result.rows[0];
    res.render("notes.ejs", { books: books });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/add", async (req, res) => {
  res.render("add.ejs");
});

app.post("/add", async (req, res) => {
  const { title, ISBN, description, notes, published_date, rating } = req.body;

  try {
    await db.query(
      "INSERT INTO books (title, description, isbn, notes, published_date, rating) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, description, ISBN, notes, published_date, rating]
    );
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
