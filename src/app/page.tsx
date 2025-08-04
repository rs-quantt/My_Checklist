import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="antialiased bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-700 text-white py-16 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Efficient Task Management with My Checklist
        </h1>
        <p className="mt-3 text-lg opacity-90 max-w-2xl mx-auto">
          Organize tasks, track progress, and collaborate easily with our
          comprehensive checklist system.
        </p>
        <div className="mt-6">
          <Link
            href="/checklists"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out !text-blue-700"
          >
            Get Started Now
            <svg
              className="ml-2 -mr-1 h-4 w-4"
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

      {/* Main Content - Features Section */}
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Key Features
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Discover how My Checklist helps you achieve your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-4 text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-3">
              <svg
                className="w-6 h-6"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Easy Checklist Management
            </h3>
            <p className="text-sm text-gray-600">
              Create and manage task lists intuitively and efficiently.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-4 text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto mb-3">
              <svg
                className="w-6 h-6"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Progress Tracking
            </h3>
            <p className="text-sm text-gray-600">
              Update and track the progress of each item in your checklist so
              you don&apos;t miss a thing.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-4 text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mx-auto mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.596.14-1.166.395-1.678l-.348-.348A6.002 6002 0 0116 11.39V7.61a6.002 6.002 0 00-7.394-5.816l-.014.002c-3.18 0-5.786 2.593-5.786 5.773v.01"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Collaboration
            </h3>
            <p className="text-sm text-gray-600">
              Share checklists and work together seamlessly.
            </p>
          </div>
        </div>
      </main>

      {/* Why Choose My Checklist Section */}
      <section className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Why Choose My Checklist?
          </h2>
          <p className="mt-3 text-base text-gray-700 max-w-2xl mx-auto mb-10">
            My Checklist is designed to simplify your workflow and enhance your
            productivity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy to Use
              </h3>
              <p className="text-sm text-gray-600">
                Intuitive interface allows you to get started easily without a
                steep learning curve.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flexible
              </h3>
              <p className="text-sm text-gray-600">
                Customize checklists to suit any type of project or personal
                task.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure and Reliable
              </h3>
              <p className="text-sm text-gray-600">
                Your data is always protected with top-notch security measures.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cross-Platform Support
              </h3>
              <p className="text-sm text-gray-600">
                Access your checklists from any device, anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Ready to get started?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have simplified their lives and work
            with My Checklist.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} My Checklist. All rights reserved.
          </p>
          <div className="mt-3">
            <a href="#" className="text-gray-400 hover:text-white mx-2 text-sm">
              Privacy Policy
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-gray-400 hover:text-white mx-2 text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
