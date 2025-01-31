import {
    CancelCallButton,
    SpeakingWhileMutedNotification,
    ToggleAudioPublishingButton,
    ToggleVideoPublishingButton,
  } from "@stream-io/video-react-sdk";
import React from 'react'

import type { CallControlsProps } from "@stream-io/video-react-sdk";

const CallControllers = ({ onLeave }: CallControlsProps)) => {
  return (
    <div>
          <SpeakingWhileMutedNotification>
      <ToggleAudioPublishingButton />
    </SpeakingWhileMutedNotification>
    <ToggleVideoPublishingButton />
    <CancelCallButton onLeave={onLeave} />
    </div>
  )
}

export default CallControllers