const _ = require('lodash')
const moment = require('moment')

const epcRecommendations = require('./epcRecommendations')

exports.mapSearchResults = function (data) {
  const properties = data.map(toCamelCaseProperties)
  return _.sortBy(properties, p => p.address.toLowerCase())
}

const CERTIFICATE_IN_DATE_LIMIT = 5
const THRESHOLD_COMPLIANT_RATING_BAND = 'E' // Uppercase.

exports.mapCertificate = function (data) {
  const certificate = toCamelCaseProperties(data)

  const date = moment(certificate.inspectionDate)
  certificate.inspectionDate = date.format('DD/MM/YYYY')
  certificate.ageInYears = moment().diff(date, 'years')
  certificate.outOfDate = certificate.ageInYears > CERTIFICATE_IN_DATE_LIMIT

  const band = certificate.assetRatingBand = certificate.assetRatingBand.toUpperCase()
  certificate.ratingClass = `${band.toLowerCase()}-rating`
  certificate.compliant = band <= THRESHOLD_COMPLIANT_RATING_BAND

  return certificate
}

const PAYBACK_TYPE_MAPPINGS = {
  'SHORT': { order: 0, title: '1-2 years' },
  'MEDIUM': { order: 1, title: '3-6 years' },
  'LONG': { order: 2, title: '7+ years' },
  'OTHER': { order: 3, title: '-' }
}

const CO2_IMPACT_MAPPINGS = {
  'HIGH': { bandImpact: 2 },
  'MEDIUM': { bandImpact: 1 },
  'LOW': { bandImpact: 0 }
}

exports.mapRecommendations = function (data, currentBand, size) {
  const recommendations = data.map(toCamelCaseProperties)
  recommendations.forEach(recommendation => {
    const { recommendationCode, paybackType, co2Impact } = recommendation
    const paybackTypeMapping = PAYBACK_TYPE_MAPPINGS[paybackType]
    recommendation.paybackTypeOrder = paybackTypeMapping.order
    recommendation.paybackTypeTitle = paybackTypeMapping.title
    if (currentBand) {
      const co2ImpactMapping = CO2_IMPACT_MAPPINGS[co2Impact]
      recommendation.bandAfter = getBandAfter(currentBand, co2ImpactMapping.bandImpact)
    }
    recommendation.costs = epcRecommendations.getCosts(recommendationCode, paybackType, size || 'Medium')
  })
  return _.sortBy(recommendations, ['paybackTypeOrder', 'bandAfter'])
}

const BANDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
function getBandAfter (currentBand, bandImpact) {
  const currentBandIndex = BANDS.indexOf(currentBand)
  if (currentBandIndex === -1) {
    return undefined
  }
  const newBandIndex = currentBandIndex - bandImpact
  return BANDS[newBandIndex < 0 ? 0 : newBandIndex]
}

function toCamelCaseProperties (obj) {
  return _.mapKeys(obj, (value, key) => _.camelCase(key))
}
