import express from 'express'
import { db } from '../../firebase.js'

const router = express.Router()

/*router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});*/

router.get('/', (req, res) => {
  res.json({ message: 'Lista de usuarios' })
})

router.get('/:id', (req, res) => {
  res.json({ message: `Usuario con ID ${req.params.id}` })
})

export default router
