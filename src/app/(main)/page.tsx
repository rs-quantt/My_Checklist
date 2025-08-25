import Link from 'next/link';

export default function Home() {
  return (
    <div className="antialiased bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div
        className="bg-blue-700 text-white py-20 text-center shadow-md"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/6192123/pexels-photo-6192123.jpeg)',
          backgroundSize: 'cover',
          backgroundPositionY: '-42px',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Efficient Task Management with My Checklist
        </h1>
        <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
          Organize tasks, track progress, and collaborate easily with our
          comprehensive checklist system.
        </p>
        <div className="mt-8">
          <Link
            href="/checklists"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out !text-blue-900"
          >
            Get Started Now
            <svg
              className="ml-2 -mr-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M4.293 15.707a1 1 0 010-1.414L8.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Rules Navigation Section */}
      <section className="bg-white py-16 my-20">
        <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-blue-900">
            Explore Our Guidelines
          </h2>
          <p className="mt-4 text-base text-gray-600 max-w-2xl mx-auto">
            Our platform is governed by a set of comprehensive rules to ensure a
            fair and orderly environment. Click the button below to view them.
          </p>
          <div className="mt-8">
            <Link
              href="/rules" // Make sure this is the correct path
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm !text-white bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            >
              Learn More
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content - Features Section */}
      <main className="py-16 my-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-900">
              Key Features
            </h2>
            <p className="mt-4 text-base text-gray-600">
              Discover how My Checklist helps you achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition duration-300 ease-in-out">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-900 mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Checklist Management
              </h3>
              <p className="text-base text-gray-600">
                Create and manage task lists intuitively and efficiently.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition duration-300 ease-in-out">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-base text-gray-600">
                Update and track the progress of each item in your checklist.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition duration-300 ease-in-out">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.596.14-1.166.395-1.678l-.348-.348A6.002 6.002 0 0116 11.39V7.61a6.002 6.002 0 00-7.394-5.816l-.014.002c-3.18 0-5.786 2.593-5.786 5.773v.01"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Collaboration
              </h3>
              <p className="text-base text-gray-600">
                Share checklists and work together seamlessly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Why Choose My Checklist Section */}
      <section className="bg-gray-100 py-16 my-20">
        <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-blue-900 mb-4">
            Why Choose My Checklist?
          </h2>
          <p className="mt-4 text-base text-gray-700 max-w-2xl mx-auto mb-12">
            My Checklist is designed to simplify your workflow and enhance your
            productivity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <div className="relative overflow-hidden bg-white rounded-lg shadow-lg py-12 px-4 flex flex-col items-center justify-center text-center transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out group"
                 style={{ backgroundImage: 'linear-gradient(to bottom right, #e0f7fa, #b2ebf2)' }}>
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-300" style={{ backgroundImage: 'url("https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")' }}></div>
                <div className="relative z-10 flex-shrink-0 mb-4">
                    <svg className="w-16 h-16 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Easy to Use
                    </h3>
                    <p className="text-base text-gray-700">
                        Intuitive interface allows you to get started easily without a
                        steep learning curve.
                    </p>
                </div>
            </div>
            <div className="relative overflow-hidden bg-white rounded-lg shadow-lg py-12 px-4 flex flex-col items-center justify-center text-center transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out group"
                 style={{ backgroundImage: 'linear-gradient(to bottom right, #e8f5e9, #c8e6c9)' }}>
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-300" style={{ backgroundImage: 'url("https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")' }}></div>
                <div className="relative z-10 flex-shrink-0 mb-4">
                    <svg className="w-16 h-16 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h.01M12 15h.01M16 15h.01M9 19l3 3 3-3M7 11h10a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7a2 2 0 012-2z"></path></svg>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Flexible
                    </h3>
                    <p className="text-base text-gray-700">
                        Customize checklists to suit any type of project or personal
                        task.
                    </p>
                </div>
            </div>
            <div className="relative overflow-hidden bg-white rounded-lg shadow-lg py-12 px-4 flex flex-col items-center justify-center text-center transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out group"
                 style={{ backgroundImage: 'linear-gradient(to bottom right, #f3e5f5, #e1bee7)' }}>
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-300" style={{ backgroundImage: 'url("https://images.pexels.com/photos/5380653/pexels-photo-5380653.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")' }}></div>
                <div className="relative z-10 flex-shrink-0 mb-4">
                    <svg className="w-16 h-16 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002 12c0 2.756 1.05 5.438 2.944 7.234l-1.047 1.047a1 1 0 001.414 1.414L6 20.414a11.944 11.944 0 006 1.586c2.756 0 5.438-1.05 7.234-2.944l1.047 1.047a1 1 0 001.414-1.414l-1.047-1.047A12.001 12.001 0 0022 12c0-2.756-1.05-5.438-2.944-7.234z"></path></svg>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Secure and Reliable
                    </h3>
                    <p className="text-base text-gray-700">
                        Your data is always protected with top-notch security measures.
                    </p>
                </div>
            </div>
            <div className="relative overflow-hidden bg-white rounded-lg shadow-lg py-12 px-4 flex flex-col items-center justify-center text-center transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out group"
                 style={{ backgroundImage: 'linear-gradient(to bottom right, #fff3e0, #ffe0b2)' }}>
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-300" style={{ backgroundImage: 'url("https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")' }}></div>
                <div className="relative z-10 flex-shrink-0 mb-4">
                    <svg className="w-16 h-16 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-1.75-3M3 14H10M14 14h7M5 19H19a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Cross-Platform Support
                    </h3>
                    <p className="text-base text-gray-700">
                        Access your checklists from any device, anytime, anywhere.
                    </p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white text-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/5717418/pexels-photo-5717418.jpeg)',
          backgroundSize: 'cover',
          backgroundPositionY: '-794px',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have simplified their lives and work
            with My Checklist.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 text-center">
        <div className="container mx-auto px-4">
          <p className="text-base mb-8">
            &copy; {new Date().getFullYear()} My Checklist. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mb-8">
            {/* LinkedIn */}
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition duration-300">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.79 7 2.912v6.323z" clipRule="evenodd" />
              </svg>
            </a>
            {/* Twitter */}
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition duration-300">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.423-4.26 4.116 4.116 0 001.272 5.403 4.07 4.07 0 01-1.85-.513v.052a4.118 4.118 0 003.294 4.022 4.095 4.095 0 01-1.853.07 4.12 4.12 0 003.834 2.85A8.233 8.233 0 012 18.188a11.644 11.644 0 006.29 2.063c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.423-4.26 4.116 4.116 0 001.272 5.403 4.07 4.07 0 01-1.85-.513v.052a4.118 4.118 0 003.294 4.022 4.095 4.095 0 01-1.853.07 4.12 4.12 0 003.834 2.85A8.233 8.233 0 012 18.188a11.644 11.644 0 006.29 2.063" />
              </svg>
            </a>
            {/* GitHub - Corrected Path */}
            <a href="https://www.github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition duration-300">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.799 8.205 11.387.6.111.82-.25.82-.553V20.23c-3.003.65-3.637-1.444-3.637-1.444-.492-1.244-1.2-1.574-1.2-1.574-1-.68.075-.668.075-.668 1.107.078 1.692 1.135 1.692 1.135.98 1.68 2.573 1.198 3.19.917.098-.714.382-1.198.694-1.473-2.443-.277-5.004-1.22-5.004-5.437 0-1.199.429-2.181 1.13-2.95-.113-.278-.49-1.396.107-2.91 0 0 .919-.296 3.014 1.13a10.457 10.457 0 015.488 0c2.094-1.426 3.013-1.13 3.013-1.13.598 1.514.22 2.632.107 2.91.702.769 1.13 1.751 1.13 2.95 0 4.226-2.565 5.158-5.013 5.434.39.336.754.996.754 2.008V23.41c0 .305.216.669.825.552C20.562 21.799 24 17.302 24 12c0-6.627-5.373-12-12-12z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-4 text-lg space-x-4"> {/* Increased text size and spacing */}
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              Privacy Policy
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}