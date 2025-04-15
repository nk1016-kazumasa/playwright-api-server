const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.post('/run', async (req, res) => {
  const { url, actions, return: returnType } = req.body;

  if (!url) return res.status(400).send('Missing URL');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  if (actions && Array.isArray(actions)) {
    for (const action of actions) {
      const { type, selector, value } = action;
      if (type === 'click') await page.click(selector);
      if (type === 'type') await page.fill(selector, value);
      if (type === 'waitForSelector') await page.waitForSelector(selector);
    }
  }

  let result;
  if (returnType === 'screenshot') {
    const buffer = await page.screenshot();
    result = buffer.toString('base64');
    res.type('text/plain').send(result);
  } else {
    const content = await page.content();
    res.send(content);
  }

  await browser.close();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
