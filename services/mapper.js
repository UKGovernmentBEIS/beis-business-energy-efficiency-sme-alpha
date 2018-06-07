const _ = require('lodash')
const moment = require('moment')

exports.mapSearchResults = function (data) {
  const properties = data.map(toCamelCaseProperties)
  return _.sortBy(properties, p => p.address.toLowerCase())
}

const CERTIFICATE_IN_DATE_LIMIT = 5
const THRESHOLD_COMPLIANT_RATING_BAND = 'E'

exports.mapCertificate = function (data) {
  const certificate = toCamelCaseProperties(data)
  const date = moment(certificate.inspectionDate)
  certificate.inspectionDate = date.format('DD/MM/YYYY')
  certificate.ageInYears = moment().diff(date, 'years')
  certificate.outOfDate = certificate.ageInYears > CERTIFICATE_IN_DATE_LIMIT
  const band = certificate.assetRatingBand
  certificate.ratingClass = `${band.toLowerCase()}-rating`
  certificate.compliant = band.toUpperCase() <= THRESHOLD_COMPLIANT_RATING_BAND.toUpperCase()
  return certificate
}

const PAYBACK_TYPE_MAPPINGS = {
  'SHORT': { order: 0, title: '1-2 years', class: 'recommendation-good' },
  'MEDIUM': { order: 1, title: '3-6 years', class: 'recommendation-medium' },
  'LONG': { order: 2, title: '7+ years', class: 'recommendation-bad' },
  'OTHER': { order: 3, title: '-', class: 'recommendation-other' }
}

exports.mapRecommendations = function (data) {
  const recommendations = data.map(toCamelCaseProperties)
  recommendations.forEach(recommendation => {
    const paybackTypeMapping = PAYBACK_TYPE_MAPPINGS[recommendation.paybackType]
    recommendation.paybackTypeOrder = paybackTypeMapping.order
    recommendation.paybackTypeTitle = paybackTypeMapping.title
    recommendation.paybackTypeColor = paybackTypeMapping.class
  })
  return _.sortBy(recommendations, ['paybackTypeOrder'])
}

function toCamelCaseProperties (obj) {
  return _.mapKeys(obj, (value, key) => _.camelCase(key))
}
