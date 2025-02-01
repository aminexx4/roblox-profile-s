import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/fetch-avatar', async (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ error: "Missing username parameter" });
    }

    try {
        // Step 1: Get userId from username
        const userIdResponse = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
        });

        if (!userIdResponse.ok) {
            throw new Error(`Failed to fetch userId: ${userIdResponse.status}`);
        }

        const userIdData = await userIdResponse.json();
        if (!userIdData.data || userIdData.data.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = userIdData.data[0].id;

        // Step 2: Get avatar URL from userId
        const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);

        if (!avatarResponse.ok) {
            throw new Error(`Failed to fetch avatar: ${avatarResponse.status}`);
        }

        const avatarData = await avatarResponse.json();
        if (!avatarData.data || avatarData.data.length === 0) {
            return res.status(404).json({ error: "Avatar not found" });
        }

        const avatarUrl = avatarData.data[0].imageUrl;

        res.json({ username, avatarUrl });

    } catch (error) {
        console.error("Error fetching avatar:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
