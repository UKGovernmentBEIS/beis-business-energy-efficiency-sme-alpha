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
        return 'recommendation-green'
      case 1:
        return 'recommendation-yellow'
      case 2:
        return 'recommendation-orange'
      case 3:
        return 'recommendation-other'
      default:
        break
    }
  }
}

module.exports = new RatingColorHelper()
