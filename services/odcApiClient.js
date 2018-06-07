const request = require('request')
const urljoin = require('url-join')

const mapper = require('./mapper')

const EPC_BASE_URL = 'https://epc.opendatacommunities.org/api/v1/non-domestic/'

const commonOptions = Object.freeze({
  auth: { username: process.env.ODC_USERNAME, password: process.env.ODC_PASSWORD },
  headers: { 'Accept': 'application/json' },
  json: true
})

class OdcApiClient {
  search (postcode) {
    const url = urljoin(EPC_BASE_URL, 'search')
    const qs = { postcode }
    const options = Object.assign({ url, qs }, commonOptions)
    return new Promise((resolve, reject) => {
      request.get(options, (e, r, data) => {
        resolve(data ? data.rows : [])
      })
    }).then(mapper.mapSearchResults)
  }

  getCertificateAndRecommendations (certificateHash) {
    const url = urljoin(EPC_BASE_URL, 'certificate', certificateHash)
    const options = Object.assign({ url }, commonOptions)
    return new Promise((resolve, reject) => {
      request.get(options, (e, r, data) => {
        const certificate = mapper.mapCertificate(data.rows[0])
        this.getRecommendations(certificate.lmkKey, certificate.assetRatingBand).then(recommendations => {
          resolve({ certificate, recommendations })
        })
      })
    })
  }

  getRecommendations (lmkKey, assetRatingBand) {
    const url = urljoin(EPC_BASE_URL, 'recommendations', lmkKey)
    const options = Object.assign({ url }, commonOptions)
    return new Promise((resolve, reject) => {
      request.get(options, (e, r, data) => {
        if (r.statusCode !== 404) {
          resolve(data.rows)
        } else if (process.env.USE_DUMMY_RECOMMENDATIONS === 'yes') {
          this.getRecommendations('100000220150312070330', assetRatingBand).then(resolve)
        } else {
          resolve([])
        }
      })
    }).then(data => mapper.mapRecommendations(data, assetRatingBand))
  }
}

module.exports = new OdcApiClient()
