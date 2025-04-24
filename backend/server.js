const express = require('express')
const { v4: uuidv4 } = require('uuid')
const bodyParser = require('body-parser')
const fs = require('fs')

import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.js";

const app = express()

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Servidor en http://localhost:${PORT}`));

app.use(bodyParser.json())
app.use(cors());
app.use(express.json());

app.use("/users", usersRoutes);
