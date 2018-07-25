const rp = require('request-promise')
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
    return rp.get(options).then(data => data ? data.rows : []).then(mapper.mapSearchResults)
  }

  getCertificateAndRecommendations (certificateHash, size) {
    const url = urljoin(EPC_BASE_URL, 'certificate', certificateHash)
    const options = Object.assign({ url }, commonOptions)
    return rp.get(options).then(data => {
      const certificate = mapper.mapCertificate(data.rows[0])
      const { lmkKey, assetRatingBand } = certificate
      return this.getRecommendations(lmkKey, assetRatingBand, size).then(recommendations => {
        return { certificate, recommendations }
      })
    })
  }

  getRecommendations (lmkKey, assetRatingBand, size) {
    const url = urljoin(EPC_BASE_URL, 'recommendations', lmkKey)
    const options = Object.assign({ url }, commonOptions)
    return rp.get(options).then(data => data.rows).then(data => mapper.mapRecommendations(data, assetRatingBand, size))
      .catch(error => {
        if (error.name === 'StatusCodeError' && error.response.statusCode === 404) {
          const useDummyRecommendations = (process.env.USE_DUMMY_RECOMMENDATIONS === 'yes')
          return useDummyRecommendations ? this.getRecommendations('100000220150312070330', assetRatingBand, size) : []
        } else {
          throw error
        }
      })
  }
}

module.exports = new OdcApiClient()
