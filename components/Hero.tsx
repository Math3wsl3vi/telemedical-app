'use client'
import React, { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Calendar, 
  Stethoscope,
  Brain,
  Activity,
  Heart,
  Shield,
  Clock,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatCardProps {
  value: string | number;
  label: string;
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

// Card Component
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
)

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card className="p-6 hover:shadow-md transition-all border-l-4 border-l-green-600">
    <div className="text-green-600 bg-green-50 p-3 w-fit mb-4 rounded-lg">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </Card>
);

const StatCard: React.FC<StatCardProps> = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-2xl shadow-sm">
    <p className="text-4xl font-extrabold text-green-600 mb-1">{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

const HomePage = () => {
  const features = [
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: 'Expert Doctors',
      description: 'Connect with certified healthcare professionals across multiple specialties'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Easy Scheduling',
      description: 'Book appointments instantly with our simple and intuitive booking system'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected with HIPAA-compliant security'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Access',
      description: 'Get healthcare support whenever you need it, day or night'
    }
  ]

  const specialties = [
    { icon: <Heart className="w-6 h-6" />, name: 'Cardiology' },
    { icon: <Brain className="w-6 h-6" />, name: 'Neurology' },
    { icon: <Activity className="w-6 h-6" />, name: 'General Medicine' },
    { icon: <Stethoscope className="w-6 h-6" />, name: 'Pediatrics' },
  ]

  const benefits = [
    'Instant video consultations',
    'Digital prescriptions',
    'Health records management',
    'Follow-up reminders',
    'Specialist referrals',
    'Lab test coordination'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block bg-green-50 border border-green-200 px-4 py-2">
                <p className="text-sm font-medium text-green-600">Trusted Healthcare Platform</p>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Health is Our
                <span className="text-green-600"> Priority</span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with top-rated doctors instantly. Book appointments, get consultations, and manage your health all in one place. Quality healthcare is just a click away.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/doctor-page">
                  <Button className="w-full sm:w-auto px-8 py-6 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold transition-colors flex items-center gap-2">
                    Find a Doctor
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto px-8 py-6 bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold transition-colors">
                  How it Works
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <StatCard value="500+" label="Expert Doctors" />
                <StatCard value="50K+" label="Happy Patients" />
                <StatCard value="24/7" label="Support Available" />
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="bg-green-50 border-4 border-green-200 p-8">
                <Image
                 src="https://images.unsplash.com/photo-1609188076864-c35269136b09?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YWZyaWNhbiUyMGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=400"
                  alt="Healthcare Professional"
                  width={800}
                  height={800}
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating Card */}
              <Card className="absolute bottom-8 left-8 p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 text-white p-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trusted by</p>
                    <p className="text-xl font-bold text-gray-900">50,000+ Patients</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-green-600">Our Platform</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive healthcare solutions designed to make your medical journey seamless and stress-free
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Specialties Section */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Medical <span className="text-green-600">Specialties</span>
            </h2>
            <p className="text-lg text-gray-600">
              Access specialists across various medical fields
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((specialty, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-all cursor-pointer text-center">
                <div className="text-green-600 bg-green-50 p-4 w-fit mx-auto mb-4">
                  {specialty.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{specialty.name}</h3>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Everything You Need for <span className="text-green-600">Better Health</span>
            </h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <p className="text-gray-700 text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8 lg:p-12 border-l-4 border-l-green-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-8">
              Join thousands of patients who trust us with their healthcare. Book your first appointment today and experience quality healthcare.
            </p>
            <Link href="/doctor-page">
              <Button className="w-full px-8 py-6 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold transition-colors flex items-center justify-center gap-2">
                Find a Doctor Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Take Control of Your Health Today
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            {"Don't"} wait for tomorrow. Start your journey to better health with expert medical care available 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/doctor-page">
              <Button className="px-8 py-6 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold transition-colors flex items-center gap-2">
                Browse Doctors
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Button className="px-8 py-6 bg-white hover:bg-gray-100 text-gray-900 text-lg font-semibold transition-colors">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage