'use client'
import { DeviceSettings, useCall, VideoPreview } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Video, Mic, MicOff, VideoOff, Settings, User } from 'lucide-react'

const MeetingSetup = ({setIsSetupComplete}: {setIsSetupComplete : (value: boolean)=> void}) => {

    const [ isMicCamToggledOn, setIsMicCamToggledOn ] = useState(false)

    const call = useCall()

    if(!call) {
        throw new Error('useCall must be used within stream call component')
    }
    useEffect(()=>{
        if(isMicCamToggledOn)
        {
            call?.camera.disable();
            call?.microphone.disable();
        } else {
            call?.camera.enable();
            call?.microphone.enable();
        }    
    },[isMicCamToggledOn, call?.camera, call?.microphone])
  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-gray-50 px-6 font-poppins py-10'>
      {/* Header Section */}
      <div className='text-center space-y-2'>
        <div className='inline-block bg-green-50 border border-green-200 px-4 py-2 mb-4'>
          <p className='text-sm font-medium text-green-600 flex items-center gap-2'>
            <Video className='w-4 h-4' />
            Video Consultation Ready
          </p>
        </div>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900'>
          Consultation <span className='text-green-600'>Setup</span>
        </h1>
        <p className='text-gray-600'>Configure your camera and microphone before joining</p>
      </div>

      {/* Video Preview Card */}
      <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-lg p-6 mx-auto">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Camera Preview
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Check your video and audio settings</p>
                </div>

                {/* ✅ Fixed Video Preview Container */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center">
                    {/* Force the video element to fit correctly */}
                    <div className="absolute inset-0 flex items-center justify-center">
                    <VideoPreview className="w-full h-full object-cover" />
                    </div>

                    {/* Overlay when mic/cam is off */}
                    {isMicCamToggledOn && (
                    <div className="absolute inset-0     flex flex-col items-center justify-center space-y-4 text-center text-white">
                        <div className="flex justify-center gap-4">
                        </div>
                    </div>
                    )}
                </div>



        {/* Controls Section */}
        <div className='space-y-4'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border border-gray-200'>
            <label className='flex items-center gap-3 cursor-pointer'>
              <input 
                type="checkbox" 
                checked={isMicCamToggledOn} 
                onChange={(e)=> setIsMicCamToggledOn(e.target.checked)}
                className='w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500'
              />
              <span className='text-base text-gray-700 font-medium'>
                Join with mic and camera off
              </span>
            </label>
            <DeviceSettings/>
          </div>

          {/* Device Status Indicators */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex items-center gap-3 p-3 bg-gray-50 border border-gray-200'>
              {isMicCamToggledOn ? (
                <VideoOff className='w-5 h-5 text-red-600' />
              ) : (
                <Video className='w-5 h-5 text-green-600' />
              )}
              <div>
                <p className='text-sm font-medium text-gray-900'>Camera</p>
                <p className='text-xs text-gray-600'>
                  {isMicCamToggledOn ? 'Disabled' : 'Enabled'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 p-3 bg-gray-50 border border-gray-200'>
              {isMicCamToggledOn ? (
                <MicOff className='w-5 h-5 text-red-600' />
              ) : (
                <Mic className='w-5 h-5 text-green-600' />
              )}
              <div>
                <p className='text-sm font-medium text-gray-900'>Microphone</p>
                <p className='text-xs text-gray-600'>
                  {isMicCamToggledOn ? 'Disabled' : 'Enabled'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-4 w-full max-w-3xl'>
        <Button 
          variant='outline'
          className='flex-1 py-6 text-lg font-semibold border-2 border-gray-300 hover:bg-gray-50'
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button 
          className='flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold transition-colors shadow-lg'
          onClick={()=> {
            call.join();
            setIsSetupComplete(true);
          }}
        >
          Join Consultation
        </Button>
      </div>

      {/* Info Notice */}
      <div className='max-w-3xl w-full bg-blue-50 border border-blue-200 p-4'>
        <div className='flex items-start gap-3'>
          <div className='text-blue-600 mt-1'>
            <Settings className='w-5 h-5' />
          </div>
          <div>
            <h3 className='text-sm font-semibold text-blue-900 mb-1'>Before You Join</h3>
            <p className='text-sm text-blue-700'>
              Ensure {"you're"} in a quiet environment with good lighting. You can adjust your settings anytime during the consultation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingSetup