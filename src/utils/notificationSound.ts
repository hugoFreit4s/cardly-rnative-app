import { Audio } from 'expo-av';

let lastPlayedAt = 0;

export async function playNotificationSound(): Promise<void> {
  const now = Date.now();
  if (now - lastPlayedAt < 1500) {
    return;
  }
  lastPlayedAt = now;
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(require('../../assets/notification.wav'));
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        void sound.unloadAsync();
      }
    });
    await sound.playAsync();
  } catch {
  }
}
