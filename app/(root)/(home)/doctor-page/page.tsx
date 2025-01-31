import DoctorCard from '@/components/DoctorCard'
import { Button } from '@/components/ui/button'
import React from 'react'

const page = () => {
  return (
    <div>
        <h1 className='leading-10 text-4xl font-poppins font-semibold text-center mb-5 mt-20'>Good Health Starts <br /> with the Right Doctor</h1>
        <h1 className='text-gray-400 text-lg font-poppins text-center'>Empowering You To Live The fullest Life</h1>
        <div>
            <DoctorCard/>
        </div>
        <div className='flex items-center justify-center mt-10'>
            <Button className='rounded-full px-4 py-6 text-lg text-green-1'>
                See Full List
            </Button>
        </div>
    </div>
  )
}

export default page