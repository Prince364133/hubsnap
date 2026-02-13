const XLSX = require('xlsx');
const path = require('path');

const blogs = [
    {
        title: "Test Blog 1",
        slug: "test-blog-1",
        excerpt: "This is a test blog for import verification.",
        content: "<p>This is the content of the test blog.</p>",
        coverImage: "https://example.com/image.jpg",
        category: "Test Category",
        tags: "test, import",
        authorName: "Test Author",
        readTime: 5,
        keywords: "keyword1, keyword2",
        published: true
    },
    {
        title: "Test Blog 2",
        slug: "test-blog-2",
        excerpt: "Another test blog.",
        content: "<p>More content.</p>",
        coverImage: "",
        category: "Another Category",
        tags: "test2, import2",
        authorName: "Test Author",
        readTime: 3,
        keywords: "keyword3",
        published: false
    }
];

const worksheet = XLSX.utils.json_to_sheet(blogs);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs");

const filePath = path.join(__dirname, 'test_blogs.xlsx');
XLSX.writeFile(workbook, filePath);
console.log(`Test Excel file created at: ${filePath}`);
