const express = require('express')
const handlebars = require('express-handlebars')
const moment = require('moment')
const _ = require('lodash')

const odcApiClient = require('./services/odcApiClient')
const ratingColorHelper = require('./services/ratingColorHelper')

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
  odcApiClient.search(postcode).then(properties => {
    properties = _.sortBy(properties, 'address')
    res.render('search', { postcode, properties })
  })
})

const PAYBACK_TYPE_ORDER = { 'SHORT': 0, 'MEDIUM': 1, 'LONG': 2, 'OTHER': 3 }
const PAYBACK_TYPE_TITLES = { 'SHORT': '0-2 years', 'MEDIUM': '3-6 years', 'LONG': '7+ years' }
app.get('/rating/:certificateHash', (req, res) => {
  const { certificateHash } = req.params
  odcApiClient.getCertificate(certificateHash).then(({ property, recommendations }) => {
    property.color = ratingColorHelper.getRatingColor(property)
    property['inspection-date'] = moment(property['inspection-date']).format('DD/MM/YYYY')
    recommendations.forEach(recommendation => {
      recommendation.paybackTypeOrder = PAYBACK_TYPE_ORDER[recommendation.PAYBACK_TYPE]
      recommendation.paybackTypeColor = ratingColorHelper.getRecommendationColor(recommendation.paybackTypeOrder)
      recommendation.paybackTypeTitle = PAYBACK_TYPE_TITLES[recommendation.PAYBACK_TYPE] || '-'
    })
    recommendations = _.sortBy(recommendations, ['paybackTypeOrder'])
    res.render('rating', { certificateHash, property, recommendations })
  })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Listening on port ${port}.`))
