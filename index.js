const express = require('express')
const handlebars = require('express-handlebars')
const request = require('request')

const app = express()

app.use(express.static('public'))

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.render('search')
})

app.get('/search', (req, res) => {
  const { postcode } = req.query
  doSearch(postcode, rows => {
    res.render('search', { postcode, rows })
  })
})

// -- API CALLS

const EPC_BASE_URL = 'https://epc.opendatacommunities.org/api/v1/non-domestic/'

function doSearch (postcode, callback) {
  const url = EPC_BASE_URL + 'search'
  const qs = { postcode }
  const auth = {
    'username': 'your.email@example.com',
    'password': 'yourapikey'
  }
  const headers = { 'Accept': 'application/json' }
  request.get({ url, qs, auth, headers, json: true }, (e, r, data) => {
    callback(data.rows.length)
  })
}

// ---

const port = 5000

app.listen(port, () => console.log(`Listening on port ${port}.`))
