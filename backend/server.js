const express = require('express')
const { v4: uuidv4 } = require('uuid')
const bodyParser = require('body-parser')
const fs = require('fs')

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(require('cors')())

const readFileAsync = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
}

const writeFileAsync = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const getAnimals = async (req, res) => {
  try {
    const animals = await readFileAsync('./animals.json')
    res.json(animals.beachservice)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read animals data' })
  }
}
const getAll = async (req, res) => {
  try {
    const database = await readFileAsync('./database.json')
    res.json(database)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read the data' })
  }
}

const getPrices = async (req, res) => {
  try {
    const database = await readFileAsync('./animals.json')
    res.json({ data: database.prices })
  } catch (error) {
    res.status(500).json({ error: 'Failed to read the data' })
  }
}

const getVouchers = async (req, res) => {
  try {
    const { limit, sort } = req.query

    const database = await readFileAsync('./animals.json')
    const data = database.beachservice

    const sliceLimit = limit ?? database.beachservice.length

    if (sort === 'asc') {
      data.sort((a, b) => (a.numBs > b.numBs ? 1 : -1));
    } else if (sort === 'desc') {
      data.sort((a, b) => (a.numBs < b.numBs ? 1 : -1));
    }

    res.json({ data: data.slice(-sliceLimit) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to read the data' })
  }
}

const addPrice = async (req, res) => {
  try {
    const database = await readFileAsync('./animals.json')
    const price = req.body
    price.id = uuidv4()
    database.period.push(price)

    await writeFileAsync('./animals.json', database)
    res.status(201).json({ data: database.period })
  } catch (error) {
    res.status(500).json({ error: 'Failed to write animals data' })
  }
}


const getAnimalById = async (req, res) => {
  try {
    const animals = await readFileAsync('./animals.json')
    const id = req.params.id
    const animal = animals.animals.find((animal) => animal.id === id)

    if (!animal) {
      res.status(404).json({ message: 'Animal not found' })
    } else {
      res.json(animal)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read animals data' })
  }
}

const addAnimal = async (req, res) => {
  try {
    const animals = await readFileAsync('./animals.json')
    const animal = req.body
    animal.id = uuidv4()
    animals.animals.push(animal)

    await writeFileAsync('./animals.json', animals)
    res.status(201).json(animals.animals)
  } catch (error) {
    res.status(500).json({ error: 'Failed to write animals data' })
  }
}

const updatePrice = async (req, res) => {
  try {
    const database = await readFileAsync('./animals.json')
    const priceId = req.params.id
    const updatedPrice = req.body

    const index = database.prices.findIndex((price) => price.id === priceId)

    if (index !== -1) {
      database.prices[index] = {
        ...database.prices[index],
        ...updatedPrice,
        id: priceId
      }

      await writeFileAsync('./animals.json', database)
      res.json({ data: database.prices[index] })
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read/write animals data' })
  }
}

const deleteAnimal = async (req, res) => {
  try {
    const animals = await readFileAsync('./animals.json')
    const id = req.params.id
    const index = animals.animals.findIndex((animal) => animal.id === id)

    if (index !== -1) {
      animals.animals.splice(index, 1)

      await writeFileAsync('./animals.json', animals)
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read/write animals data' })
  }
}


app.get('/api/animals/:id', getAnimalById)
app.delete('/api/animals/:id', deleteAnimal)

app.get('/api/voucher', getVouchers)

app.get('/api/prices', getPrices)
app.post('/api/prices', addPrice)
app.put('/api/prices/:id', updatePrice)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
