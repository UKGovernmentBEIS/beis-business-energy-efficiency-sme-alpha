const express = require('express')
const handlebars = require('express-handlebars')

const mapper = require('./services/mapper')
const odcApiClient = require('./services/odcApiClient')

const app = express()

app.use(express.static('public'))

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.redirect('/search')
})

app.get('/search', (req, res) => {
  const { postcode } = req.query
  if (!postcode) {
    res.render('search')
    return
  }
  odcApiClient.search(postcode).then(results => {
    results = mapper.mapSearchResults(results)
    res.render('search', { postcode, results })
  })
})

app.get('/rating/:certificateHash', (req, res) => {
  const { certificateHash } = req.params
  odcApiClient.getCertificateAndRecommendations(certificateHash).then(({ certificate, recommendations }) => {
    certificate = mapper.mapCertificate(certificate)
    recommendations = mapper.mapRecommendations(recommendations)
    res.render('rating', { certificate, recommendations })
  })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listening on port ${port}.`))
