'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Show content with animation delay
    const timer = setTimeout(() => setShowContent(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleGetStarted = () => {
    if (user) {
      // If user is authenticated, go to dashboard
      router.push('/dashboard')
    } else {
      // If not authenticated, go to login
      router.push('/login')
    }
  }

  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/helix-background.png"
          alt="Helix Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Animated DNA Helix Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 opacity-20 animate-pulse">
          <Image src="/helix-icon.png" alt="Helix" fill className="object-contain" />
        </div>
        <div className="absolute bottom-20 right-10 w-24 h-24 opacity-15 animate-bounce">
          <Image src="/helix-icon.png" alt="Helix" fill className="object-contain" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 opacity-10 animate-spin">
          <Image src="/helix-icon.png" alt="Helix" fill className="object-contain" />
        </div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-64 h-64 animate-float">
                <Image
                  src="/helixbridge-logo.png"
                  alt="HelixBridge Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              Helix<span className="text-blue-400">Bridge</span>
            </h1>

            {/* Stylized H∴B */}
            <div className="text-4xl md:text-6xl font-light text-blue-300 mb-8 tracking-widest">
              H∴B
            </div>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connecting Enterprise Operations Through Intelligent Workforce Management
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {user ? 'Go' : 'Get Started'}
              </button>
              <button
                onClick={handleLearnMore}
                className="px-8 py-4 border-2 border-blue-400 text-blue-400 font-semibold rounded-full hover:bg-blue-400 hover:text-white transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
              Enterprise-Grade Solutions
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Workforce Management</h3>
                <p className="text-blue-100">
                  Comprehensive employee lifecycle management with advanced analytics and reporting capabilities.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Project Operations</h3>
                <p className="text-blue-100">
                  Streamlined project management with intelligent resource allocation and performance tracking.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Enterprise Security</h3>
                <p className="text-blue-100">
                  Zero-trust architecture with SOC 2 compliance and enterprise-grade security controls.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="relative w-12 h-12">
                <Image src="/helix-icon.png" alt="HelixBridge" fill className="object-contain" />
              </div>
              <span className="ml-3 text-xl font-semibold text-white">HelixBridge</span>
            </div>
            <p className="text-blue-200">
              © 2024 HelixBridge. Enterprise Workforce Management Solutions.
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

