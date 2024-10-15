## Play-Me: A collaborative streaming platform

This project is a collaborative music streaming platform built using Next.js, PostgreSQL, Tailwind CSS, Prisma, and Next Auth. It allows creators, such as streamers, to host streaming sessions, share links with fans, and allow them to vote on and add music/videos to the queue. The queue is dynamically reordered based on user votes, and the most voted song plays next.

# Features

- Start Streaming Sessions: Creators can initiate streaming sessions where they control the stream and share it with others.

- YouTube Integration: Videos/songs can be added to the queue directly from YouTube.

- Collaborative Queue: Other users can add songs/videos to the queue once they join a session.

- Voting System: Users can vote on songs in the queue. The queue is reordered, so the highest-voted song plays next.

- Real-time Updates: The queue and votes are updated in real-time to reflect user interactions.

- Session Sharing: Creators can share session links with fans or other users.

- Authentication: Secure login using Next Auth.

# Tech Stack

- Frontend: Next.js, Tailwind CSS
- Backend: Prisma, PostgreSQL, Next Auth
- Real-time Features: WebSockets (Coming Soon!)

# Usage

1. Sign up/Login: Users can sign up or log in through the app.
2. Create a Session: Creators can start a new streaming session.
3. Add to Queue: Creators and participants can add YouTube videos/songs to the queue.
4. Vote on Songs: Users can vote on songs in the queue. The queue will automatically reorder based on the highest votes.
5. Session Sharing: Share the session link with other users to let them participate in adding and voting on the songs.
