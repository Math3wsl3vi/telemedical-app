'use client'
import React from 'react'
import DoctorCard from '@/components/DoctorCard'

const Page = () => {
  return (
    <div className="min-h-screen font-poppins">
      <div className="px-6 md:px-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Doctors Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Doctors</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-green-600 to-transparent ml-6"></div>
            </div>
            
            {/* Doctor Card Component with all functionality */}
            <DoctorCard />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page