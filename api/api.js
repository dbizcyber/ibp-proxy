import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const form = new FormData();
    form.append("key", process.env.IBP_API_KEY);
    form.append("file", buffer, {
      filename: "trace.gpx",
      contentType: "application/gpx+xml"
    });

    const response = await fetch("https://www.ibpindex.com/api/", {
      method: "POST",
      body: form
    });

    const text = await response.text();
    res.status(200).send(text);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "IBP proxy error" });
  }
}
.done(function(javascript_json){
  exploiterIBP(javascript_json);
});

