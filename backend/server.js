const express = require("express");
const {v4: uuidv4} = require("uuid");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(require("cors")());

const readFileAsync = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

const writeFileAsync = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const getAnimals = async (req, res) => {
    try {
        const animals = await readFileAsync("./animals.json");
        res.json(animals.beachservice);
    } catch (error) {
        res.status(500).json({error: "Failed to read animals data"});
    }
};
const getAll = async (req, res) => {
    try {
        const database = await readFileAsync("./database.json");
        res.json(database);
    } catch (error) {
        res.status(500).json({error: "Failed to read the data"});
    }
};

const getAnimalById = async (req, res) => {
    try {
        const animals = await readFileAsync("./animals.json");
        const id = req.params.id;
        const animal = animals.animals.find((animal) => animal.id === id);

        if (!animal) {
            res.status(404).json({message: "Animal not found"});
        } else {
            res.json(animal);
        }
    } catch (error) {
        res.status(500).json({error: "Failed to read animals data"});
    }
};

const addAnimal = async (req, res) => {
    try {
        const animals = await readFileAsync("./animals.json");
        const animal = req.body;
        animal.id = uuidv4();
        animals.animals.push(animal);

        await writeFileAsync("./animals.json", animals);
        res.status(201).json(animals.animals);
    } catch (error) {
        res.status(500).json({error: "Failed to write animals data"});
    }
};

const updateAnimal = async (req, res) => {
    try {
        const animals = await readFileAsync("./animals.json");
        const animalId = req.params.id;
        const updatedAnimal = req.body;

        const index = animals.animals.findIndex((animal) => animal.id === animalId);

        if (index !== -1) {
            animals.animals[index] = {
                ...animals.animals[index],
                ...updatedAnimal,
                id: animalId,
            };

            await writeFileAsync("./animals.json", animals);
            res.json(animals.animals[index]);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        res.status(500).json({error: "Failed to read/write animals data"});
    }
};

const deleteAnimal = async (req, res) => {
    try {
        const animals = await readFileAsync("./animals.json");
        const id = req.params.id;
        const index = animals.animals.findIndex((animal) => animal.id === id);

        if (index !== -1) {
            animals.animals.splice(index, 1);

            await writeFileAsync("./animals.json", animals);
            res.sendStatus(204);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        res.status(500).json({error: "Failed to read/write animals data"});
    }
};

app.get("/api/animals", getAnimals);
app.get("/api/animals/:id", getAnimalById);
app.post("/api/animals", addAnimal);
app.put("/api/animals/:id", updateAnimal);
app.delete("/api/animals/:id", deleteAnimal);

app.get("/api/beachservice", getAll);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
