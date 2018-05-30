const express = require('express')
const handlebars = require('express-handlebars')

const app = express()

app.use(express.static('public'))

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.render('search')
})

app.get('/search', (req, res) => {
  res.render('search', {
    postcode: req.query.postcode
  })
})

const port = 5000

app.listen(port, () => console.log(`Listening on port ${port}.`))
