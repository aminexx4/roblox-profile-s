import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS to allow frontend requests
app.use(cors());

// Route to fetch Roblox player profile
app.get('/fetch-profile', async (req, res) => {
    const username = req.query.username;
    
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        // Get userId from username
        const userIdResponse = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
        });

        const userIdData = await userIdResponse.json();
        const userId = userIdData.data?.[0]?.id;

        if (!userId) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch user profile data
        const profileResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
        const profileData = await profileResponse.json();

        // Fetch avatar
        const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
        const avatarData = await avatarResponse.json();
        const avatarUrl = avatarData.data?.[0]?.imageUrl || null;

        res.json({
            username: profileData.name,
            displayName: profileData.displayName,
            description: profileData.description || "No description available",
            avatarUrl: avatarUrl
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
