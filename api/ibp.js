export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {

  // === CORS ===
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    // Lire le corps brut
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);

    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("boundary=")) {
      return res.status(400).json({ error: "Invalid multipart request" });
    }

    const boundary = contentType.split("boundary=")[1];

    // 🔑 reconstruire le multipart AVEC la clé API
    const apiKey = process.env.IBP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "IBP API key missing on server" });
    }

    const injectedBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\n` +
        `Content-Disposition: form-data; name="key"\r\n\r\n` +
        `${apiKey}\r\n`),
      rawBody
    ]);

    const ibpResponse = await fetch("https://www.ibpindex.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`
      },
      body: injectedBody
    });

    const text = await ibpResponse.text();
    res.status(200).send(text);

  } catch (err) {
    console.error("IBP proxy error:", err);
    res.status(500).json({ error: "IBP proxy failed" });
  }
}

