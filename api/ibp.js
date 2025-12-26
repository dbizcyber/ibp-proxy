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
    // Lecture brute du multipart (fichier GPX)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyBuffer = Buffer.concat(chunks);

    // Récupération du boundary multipart
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("boundary=")) {
      return res.status(400).json({ error: "Invalid multipart request" });
    }

    const boundary = contentType.split("boundary=")[1];

    // Appel API IBPindex
    const ibpResponse = await fetch("https://www.ibpindex.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`
      },
      body: bodyBuffer
    });

    const text = await ibpResponse.text();

    // IBP renvoie du JSON texte
    res.status(200).send(text);

  } catch (err) {
    console.error("IBP proxy error:", err);
    res.status(500).json({ error: "IBP proxy failed" });
  }
}
