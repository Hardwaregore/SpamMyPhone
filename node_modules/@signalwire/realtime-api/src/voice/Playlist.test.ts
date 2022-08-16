import { Playlist } from './Playlist'

describe('Playlist', () => {
  it('should build a list of devices to dial', () => {
    const playlist = new Playlist()
    playlist.add(Playlist.Audio({ url: 'https://example.com/hello.mp3' }))
    playlist.add(Playlist.Silence({ duration: 5 }))
    playlist.add(Playlist.TTS({ text: 'Hello World' }))
    playlist.add(Playlist.Ringtone({ name: 'us' }))
    playlist.add(Playlist.Audio({ url: 'https://example.com/hello2.mp3' }))

    expect(playlist.media).toStrictEqual([
      {
        type: 'audio',
        url: 'https://example.com/hello.mp3',
      },
      {
        type: 'silence',
        duration: 5,
      },
      {
        type: 'tts',
        text: 'Hello World',
      },
      {
        type: 'ringtone',
        name: 'us',
      },
      {
        type: 'audio',
        url: 'https://example.com/hello2.mp3',
      },
    ])
  })

  it('should build a list of devices to dial including volume', () => {
    const playlist = new Playlist({ volume: 2 })
    playlist.add(Playlist.Audio({ url: 'https://example.com/hello.mp3' }))
    playlist.add(Playlist.Silence({ duration: 5 }))
    playlist.add(Playlist.TTS({ text: 'Hello World' }))

    expect(playlist.volume).toBe(2)
    expect(playlist.media).toStrictEqual([
      {
        type: 'audio',
        url: 'https://example.com/hello.mp3',
      },
      {
        type: 'silence',
        duration: 5,
      },
      {
        type: 'tts',
        text: 'Hello World',
      },
    ])
  })
})
