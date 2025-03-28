export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>
      <div className="prose lg:prose-xl">
        <p className="text-lg text-gray-600 mb-6">
          Welcome to our restaurant discovery platform. We're passionate about connecting food lovers with amazing dining experiences.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-lg text-gray-600 mb-6">
          Our mission is to make it easy for everyone to find and enjoy great restaurants. Whether you're looking for a casual bite or fine dining, we've got you covered.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <p className="text-lg text-gray-600">
          Founded in 2023, we've grown from a small startup to a platform serving thousands of users and restaurants. Our journey is just beginning, and we're excited to have you along for the ride.
        </p>
      </div>
    </div>
  )
}