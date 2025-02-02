// api/register.js (Vercel backend code)

import axios from 'axios';

let userServices = null; // Store the one user's services data

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Registering the service with the Vercel app
    const { exposedPort, localIp, tunnelId } = req.body;

    // Validate input
    if (!exposedPort || !localIp || !tunnelId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Register the user's service (since we're supporting only one user for now, this is simple)
    if (!userServices) {
      userServices = {};
    }

    // Add the new service to the list
    userServices[tunnelId] = { exposedPort, localIp };

    console.log(`Registered service on ${localIp}:${exposedPort} with tunnelId ${tunnelId}`);

    // Respond to confirm the registration
    return res.status(200).json({ message: 'Service registered successfully' });
  } else if (req.method === 'GET') {
    // If no services are registered, return an error
    if (!userServices) {
      return res.status(404).json({ message: 'No registered service found' });
    }

    const { tunnelId } = req.query;

    // Check if the tunnelId exists
    if (!userServices[tunnelId]) {
      return res.status(404).json({ message: 'Service not found for this tunnelId' });
    }

    // Get the service details based on the tunnelId
    const { exposedPort, localIp } = userServices[tunnelId];

    try {
      // Forward the request to the user's local system (localhost and the exposed port)
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
    // Handle unsupported HTTP methods
    res.status(405).json({ message: 'Method not allowed' });
  }
}
