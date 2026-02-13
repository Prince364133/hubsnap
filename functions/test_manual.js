process.env.NODE_ENV = 'production';
const next = require('next');

const dev = false;
const dir = __dirname;
const nextConfig = { "distDir": ".next" };

// Minimal config for test to see if next loads
const app = next({
    dev,
    dir,
    conf: nextConfig
});

console.log('Attempting to prepare next app...');
app.prepare().then(() => {
    console.log("Next initialized successfully!");
    process.exit(0);
}).catch(e => {
    console.error("Failed to initialize next:", e);
    process.exit(1);
});
