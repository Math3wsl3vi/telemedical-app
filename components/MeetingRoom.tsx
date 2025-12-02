import { cn } from '@/lib/utils'
import { CallControls, CallingState, CallParticipantsList, CallStatsButton, PaginatedGridLayout, SpeakerLayout, useCallStateHooks } from '@stream-io/video-react-sdk'
import React, { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutList, Users, Video, Phone, Clock, Activity } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import EndCallButton from './EndCallButton'
import Loader from './Loader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from './ui/button'

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right'

const MeetingRoom = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPersonalRoom = !!searchParams.get('personal');
  const [layout, setLayout ] = useState<CallLayoutType>('speaker-left')
  const [showParticipants, setShowParticipants ] = useState(false);
  const [isOpen, setIsOpen ] = useState(false)
  const [prevCallState, setPrevCallState] = useState<CallingState | null>(null);

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // Navigate to medication confirmation when call ends (only if it was previously JOINED)
  useEffect(() => {
    if(prevCallState === CallingState.JOINED && callingState !== CallingState.JOINED) {
      const timer = setTimeout(() => {
        router.push('/medicationConfirm');
      }, 300);
      return () => clearTimeout(timer);
    }
    setPrevCallState(callingState);
  }, [callingState, router, prevCallState]);

  if(callingState !== CallingState.JOINED) return <Loader/>

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout/>
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition='left'/>
      default:
        return <SpeakerLayout participantsBarPosition='right'/>
    }
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-900">
      {/* Top Bar - Consultation Info */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-gray-900 to-transparent">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">Video Consultation</h1>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>In Progress</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gray-800 px-4 py-2 border border-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-white text-sm font-medium">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="bg-red-600 px-4 py-2 text-white text-sm font-medium">
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                LIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex size-full items-center justify-center pt-20 pb-24">
        <div className="flex size-full max-w-[1400px] items-center px-4">
          <CallLayout />
        </div>
        
        {/* Participants Sidebar */}
        <div
          className={cn("h-[calc(100vh-140px)] hidden ml-2 bg-gray-800 border-l border-gray-700", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent">
        <div className="px-6 py-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Main Call Controls */}
            <CallControls onLeave={() => {
              setIsOpen(true)
            }} />

            {/* Layout Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer bg-gray-800 border border-gray-700 px-4 py-3 hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-2">
                  <LayoutList size={20} className="text-white" />
                  <span className="text-white text-sm font-medium hidden sm:inline">Layout</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-gray-700 bg-gray-800 text-white">
                {['Grid', 'Speaker-left', 'Speaker-right'].map((item, index) => (
                  <div key={index}>
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-700 text-white focus:bg-gray-700 focus:text-white"
                      onClick={() => {
                        setLayout(item.toLowerCase() as CallLayoutType)
                      }}
                    >
                      {item}
                    </DropdownMenuItem>
                    {index < 2 && <DropdownMenuSeparator className="bg-gray-700" />}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Stats Button */}
            <div className="bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">
              <CallStatsButton />
            </div>

            {/* Participants Button */}
            <button 
              onClick={() => setShowParticipants((prev) => !prev)}
              className="bg-gray-800 border border-gray-700 px-4 py-3 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users size={20} className="text-white" />
                <span className="text-white text-sm font-medium hidden sm:inline">
                  Participants
                </span>
              </div>
            </button>

            {/* End Call Button */}
            {!isPersonalRoom && <EndCallButton />}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border-none shadow-2xl max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4">
                <Phone className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              End Consultation?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 text-base pt-2">
              Are you sure you want to leave this consultation? This will end the video call and {"you'll"} return to the home page.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-6 text-base font-semibold border-2 border-gray-300 hover:bg-gray-50"
            >
              Stay in Call
            </Button>
            <Button
              onClick={() => {
                setIsOpen(false)
                router.push('/medicationConfirm')
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-base font-semibold"
            >
              End Consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default MeetingRoom