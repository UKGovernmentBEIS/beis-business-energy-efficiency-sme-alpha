class RatingColorHelper {
  getRatingColor (property) {
    switch (property['asset-rating-band']) {
      case 'A':
        return 'a-rating'
      case 'B':
        return 'b-rating'
      case 'C':
        return 'c-rating'
      case 'D':
        return 'd-rating'
      case 'E':
        return 'e-rating'
      case 'F':
        return 'f-rating'
      case 'G':
        return 'g-rating'
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
