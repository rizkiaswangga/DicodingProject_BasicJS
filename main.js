const storedBooks = JSON.parse(localStorage.getItem('bookUpload')) || [];
const storedSessionBooks = JSON.parse(sessionStorage.getItem('bookUpload')) || [];
const bookUpload = [];
const RENDER_EVENT = 'render-book';

// Membaca dari local storage dan session storage:
function loadFromStorage() {
    loadFromLocalStorage();
    loadFromSessionStorage();
}

function loadFromLocalStorage() {
    const storedBooks = JSON.parse(localStorage.getItem('bookUpload')) || [];
    bookUpload.length = 0;
    bookUpload.push(...storedBooks);
}

function loadFromSessionStorage() {
    const storedSessionBooks = JSON.parse(sessionStorage.getItem('bookUpload')) || [];
    bookUpload.push(...storedSessionBooks);
}

// Fungsi yang akan dijalankan saat "Page Load" untuk membaca dari local storage dan session storage
window.addEventListener('load', function () {
    loadFromStorage();
    renderBooks(bookUpload);
});

// Ketika "Page Load" dijalankan:
document.addEventListener('DOMContentLoaded', function () {
    const submitInputBook = document.getElementById('inputBook');
    submitInputBook.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        saveToLocalStorage();
        saveToSessionStorage();
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    const searchBookForm = document.getElementById('searchBook');
    searchBookForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Mencegah perilaku default pengiriman formulir
        searchBooks();
    });

    // Fungsi untuk menambahkan buku:
    function addBook() {
        // Variabel yang akan digunakan untuk buku
        const title = document.getElementById('inputBookTitle').value;
        const author = document.getElementById('inputBookAuthor').value;
        const year = Number(document.getElementById('inputBookYear').value);
        const isComplete = document.getElementById('inputBookIsComplete').checked;

        const generatedID = generatedId();
        const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
        bookUpload.push(bookObject);
    }

    // Menghasilkan ID unik untuk buku:
    function generatedId() {
        return +new Date();
    }

    // Membuat objek dari sekelompok variabel:
    function generateBookObject(id, title, author, year, isComplete) {
        return {
            id,
            title,
            author,
            year,
            isComplete,
        };
    }

    // Memasukkan buku, apakah sudah dibaca atau belum:
    document.addEventListener(RENDER_EVENT, function () {
        const belumSelesaiDibaca = document.getElementById('incompleteBookshelfList');
        belumSelesaiDibaca.innerHTML = '';

        const telahDibaca = document.getElementById('completeBookshelfList');
        telahDibaca.innerHTML = '';

        for (const bookItem of bookUpload) {
            const bookElement = bookItem.isComplete
                ? makeSelesaiDibaca(bookItem)
                : makeBelumSelesaiDibaca(bookItem);

            if (bookItem.isComplete) {
                telahDibaca.append(bookElement);
            } else {
                belumSelesaiDibaca.append(bookElement);
            }
        }
    });
});

// Membuat rak buku, bagi yang ditandai belum selesai dibaca:
function makeBelumSelesaiDibaca(bookItem) {
    const article = document.createElement('article');
    article.classList.add('book_item');

    const title = document.createElement('h3');
    title.innerText = bookItem.title;

    const author = document.createElement('p');
    author.innerText = 'Penulis: ' + bookItem.author;

    const year = document.createElement('p');
    year.innerText = 'Tahun: ' + bookItem.year;

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    if (!bookItem.isComplete) {
        const selesaiButton = document.createElement('button');
        selesaiButton.classList.add('green');
        selesaiButton.innerText = 'Selesai dibaca';
        selesaiButton.addEventListener('click', function () {
            markBookAsCompleted(bookItem.id);
        });

        actionContainer.appendChild(selesaiButton);
    }

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus buku';
    deleteButton.addEventListener('click', function () {
        deleteBuku(bookItem.id);
    });

    actionContainer.appendChild(deleteButton);
    article.append(title, author, year, actionContainer);

    article.setAttribute('id', `book-${bookItem.id}`);

    return article;
}

// Membuat rak buku, bagi yang ditandai telah selesai dibaca:
function makeSelesaiDibaca(bookItem) {
    const article = document.createElement('article');
    article.classList.add('book_item');

    const title = document.createElement('h3');
    title.innerText = bookItem.title;

    const author = document.createElement('p');
    author.innerText = 'Penulis: ' + bookItem.author;

    const year = document.createElement('p');
    year.innerText = 'Tahun: ' + bookItem.year;

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    const belumSelesaiButton = document.createElement('button');
    belumSelesaiButton.classList.add('green');
    belumSelesaiButton.innerText = 'Belum selesai di Baca';
    belumSelesaiButton.addEventListener('click', function () {
        undoBookFromCompleted(bookItem.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus buku';
    deleteButton.addEventListener('click', function () {
        deleteBuku(bookItem.id);
    });

    actionContainer.append(belumSelesaiButton, deleteButton);
    article.append(title, author, year, actionContainer);

    article.setAttribute('id', `book-${bookItem.id}`);

    return article;
}

// Untuk menghapus buku tertentu dari rak:
function deleteBuku(bookId) {
    const indexToDelete = bookUpload.findIndex((book) => book.id === bookId);

    if (indexToDelete !== -1) {
        bookUpload.splice(indexToDelete, 1);
        saveToLocalStorage();
        saveToSessionStorage();
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

// Untuk menandai buku telah selesai dibaca:
function markBookAsCompleted(bookId) {
    const book = findBookById(bookId);

    if (book) {
        book.isComplete = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

// Mengembalikan buku, dari yang ditandai telah selesai dibaca:
function undoBookFromCompleted(bookId) {
    const book = findBookById(bookId);

    if (book) {
        book.isComplete = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

// Untuk mencari buku di etalase:
function searchBooks() {
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const filteredBooks = bookUpload.filter(book =>
        book.title.toLowerCase().includes(searchTitle)
    );
    renderBooks(filteredBooks);
}

// Untuk menampilkan buku dalam HTML:
function renderBooks(books) {
    const belumSelesaiDibaca = document.getElementById('incompleteBookshelfList');
    belumSelesaiDibaca.innerHTML = '';

    const telahDibaca = document.getElementById('completeBookshelfList');
    telahDibaca.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = bookItem.isComplete
            ? makeSelesaiDibaca(bookItem)
            : makeBelumSelesaiDibaca(bookItem);

        if (bookItem.isComplete) {
            telahDibaca.append(bookElement);
        } else {
            belumSelesaiDibaca.append(bookElement);
        }
    }
}

// Menyimpan ke local storage:
function saveToLocalStorage() {
    console.log('Menyimpan ke localStorage');
    localStorage.setItem('bookUpload', JSON.stringify(bookUpload));
}

// Menyimpan ke session storage:
function saveToSessionStorage() {
    console.log('Menyimpan ke sessionStorage');
    sessionStorage.setItem('bookUpload', JSON.stringify(bookUpload));
}

// Mencari buku berdasarkan ID, dipanggil dari fungsi lain yang memerlukannya:
function findBookById(bookId) {
    return bookUpload.find(book => book.id === bookId);
}
