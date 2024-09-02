const http = require('http');
const https = require('https');

const PORT = 8080;

// Function to fetch data from Time.com
function fetchTimeStories() {
    return new Promise((resolve, reject) => {
        https.get('https://time.com/', (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                // Parse the HTML to extract stories
                let stories = [];
                let regex = /<a\s+href="(\/\d+\/[^"]+)"[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>/g;
                let match;

                while ((match = regex.exec(data)) !== null && stories.length < 6) {
                    stories.push({
                        title: match[2].trim(),
                        link: 'https://time.com' + match[1]
                    });
                }

                resolve(stories);
            });

        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/getTimeStories') {
        try {
            const stories = await fetchTimeStories();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stories, null, 4));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error fetching stories');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
