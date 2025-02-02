const axios = require('axios');

module.exports = async function handler(req, res) {
  const LOCAL_SERVER_URL = 'http://localhost:3001'; // Local Proxy URL

  try {
    const response = await axios({
      method: req.method,
      url: `${LOCAL_SERVER_URL}${req.url}`, // Forward the full URL path
      headers: req.headers,
      data: req.body,
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.status(500).send('Error forwarding request');
  }
};
