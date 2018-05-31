class RatingColorHelper {
    getColor(property) {
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
}

module.exports = new RatingColorHelper()
