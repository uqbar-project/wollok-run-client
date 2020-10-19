import { SoundState } from './GameStates'
import p5 from 'p5'

export class GameSound {
  private lastSoundState: SoundState
  private soundFile: p5.SoundFile
  private started: boolean
  public toBePlayed: boolean

  constructor(lastSoundState: SoundState, soundPath: string) {
    this.lastSoundState = lastSoundState
    this.soundFile = new p5.SoundFile(soundPath)
    this.started = false
    this.toBePlayed = false
  }

  private canBePlayed(newSoundState: SoundState): boolean {
    return (this.lastSoundState.status !== newSoundState.status || !this.started) && this.soundFile.isLoaded()
  }

  public update(newSoundState: SoundState): void {
    this.soundFile.setLoop(newSoundState.loop)
    this.soundFile.setVolume(newSoundState.volume)
    this.toBePlayed = this.canBePlayed(newSoundState)
    this.lastSoundState = newSoundState
  }

  public playSound(): void {
    if (this.toBePlayed) {
      this.started = true

      switch (this.lastSoundState.status) {
        case 'played': {
          this.soundFile.play()
          break
        }
        case 'paused': {
          this.soundFile.pause()
          break
        }
        case 'stopped': {
          this.soundFile.stop()
        }
      }
    }

  }

  public stopSound(): void {
    this.soundFile.stop()
  }
}