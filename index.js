const express = require('express')
const handlebars = require('express-handlebars')
const request = require('request')
const urljoin = require('url-join')

const app = express()

app.use(express.static('public'))

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.render('search')
})

app.get('/search', (req, res) => {
  const { postcode } = req.query
  doSearch(postcode, properties => {
    res.render('search', { postcode, properties })
  })
})

app.get('/rating/:certificateHash', (req, res) => {
  const { certificateHash } = req.params
  getResult(certificateHash, (property, recommendations) => {
    res.render('rating', { certificateHash, property, recommendations })
  })
})

// -- API CALLS

const EPC_BASE_URL = 'https://epc.opendatacommunities.org/api/v1/non-domestic/'
const commonOptions = {
  auth: {
    'username': 'your.email@example.com',
    'password': 'yourapikey'
  },
  headers: { 'Accept': 'application/json' },
  json: true
}

function doSearch (postcode, callback) {
  const url = urljoin(EPC_BASE_URL, 'search')
  const qs = { postcode }
  const options = Object.assign({ url, qs }, commonOptions)
  request.get(options, (e, r, data) => {
    callback(data.rows)
  })
}

function getResult (certificateHash, callback) {
  const url = urljoin(EPC_BASE_URL, 'certificate', certificateHash)
  const options = Object.assign({ url }, commonOptions)
  request.get(options, (e, r, data) => {
    const row = data.rows[0]
    const lmkKey = row['lmk-key']
    getRecommendations(lmkKey, recommendations => {
      callback(row, recommendations)
    })
  })
}

function getRecommendations (lmkKey, callback) {
  // TODO: Remove this overwrite with example LMK key.
  lmkKey = '100000220150312070330'

  const url = urljoin(EPC_BASE_URL, 'recommendations', lmkKey)
  const options = Object.assign({ url }, commonOptions)
  request.get(options, (e, r, data) => {
    callback(data.rows)
  })
}

// ---

const port = 5000

app.listen(port, () => console.log(`Listening on port ${port}.`))
