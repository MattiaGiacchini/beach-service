import express from "express";

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => res.send("Express on Vercel"));
app.get("/users", (req, res) => res.json(["a", "b", "v"]));

// ❌ NO uses app.listen(3000)
// ✅ Exporta la app para que Vercel la maneje
export default app;
