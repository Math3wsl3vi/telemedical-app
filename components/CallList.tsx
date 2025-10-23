'use client'
import { useGetCalls } from '@/hooks/useGetCalls'
import { Call, CallRecording } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import React from 'react'
import MeetingCard from './MeetingCard';
import Loader from './Loader';

const CallList = ({type}:{type : 'ended' | 'upcoming' | 'recordings'}) => {
    const { endedCalls, UpcomingCalls, isLoading } = useGetCalls();
    const router = useRouter();

    const isCall = (meeting: Call | CallRecording): meeting is Call => {
        return (meeting as Call).state !== undefined;
    };

    const isCallRecording = (meeting: Call | CallRecording): meeting is CallRecording => {
        return (meeting as CallRecording).filename !== undefined;
    };

    const getCalls = ()=> {
        switch (type) {
            case 'ended':
                return endedCalls;
            case 'upcoming':   
                return UpcomingCalls;
            default:
                return [];
        }
    };

    const getNoCallsMessage = ()=> {
        switch (type) {
            case 'ended':
                return 'No Previous calls';  
            case 'upcoming':   
                return 'No upcoming calls';
            default:
                return '';
        }
    };

    const calls = getCalls();
    const noCallsMessage = getNoCallsMessage();
    if(isLoading) return <Loader/>

    return (
        <div className='grid grid-cols-1 gap-5 xl:grid-cols-3 md:grid-cols-2'>
            {calls && calls.length > 0 ? calls.map((meeting: Call | CallRecording, index) => {
                if (isCall(meeting)) {
                    return (
                        <MeetingCard
                            key={meeting.id}
                            title={meeting.state?.custom.description?.substring(0, 26) || 'Personal Meeting'}
                            icon={type === 'ended' ? '/icons/previous.svg' : type === 'upcoming' ? '/icons/upcoming.svg' : '/icons/recordings.svg'}
                            date={meeting.state?.startsAt?.toLocaleString() || ''}
                            isPreviousMeeting={type === 'ended'}
                            buttonText={type === 'upcoming' ? 'Cancel' : undefined}
                            link={`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meeting.id}`}
                            handleClick={() => router.push(`/meeting/${meeting.id}`)}
                        />
                    );
                } else if (isCallRecording(meeting)) {
                    return (
                        <MeetingCard
                            key={meeting.filename || meeting.url || `recording-${index}`}
                            title={meeting.filename?.substring(0, 20) || 'Recording'}
                            icon="/icons/recordings.svg"
                            date={meeting.start_time?.toLocaleString() || ''}
                            isPreviousMeeting={false}
                            link={meeting.url}
                            handleClick={() => router.push(meeting.url || '')}
                        />
                    );
                }
                return null; // In case no matching type
            }) : (
                <h1>{noCallsMessage}</h1>
            )}
        </div>
    );
};

export default CallList;