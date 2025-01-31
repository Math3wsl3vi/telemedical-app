'use client'
import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const Hero = () => {
    const router = useRouter()
  return (
    <div className="flex mx-auto gap-10 w-full z-0">
      <div className="flex md:min-w-[450px] gap-10 flex-col pt-10 md:pt-52 md:border w-full items-center ">
        <div className='flex flex-col gap-5 w-full items-center'>
        <h1 className="font-poppins text-5xl text-left hidden md:block">The Best Virtual</h1>
        <h1 className="font-poppins text-5xl text-left hidden md:block">healthcare</h1>
        <h1 className="font-poppins text-5xl text-left hidden md:block">for you.</h1>
        <h1 className='font-poppins text-3xl md:hidden'>The Best Virtual Healthcare for you</h1>
        <div className='w-[450px]'>
        <p className='text-wrap text-xl font-poppins leading-10 text-green-1'>We provide progressive, affordable and convinient healtlcare consultation in minutes.</p>
        </div>
        </div>
        <div className='mx-10 p-10 px-28'>
            <Button
            onClick={()=>router.push('/doctor-page')}
            className='bg-green-1 text-white text-xl px-36 w-[90%] md:w-[460px] py-4'>Find A Doctor</Button>
        </div>
      </div>
        <Image
          src="/images/main.png"
          alt="picture"
          width={1000}
          height={1000}
          className="side-img max-w-[50%] hidden md:block"
        />
    </div>
  );
}

export default Hero