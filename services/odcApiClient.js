const request = require('request')
const urljoin = require('url-join')

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
    })
  }

  getCertificateAndRecommendations (certificateHash) {
    const url = urljoin(EPC_BASE_URL, 'certificate', certificateHash)
    const options = Object.assign({ url }, commonOptions)
    return new Promise((resolve, reject) => {
      request.get(options, (e, r, data) => {
        const certificate = data.rows[0]
        const lmkKey = certificate['lmk-key']
        this.getRecommendations(lmkKey).then(recommendations => {
          resolve({ certificate, recommendations })
        })
      })
    })
  }

  getRecommendations (lmkKey) {
    const url = urljoin(EPC_BASE_URL, 'recommendations', lmkKey)
    const options = Object.assign({ url }, commonOptions)
    return new Promise((resolve, reject) => {
      request.get(options, (e, r, data) => {
        if (r.statusCode !== 404) {
          resolve(data.rows)
        } else if (process.env.USE_DUMMY_RECOMMENDATIONS === 'yes') {
          this.getRecommendations('100000220150312070330').then(resolve)
        } else {
          resolve([])
        }
      })
    })
  }
}

module.exports = new OdcApiClient()
