<p align="center">
  <a href="https://soundwavee.vercel.app" target="blank"><img src="https://i.ibb.co/gj9CVB2/favicon.png" width="160" alt="SOUNDWAVE" /></a>
</p>

## P2P Video Call with Fastify, and PeerJS
> This is a simple P2P video call website built using Node.js, Fastify, and PeerJS. It allows users to connect with each other and have a video call without the need for a centralized server.

## Getting Started
To get started, clone this repository to your local machine and run the following commands:
```bash
  yarn install
  yarn build
  yarn start
```

## How it Works
This website uses the PeerJS library to establish P2P connections between users. When a user joins the website, a unique peer ID is generated for them. This ID is then used to connect them with other users who have joined the website.

The website uses Fastify as the web server framework to handle HTTP requests and serve static files. The client-side code is written in JavaScript and uses the WebRTC API to enable real-time communication between users.

<img src="https://i.ibb.co/J3rMGH4/Screenshot-from-2023-01-27-10-08-11.png" />
