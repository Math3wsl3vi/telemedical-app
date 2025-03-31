'use client'

import HomeCard from '@/components/HomeCard';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React from 'react'

const Home = () => {

  const now = new Date();
  const { user } = useUser()
  const router = useRouter()

  const time = now.toLocaleString('en-Us',{hour:'2-digit',minute:'2-digit'});
  const date = (new Intl.DateTimeFormat('en-Us',{dateStyle: 'full'})).format(now)
  return (
    <section className='flex size-full flex-col text-white gap-12'>
      <div className='h-[300px] w-full rounded-[20px] bg-hero bg-cover'>
        <div className='flex h-full justify-between flex-col max-md:px-5 max-md:py-8 lg:p-11'>
          <h2 className='glassmorphism max-w-[270px] rounded py-2 text-center font-poppins text-2xl'>Hi {user?.username}</h2>
          <div className='flex flex-col gap-2'>
            <h1 className='lg:text-7xl font-extrabold text-4xl'>{time}</h1>
            <p className='text-lg text-sky-1 lg:text-4xl font-medium'>{date}</p>
          </div>
        </div>
      </div>
      {/* <MeetingTypeList/> */}
      <div>
      <HomeCard
        img = 'icons/recordings.svg'
        title = 'Past Appointments'
        description = 'Check Your recordings'
        handleClick={()=>router.push('/previous')}
        className='bg-purple-1'
        />
      </div>

    </section>
  )
}

export default Home