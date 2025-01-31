import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'

const SideData = [
    {
        id: 1,
        top:'24/7 Access to care',
        info: 'Ensuring you recieve care and support whenever, day or Night!'
    },
    {
        id: 2,
        top:'24/7 Access to care',
        info: 'Ensuring you recieve care and support whenever, day or Night!'
    },
    {
        id: 3,
        top:'24/7 Access to care',
        info: 'Ensuring you recieve care and support whenever, day or Night!'
    },
]

const HeroTwo = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 col-span-1 gap-5 px-1 md:px-10 mt-44 mb-[400px]'>
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col gap-3'>
            <h1 className='text-5xl font-poppins leading-10'>Empowering</h1>
            <h1 className='text-5xl font-poppins leading-10'>You to Live Your</h1>
            <h1 className='text-5xl font-poppins leading-10'>Healthiest Life.</h1>
            </div>
            <div className=' mt-5'>
            <p className='text-xl text-gray-400 font-poppins w-[400px]'>From prevention to recovery, we are with you every step of the way with the highest quality service</p>
            </div>
            <div className='px-20 mt-10'>
                <Button className='w-[410px] text-xl font-poppins text-white bg-green-1'>Find A Doctor</Button>
            </div>
        </div>
        <div className='flex items-center justify-center relative'>
            <Image
            src='/images/hot-doc.jpg'
            alt='hot doc'
            width={200}
            height={200}
            className='w-[70%] h-[500px] rounded-md relative'
            />
            <div className='absolute bottom-2 w-[65%] bg-white py-4 px-2 rounded-xl flex flex-row gap-2 items-center'>
                <div className=''>
                    <Image
                    src='/images/dr-cameron.png'
                    alt='doc'
                    width={60}
                    height={60}
                    />
                </div>
                <div className='flex-1'>
                    <h1 className='font-poppins text-lg'>Dr Lisa Manana</h1>
                    <p className='font-poppins text-sm text-gray-400'>Cardiologist</p>
                </div>
                <div className='flex-row flex gap-2'>
                    <div className='border p-3 rounded-full'>
                    <Image
                    src='/images/call.png'
                    alt='image'
                    width={20}
                    height={20}
                    />
                    </div>
                    <div className='border p-3 rounded-full'>
                    <Image
                    src='/images/messenger.png'
                    alt='image'
                    width={20}
                    height={20}
                    />
                    </div>
                </div>
            </div>
        </div>
        <div className='flex flex-col gap-5'>
            {SideData.map((item,index)=>(
                <div key={index}
                className='flex items-start flex-row gap-5'>
                    <div className='border rounded-full p-2 mt-1'>
                        <Image
                        src='/icons/check-mark.png'
                        alt='image'
                        width={20}
                        height={20}
                        className=''
                        style={{ filter: 'invert(45%) sepia(94%) saturate(500%) hue-rotate(120deg)' }}
                        />
                    </div>
                    <div>
                        <h1 className='text-xl font-poppins font-semibold'>{item.top}</h1>
                        <h1 className='text-lg font-poppins text-gray-400'>{item.info}</h1>

                    </div>
                </div>
            ))}
        </div>

    </div>
  )
}

export default HeroTwo