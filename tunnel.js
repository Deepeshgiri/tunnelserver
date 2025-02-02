// api/tunnel.js

import axios from 'axios';

let userServices = {}; // In-memory store for user services (could be a database in production)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Registration: User registers their service
    const { userId, exposedPort, localIp, tunnelId } = req.body;

    // Validate required fields
    if (!userId || !exposedPort || !localIp || !tunnelId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Register the service by storing its details
    userServices[tunnelId] = {
      userId,
      exposedPort,
      localIp,
    };

    console.log(`Registered service for ${userId} on tunnel ${tunnelId} at port ${exposedPort}`);

    // Respond with success
    res.status(200).json({ message: 'Service registered successfully' });
  } else if (req.method === 'GET') {
    // Forward request to local service based on tunnelId
    const { tunnelId } = req.query;

    // Check if the user service exists for this tunnelId
    if (!userServices[tunnelId]) {
      return res.status(404).json({ message: 'Tunnel not found' });
    }

    // Get the user’s exposed port and local IP
    const { exposedPort, localIp } = userServices[tunnelId];

    try {
      // Forward the request to the user's local system (using localhost and exposed port)
      const response = await axios({
        method: req.method,
        url: `http://${localIp}:${exposedPort}${req.url}`,
        headers: req.headers,
        data: req.body,
      });

      // Send the response back to the client
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Error forwarding request:', error);
      res.status(500).json({ message: 'Error forwarding request' });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ message: 'Method not allowed' });
  }
}
