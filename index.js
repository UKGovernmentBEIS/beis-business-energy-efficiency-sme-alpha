const express = require('express')
const mustacheExpress = require('mustache-express')
const path = require('path')

const app = express()

app.engine('html', mustacheExpress())
app.set('view engine', 'html')
app.set('views', path.join(__dirname, '/views'))

app.get('/', (req, res) => {
  res.render('index.html')
})

app.get('/search', (req, res) => {
  res.render('search.html', {
    postcode: req.query.postcode
  })
})

const port = 5000

app.listen(port, () => console.log(`Listening on port ${port}.`))
