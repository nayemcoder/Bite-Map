import { useState } from 'react'
import { MagnifyingGlassIcon, HeartIcon, StarIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const initialRestaurants = Array(20).fill(null).map((_, i) => ({
  id: i + 1,
  name: `Restaurant ${i + 1}`,
  cuisine: ['American', 'Italian', 'French', 'Japanese', 'Mexican'][i % 5],
  location: ['Downtown', 'Uptown', 'Midtown', 'West Side', 'East Side'][i % 5],
  price: i % 3 === 0 ? '$30 and under' : i % 3 === 1 ? '$31 to $50' : '$51 and over',
  rating: Math.floor(Math.random() * 2) + 3, // Random rating between 3-5
  reviews: Math.floor(Math.random() * 2000) + 100, // Random reviews between 100-2100
  image: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80'
  ][i % 4]
}))

const priceRanges = [
  { label: 'Cheap', count: 20 },
  { label: 'Affordable', count: 20 },
  { label: 'Expensive', count: 50 },
  { label: 'Very expensive', count: 5 }
]

const cuisines = [
  { label: 'American', count: 200 },
  { label: 'Italian', count: 20 },
  { label: 'French', count: 50 },
  { label: 'Japanese', count: 5 },
  { label: 'Califonian', count: 15 },
  { label: 'Seafood', count: 10 }
]

const ratings = Array(5).fill(null).map((_, i) => ({
  value: 5 - i,
  label: Array(5 - i).fill('★').join('') + Array(i).fill('☆').join('')
}))

export default function RestaurantsPage() {
  const [viewMode, setViewMode] = useState('grid')
  const [sortOption, setSortOption] = useState('rating-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const restaurantsPerPage = 6
  
  const sortedRestaurants = [...initialRestaurants].sort((a, b) => {
    if (sortOption === 'rating-asc') return a.rating - b.rating
    if (sortOption === 'rating-desc') return b.rating - a.rating
    if (sortOption === 'reviews-asc') return a.reviews - b.reviews
    if (sortOption === 'reviews-desc') return b.reviews - a.reviews
    return 0
  })

  const totalPages = Math.ceil(sortedRestaurants.length / restaurantsPerPage)
  const displayedRestaurants = sortedRestaurants.slice(
    (currentPage - 1) * restaurantsPerPage,
    currentPage * restaurantsPerPage
  )

  return (
    <>
      {/* Results */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Found <span className="font-medium">{initialRestaurants.length} results</span> in 54 seconds
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by</span>
              <select 
                className="text-sm border-gray-300 rounded-md"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="rating-desc">Rating: High to Low</option>
                <option value="rating-asc">Rating: Low to High</option>
                <option value="reviews-desc">Reviews: Most to Least</option>
                <option value="reviews-asc">Reviews: Least to Most</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {displayedRestaurants.map(restaurant => (
            <div key={restaurant.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-48 object-cover" />
                <button className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-50">
                  <HeartIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">{restaurant.cuisine} | {restaurant.location}</p>
                <p className="text-sm text-gray-600 mb-2">{restaurant.price}</p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {Array(5).fill(null).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={clsx(
                          'h-4 w-4',
                          i < restaurant.rating ? 'fill-current' : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">({restaurant.reviews} reviews)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          {Array(totalPages).fill(null).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={clsx(
                'px-3 py-1 rounded-md text-sm',
                currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
)
}