class RatingColorHelper {
  getRatingColor (property) {
    const band = property['asset-rating-band']
    switch (band) {
      case 'A': case 'B': case 'C': case 'D':
      case 'E': case 'F': case 'G':
        return `${band.toLowerCase()}-rating`
      default:
        break
    }
  }

  getRecommendationColor (order) {
    switch (order) {
      case 0:
        return 'recommendation-good'
      case 1:
        return 'recommendation-medium'
      case 2:
        return 'recommendation-bad'
      case 3:
        return 'recommendation-other'
      default:
        break
    }
  }
}

module.exports = new RatingColorHelper()
