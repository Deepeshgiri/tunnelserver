import axios from 'axios';

// Store for local services (you can expand this for more users or services)
let localServices = [];

// Vercel handler for registration and forwarding requests
export default async function handler(req, res) {
  if (req.method === 'POST' && req.url === '/api/register') {
    // Registering a local service (Apache, React, Angular)
    const { tunnelId, localIp, exposedPort } = req.body;

    // Validate the data
    if (!tunnelId || !localIp || !exposedPort) {
      return res.status(400).json({ message: 'Missing required fields (tunnelId, localIp, exposedPort)' });
    }

    // Register the service
    localServices.push({ tunnelId, localIp, exposedPort });
    console.log(`Service registered: ${tunnelId} -> ${localIp}:${exposedPort}`);

    return res.status(200).json({ message: 'Service registered successfully' });
  }

  if (req.method === 'GET' && req.url.startsWith('/api/proxy/')) {
    // Proxying requests from Vercel to local services
    const tunnelId = req.url.split('/')[3]; // Extract tunnelId from URL

    // Find the service based on tunnelId
    const service = localServices.find(s => s.tunnelId === tunnelId);

    if (!service) {
      return res.status(404).json({ message: 'Service not found for this tunnelId' });
    }

    // Forward the request to the corresponding local service
    try {
      const response = await axios({
        method: req.method,
        url: `http://${service.localIp}:${service.exposedPort}${req.url}`,
        headers: req.headers,
        data: req.body,
      });

      // Send the response from the local service back to the user
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Error forwarding request:', error);
      res.status(500).json({ message: 'Error forwarding request' });
    }
  }

  else {
    // Return 405 if method is not allowed
    res.status(405).json({ message: 'Method not allowed' });
  }
}
