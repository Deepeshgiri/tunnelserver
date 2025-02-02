import axios from 'axios';

// Hardcoded local service details for different services (Apache, React, Angular)
const localServices = {
  'apache': { localIp: 'localhost', exposedPort: 80 },
  'react': { localIp: 'localhost', exposedPort: 3000 },
  'angular': { localIp: 'localhost', exposedPort: 4200 },
};

export default async function handler(req, res) {
  if (req.method === 'GET' || req.method === 'POST') {
    const tunnelId = req.url.split('/')[2]; // Extract the service name (tunnelId)

    // Check if the service exists in the predefined list
    const service = localServices[tunnelId];

    if (!service) {
      return res.status(404).json({ message: `Service not found for tunnelId: ${tunnelId}` });
    }

    // Construct the URL for the local service
    const localUrl = `http://${service.localIp}:${service.exposedPort}${req.url.replace(`/api/proxy/${tunnelId}`, '')}`;

    try {
      // Forward the request to the appropriate local service
      const response = await axios({
        method: req.method,
        url: localUrl,
        headers: req.headers,
        data: req.body,
      });

      // Return the local service's response back to the client
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Error forwarding request:', error);
      res.status(500).json({ message: 'Error forwarding request' });
    }
  } else {
    // Handle unsupported methods (405)
    res.status(405).json({ message: 'Method not allowed' });
  }
}
