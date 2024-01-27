const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const Book = require('../models/book');
const fs = require ('fs')
const uploadPath = path.join('public', Book.coverImageBasePath);
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  }
});

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()  
  if(req.query.title != null && req.query.title!=''){
    query = query.regex('title',new RegExp(req.query.title,'i'))
  }
  if(req.query.publishedBefore != null && req.query.publishedBefore !=''){
    query = query.lte('publishDate',req.query.publishedBefore)
  }
  if(req.query.publishedAfter != null && req.query.publishedAfter !=''){
    query = query.gte('publishDate',req.query.publishedAfter)
  }
  try{
    const books = await query.exec()
    console.log(req.query)
    res.render('books/index',{
      books:books,
      searchOptions: req.query
    })
  }catch{
    res.redirect('/')
  }
  
})

// New books Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
    console.log(req.body)
  const book = new Book({
    title: req.body.title,
    author: req.body.Author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  });

  try {
    const newBook = await book.save();

    res.redirect('/books'); // Correct the redirect path
  } catch (error) {
    // Handle the error
    console.log(error)
    if(book.coverImageName!=null ){
     removeBookCover(book.coverImageName)}
    renderNewPage(res, book, true);
  }
});
function removeBookCover(fileName){
fs.unlink(path.join(uploadPath,fileName), err=>{
    if(err) console.error(err)
    
})
}
async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };

    if (hasError) {
        
      params.errorMessage = 'Error Creating Book';
    }

    res.render('books/new', params);
  } catch {
    res.redirect('/books');
  }
}

module.exports = router;
