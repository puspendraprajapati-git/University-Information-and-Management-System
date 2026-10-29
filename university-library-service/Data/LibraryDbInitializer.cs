using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniversityLibraryService.Models;

namespace UniversityLibraryService.Data
{
    /// <summary>
    /// Verifies MySQL database tables existence and populates initial academic library holdings.
    /// </summary>
    public static class LibraryDbInitializer
    {
        public static void Initialize(LibraryDbContext context, ILogger logger)
        {
            try
            {
                // Ensure SQL tables exist with foreign keys and indexes
                string[] tableQueries = new[]
                {
                    @"CREATE TABLE IF NOT EXISTS books (
                        book_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        isbn VARCHAR(50) NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        author VARCHAR(150) NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        publisher VARCHAR(150),
                        publication_year INT,
                        description TEXT,
                        cover_image_url VARCHAR(500),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB;",

                    @"CREATE TABLE IF NOT EXISTS book_copies (
                        copy_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        book_id BIGINT NOT NULL,
                        accession_no VARCHAR(100) NOT NULL UNIQUE,
                        status VARCHAR(50) DEFAULT 'AVAILABLE',
                        rack_location VARCHAR(100),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
                    ) ENGINE=InnoDB;",

                    @"CREATE TABLE IF NOT EXISTS book_loans (
                        loan_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        copy_id BIGINT NOT NULL,
                        student_id BIGINT NOT NULL,
                        issued_at DATETIME NOT NULL,
                        due_at DATETIME NOT NULL,
                        returned_at DATETIME NULL,
                        status VARCHAR(30) DEFAULT 'ACTIVE',
                        remarks TEXT,
                        FOREIGN KEY (copy_id) REFERENCES book_copies(copy_id) ON DELETE RESTRICT
                    ) ENGINE=InnoDB;",

                    @"CREATE TABLE IF NOT EXISTS library_reservations (
                        reservation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        book_id BIGINT NOT NULL,
                        student_id BIGINT NOT NULL,
                        reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        status VARCHAR(30) DEFAULT 'PENDING',
                        expires_at DATETIME NULL,
                        notes TEXT,
                        FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
                    ) ENGINE=InnoDB;",

                    @"CREATE TABLE IF NOT EXISTS library_fines (
                        fine_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        loan_id BIGINT NOT NULL,
                        amount DECIMAL(10, 2) NOT NULL,
                        status VARCHAR(30) DEFAULT 'UNPAID',
                        paid_at DATETIME NULL,
                        fine_reason VARCHAR(255),
                        payment_ref VARCHAR(100),
                        FOREIGN KEY (loan_id) REFERENCES book_loans(loan_id) ON DELETE CASCADE
                    ) ENGINE=InnoDB;"
                };

                foreach (var sql in tableQueries)
                {
                    context.Database.ExecuteSqlRaw(sql);
                }

                logger.LogInformation("Library database tables verified and created successfully in university_db.");

                // Seed catalog books if table is empty
                if (!context.Books.Any())
                {
                    logger.LogInformation("Seeding initial academic library book holdings and physical copies...");

                    var seedBooks = new List<Book>
                    {
                        new Book
                        {
                            Isbn = "978-0132350884",
                            Title = "Clean Code: A Handbook of Agile Software Craftsmanship",
                            Author = "Robert C. Martin",
                            Category = "Software Engineering",
                            Publisher = "Prentice Hall",
                            PublicationYear = 2008,
                            Description = "A must-read handbook on writing clean, readable, and maintainable object-oriented code.",
                            CoverImageUrl = "https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg",
                            CreatedAt = DateTime.UtcNow
                        },
                        new Book
                        {
                            Isbn = "978-0262033848",
                            Title = "Introduction to Algorithms (CLRS 3rd Edition)",
                            Author = "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
                            Category = "Algorithms & Data Structures",
                            Publisher = "MIT Press",
                            PublicationYear = 2009,
                            Description = "Comprehensive introduction to the modern study of computer algorithms with mathematical rigor.",
                            CoverImageUrl = "https://images-na.ssl-images-amazon.com/images/I/61Pgdn8Ys-L._SX382_BO1,204,203,200_.jpg",
                            CreatedAt = DateTime.UtcNow
                        },
                        new Book
                        {
                            Isbn = "978-0134685991",
                            Title = "Effective Java (3rd Edition)",
                            Author = "Joshua Bloch",
                            Category = "Programming Languages",
                            Publisher = "Addison-Wesley Professional",
                            PublicationYear = 2018,
                            Description = "Definitive guide to best practices in the Java programming language, concurrency, and OOP design.",
                            CoverImageUrl = "https://images-na.ssl-images-amazon.com/images/I/51r2n3c7EaL._SX380_BO1,204,203,200_.jpg",
                            CreatedAt = DateTime.UtcNow
                        },
                        new Book
                        {
                            Isbn = "978-1118063330",
                            Title = "Operating System Concepts (10th Edition)",
                            Author = "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
                            Category = "Computer Systems",
                            Publisher = "Wiley",
                            PublicationYear = 2018,
                            Description = "Foundational concepts in operating systems, process scheduling, memory virtualization, and file systems.",
                            CoverImageUrl = "https://images-na.ssl-images-amazon.com/images/I/41-U+sCqN4L._SX397_BO1,204,203,200_.jpg",
                            CreatedAt = DateTime.UtcNow
                        },
                        new Book
                        {
                            Isbn = "978-0133594140",
                            Title = "Computer Networking: A Top-Down Approach (7th Edition)",
                            Author = "James F. Kurose, Keith W. Ross",
                            Category = "Networking",
                            Publisher = "Pearson",
                            PublicationYear = 2016,
                            Description = "A layered top-down approach focusing on the Internet and modern computer networking protocols.",
                            CoverImageUrl = "https://images-na.ssl-images-amazon.com/images/I/51Yk+wYyZ8L._SX382_BO1,204,203,200_.jpg",
                            CreatedAt = DateTime.UtcNow
                        },
                        new Book
                        {
                            Isbn = "978-0078022159",
                            Title = "Database System Concepts (7th Edition)",
                            Author = "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
                            Category = "Database Systems",
                            Publisher = "McGraw-Hill Education",
                            PublicationYear = 2019,
                            Description = "Fundamental concepts of database management, relational algebra, SQL optimization, and transaction recovery.",
                            CoverImageUrl = "https://images-na.ssl-images-amazon.com/images/I/51H1yvRKnYL._SX404_BO1,204,203,200_.jpg",
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    context.Books.AddRange(seedBooks);
                    context.SaveChanges();

                    // Generate physical copies with barcode/accession numbers for each book
                    foreach (var book in seedBooks)
                    {
                        for (int copyNum = 1; copyNum <= 3; copyNum++)
                        {
                            context.BookCopies.Add(new BookCopy
                            {
                                BookId = book.BookId,
                                AccessionNo = $"ACC-{book.BookId:D3}-{copyNum:D2}",
                                Status = "AVAILABLE",
                                RackLocation = $"Section B, Shelf {book.BookId % 5 + 1}",
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }
                    context.SaveChanges();

                    logger.LogInformation("Successfully seeded 6 books with 18 physical copies into the library catalog.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error initializing library database tables in university_db.");
            }
        }
    }
}
