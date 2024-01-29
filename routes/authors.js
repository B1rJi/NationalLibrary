const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const { findById } = require("../models/book");
const book = require("../models/book");
const Book = require("../models/book")
// All Authors Route
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// New Author Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Create Author Route
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newAuthor = await author.save();
    // res.redirect(`authors/${newAuthor.id}`)
    res.redirect(`authors`);
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});
router.get("/:id", async (req, res) => {
  try{
    const author = await Author.findById(req.params.id)
    const books  = await Book.find({author:author.id}).limit(6).exec()
    res.render('authors/show',{
        author : author ,
        booksByAuthor:books
    })
  }
  catch{
    res.redirect('/')
  }
});
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch {
    res.redirect("/authors");
  }
});
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name 
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error Updating Author",
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
    try {
      // Check if the author has associated books
      const hasBooks = await Book.exists({ author: req.params.id });
  
      if (hasBooks) {
        res.redirect(`/authors/${req.params.id}?error=Author%20still%20has%20books`);
        return;
      }
  
      // If no associated books, proceed with the deletion
      await Author.deleteOne({ _id: req.params.id });
  
      res.redirect('/authors');
    } catch (error) {
      console.error("Error deleting author:", error);
      res.redirect(`/authors/${req.params.id}?error=${encodeURIComponent(error.message)}`);
    }
  });

module.exports = router;
