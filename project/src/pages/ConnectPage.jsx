export default function ConnectPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Connect Your Restaurant</h1>
      <div className="max-w-2xl">
        <p className="text-lg text-gray-600 mb-8">
          Join our platform and reach thousands of potential customers. Fill out the form below to get started.
        </p>
        <form className="space-y-6">
          <div>
            <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">Restaurant Name</label>
            <input
              type="text"
              id="restaurantName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Business Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="phone"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Restaurant Address</label>
            <textarea
              id="address"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700">Cuisine Type</label>
            <select
              id="cuisine"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option>American</option>
              <option>Italian</option>
              <option>French</option>
              <option>Japanese</option>
              <option>Chinese</option>
              <option>Indian</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Restaurant Description</label>
            <textarea
              id="description"
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  )
}