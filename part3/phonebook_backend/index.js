const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.json())
app.use(morgan('tiny'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Phonebook</h1>')
})

app.get('/info', (request, response) => {
  console.log(new Date());
  request.requestTime = new Date();
  console.log(request.requestTime);
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    </br>
    <p>${request.requestTime}</p>
    `)  
})

app.get('/api/persons', (request, response) => {
    response.json((persons))
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id == id)
  if (person) {
    response.json(person)
  } else {
      response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})


const generateId = () => {
  return Math.floor(Math.random() * 100)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  const personExists = persons.some(person => 
    person.name.toLowerCase() === body.name.toLowerCase())

  if(!body.name || !body.number) {
    response.status(400).json({
      error: 'content missing'
    })
  } else if (personExists) {
    response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }
  
  persons = persons.concat(person)
  response.json(person)
})

//Used when endpoint of a requested route is unknown 
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint'})
}
//handles all routes not handled by previous routes
//should be the last middleware 
app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})