import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";

export async function GET() {
  const html = `
    <html>
      <head><meta charset="utf-8"><title>Insert to DB</title></head>
      <body>
        <h1>POST /api/db/insert</h1>
        <p>This endpoint only accepts <strong>POST</strong>. Use curl or fetch to send JSON.</p>
        <pre>curl -X POST http://localhost:3000/api/db/insert -H "Content-Type: application/json" -d '{"collection":"test","document":{"name":"Alice"}}'</pre>
        <h2>Quick form (submits via fetch)</h2>
        <form id="frm">
          <label>Collection: <input name="collection" value="test"/></label><br/>
          <label>Document (JSON):<br/><textarea name="document" rows="6" cols="60">{"name":"Bob"}</textarea></label><br/>
          <button type="submit">Insert</button>
        </form>
        <pre id="out"></pre>
        <script>
          document.getElementById('frm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const collection = form.collection.value;
            let doc;
            try { doc = JSON.parse(form.document.value); } catch (err) { document.getElementById('out').textContent = 'Invalid JSON'; return }
            const res = await fetch('/api/db/insert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collection, document: doc }) });
            const j = await res.json();
            document.getElementById('out').textContent = JSON.stringify(j, null, 2);
          });
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const collectionName = body.collection || "test";
    const document = body.document ?? body;

    const db = await getDb();
    const result = await db.collection(collectionName).insertOne(document);

    return NextResponse.json({
      insertedId: result.insertedId,
      acknowledged: result.acknowledged,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
