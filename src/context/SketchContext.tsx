import React, { createContext, ReactNode, useState } from 'react'

interface SketchState {
  gamePaused: boolean,
  audioMuted: boolean,
  menuSize: number,
  toggleAudio: () => void,
  togglePause: () => void,
  setAudioMuted: React.Dispatch<React.SetStateAction<boolean>>
}

interface SketchProviderProps {
  children: ReactNode
}

export const SketchContext = createContext<SketchState>({} as SketchState)

export const SketchProvider = ({ children }: SketchProviderProps) => {
  const [gamePaused, setGamePaused] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const menuSize = 4

  function toggleAudio() {
    setAudioMuted(!audioMuted)
  }

  function togglePause() {
    setGamePaused(!gamePaused)
  }

  const value = {
    gamePaused,
    audioMuted,
    menuSize,
    toggleAudio,
    togglePause,
    setAudioMuted
  }

  return (
    <SketchContext.Provider value={value}>
      {children}
    </SketchContext.Provider>
  )
}