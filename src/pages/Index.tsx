import React, { useState } from 'react';
import { Moon, Sun, Bus, TrendingUp, MapPin, BarChart3, Users, Navigation, Clock, Shield } from 'lucide-react';

const Index = () => {
  const [isDark, setIsDark] = useState(true);

  const features = [
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Live GPS tracking of all campus buses with accurate ETA predictions",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "ML Demand Prediction",
      description: "Prophet model predicts demand patterns for next hour and next day",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Navigation,
      title: "Smart Route Optimization",
      description: "K-Means clustering identifies high-demand zones for efficient routing",
      color: "from-orange-500 to-amber-500"
    }
  ];

  const stats = [
    { icon: Bus, value: "50+", label: "Active Buses" },
    { icon: Users, value: "10K+", label: "Students" },
    { icon: Clock, value: "95%", label: "On-Time Rate" },
    { icon: Shield, value: "24/7", label: "Monitoring" }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-lg border-b ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Transit</span>
              </span>
            </div>
            
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Next-Gen Campus Transportation
                </span>
              </div>
            </div>

            <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Smart Transport
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400">
                Management System
              </span>
            </h1>

            <p className={`max-w-2xl mx-auto text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ML-driven demand prediction meets real-time GPS tracking for seamless campus mobility
            </p>

            {/* Portal Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">

              {/* ⭐ FIXED STUDENT PORTAL BUTTON */}
              <a
                href="/student"
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 
                ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'}`}
              >
                <Users className="w-5 h-5 inline-block mr-2" />
                Student Portal
              </a>

              <a
                href="/driver"
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'}`}
              >
                <Navigation className="w-5 h-5 inline-block mr-2" />
                Driver Portal
              </a>

              <a
                href="/admin"
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'}`}
              >
                <BarChart3 className="w-5 h-5 inline-block mr-2" />
                Admin Dashboard
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl backdrop-blur-sm border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}
              >
                <stat.icon className={`w-8 h-8 mb-3 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`} />
                <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Key Features
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Powered by advanced technology and intelligent algorithms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 shadow-lg hover:shadow-xl'}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t mt-20 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                CampusTransit
              </span>
            </div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
               CampusTransit. Transforming campus transportation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
