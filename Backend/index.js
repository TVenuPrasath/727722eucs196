const http = require('http');

const BASE_URL = 'http://20.244.56.144/test';
const AUTH_URL = 'http://20.244.56.144/test/auth';


const AUTH_PAYLOAD = JSON.stringify({
    companyName: "SKCET",
    clientID: "9345ecdd-df61-4c48-a517-9f26abcab344",
    clientSecret: "CXhjDxtwdFUBGeti",
    ownerName: "Venu Prasath",
    ownerEmail: "727722eucs196@skcet.ac.in",
    rollno: "727722eucs196"
});
let ACCESS_TOKEN = null; // Store the latest token

async function getAccessToken() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(AUTH_URL, options, (res) => {
            let data = '';

            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    ACCESS_TOKEN = response.access_token;
                    console.log("New Token:", ACCESS_TOKEN);
                    resolve(ACCESS_TOKEN);
                } catch (err) {
                    reject("Failed to parse token response");
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.write(AUTH_PAYLOAD);
        req.end();
    });
}

async function fetchJSON(url) {
    await getAccessToken();
    const options = {
        headers: { 
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        http.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => { 
                try {
                    console.log(`Response from ${url}:`, data); // Debugging
                    resolve(JSON.parse(data)); 
                } catch (error) {
                    reject(`Failed to parse JSON from ${url}`);
                }
            });
        }).on('error', (err) => { 
            console.error(`Request Error for ${url}:`, err);
            reject(err);
        });
    });
}

async function getTopUsers(response) {
    try {
        const data = await fetchJSON(`${BASE_URL}/users`); // Now this works correctly
        if (!data) throw new Error('No data received');

        const userPostCounts = {};
        console.log("Data:", data);
        const userIds = Object.keys(data.users);

        for (const userId of userIds) {
            try {
                const postsData = await fetchJSON(`${BASE_URL}/users/${userId}/posts`);
                userPostCounts[userId] = postsData.posts.length;
            } catch (error) {
                console.error(`Error fetching posts for user ${userId}:`, error);
                userPostCounts[userId] = 0; // Default to 0 if request fails
            }
        }

        let userEntries = Object.entries(userPostCounts);
        userEntries.sort((a, b) => b[1] - a[1]);
        let topUsersData = userEntries.slice(0, 5);
        let topUsers = topUsersData.map(([id, count]) => ({ id, name: data.users[id], postCount: count }));

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(topUsers));
    } catch (error) {
        console.error('Error in getTopUsers:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Failed to fetch top users' }));
    }
}

async function getPosts(response, type) {
    try {
        const data = await fetchJSON(`${BASE_URL}/users`);
        if (!data) throw new Error('No data received');

        const userIds = Object.keys(data.users);
        let allPosts = [];

        // Fetch all user posts concurrently
        const postFetchPromises = userIds.map(async (userId) => {
            try {
                const postsData = await fetchJSON(`${BASE_URL}/users/${userId}/posts`);
                return postsData.posts;
            } catch (error) {
                console.error(`Error fetching posts for user ${userId}:`, error);
                return [];
            }
        });

        // Wait for all post requests to complete
        const allUserPosts = await Promise.all(postFetchPromises);
        allPosts = allUserPosts.flat(); // Flatten array of arrays

        if (type === 'latest') {
            allPosts.sort((a, b) => b.id - a.id);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(allPosts.slice(0, 5)));
        } else {
            let commentCountMap = {};

            // Fetch comment counts concurrently
            const commentFetchPromises = allPosts.map(async (post) => {
                try {
                    const commentsData = await fetchJSON(`${BASE_URL}/posts/${post.id}/comments`);
                    return { postId: post.id, count: commentsData.comments.length };
                } catch (error) {
                    console.error(`Error fetching comments for post ${post.id}:`, error);
                    return { postId: post.id, count: 0 };
                }
            });

            const commentCounts = await Promise.all(commentFetchPromises);

            // Build comment count map
            commentCounts.forEach(({ postId, count }) => {
                commentCountMap[postId] = count;
            });

            // Find most commented posts
            const maxComments = Math.max(...Object.values(commentCountMap));
            const popularPosts = allPosts.filter(p => commentCountMap[p.id] === maxComments);

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(popularPosts));
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Failed to fetch users' }));
    }
}

// Function to set CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all domains
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
}

const server = http.createServer((req, res) => {
    setCorsHeaders(res);
    if (req.method === 'GET') {
        if (req.url === '/users') {          
            getTopUsers(res);
        } else if (req.url.startsWith('/posts')) {
            const urlParams = new URL(req.url, `http://${req.headers.host}`);
            const type = urlParams.searchParams.get('type');
            if (type === 'latest' || type === 'popular') {
                getPosts(res, type);
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid type parameter' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
