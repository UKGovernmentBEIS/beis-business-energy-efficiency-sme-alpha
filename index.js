const express = require('express')
const handlebars = require('express-handlebars')
const pdf = require('html-pdf')

const epcRecommendations = require('./services/epcRecommendations')
const mapper = require('./services/mapper')
const odcApiClient = require('./services/odcApiClient')

const app = express()

app.use(express.static('public'))

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.redirect('/search')
})

app.get('/expert/:recommendationCode', (req, res) => {
  const { recommendationCode } = req.params
  const recommendation = epcRecommendations.getRecommendation(recommendationCode)
  res.render('expert', { recommendation })
})

app.get('/rating/:certificateHash', (req, res) => {
  const { certificateHash } = req.params
  odcApiClient.getCertificateAndRecommendations(certificateHash).then(({ certificate, recommendations }) => {
    certificate = mapper.mapCertificate(certificate)
    recommendations = mapper.mapRecommendations(recommendations)
    res.render('rating', { certificate, recommendations })
  })
})

app.get('/rating/:certificateHash/recommendations/EPC_:lmkKey.pdf', (req, res) => {
  // Stub.
  pdf.create('<h1 style="font-family: Arial; margin: 2em;">Recommendations go here…</h1>').toStream((e, stream) => stream.pipe(res))
})

app.get('/recommendation/:recommendationCode', (req, res) => {
  const { recommendationCode } = req.params
  const recommendation = epcRecommendations.getRecommendation(recommendationCode)
  res.render('recommendation', { recommendation })
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

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listening on port ${port}.`))
