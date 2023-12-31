const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8008;
const TIMEOUT_MS = 500;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/numbers', async (req, res) => {
  const urls = req.query.url;
  if (!urls) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  try {
    const requests = urls.map(async (url) => {
      try {
        const response = await axios.get(url, { timeout: TIMEOUT_MS });
        return response.data.numbers;
      } catch (error) {
      
        return [];
      }
    });

    
    const results = await Promise.allSettled(requests);

   
    const mergedNumbers = results.reduce((acc, result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        acc.push(...result.value);
      }
      return acc;
    }, []);

    
    const uniqueNumbers = [...new Set(mergedNumbers)].sort((a, b) => a - b);

    return res.json({ numbers: uniqueNumbers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`number-management-service is running on port ${PORT}`);
});