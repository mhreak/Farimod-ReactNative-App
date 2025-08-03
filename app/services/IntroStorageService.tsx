import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_COMPLETION_KEY = '@intro_completed';

export class IntroStorageService {
  static async isIntroCompleted() {
    try {
      const value = await AsyncStorage.getItem(INTRO_COMPLETION_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking intro completion status:', error);
      return false;
    }
  }

  static async markIntroAsCompleted() {
    try {
      await AsyncStorage.setItem(INTRO_COMPLETION_KEY, 'true');
      console.log('Intro marked as completed');
    } catch (error) {
      console.error('Error marking intro as completed:', error);
    }
  }

  static async resetIntroStatus() {
    try {
      await AsyncStorage.removeItem(INTRO_COMPLETION_KEY);
      console.log('Intro status reset');
    } catch (error) {
      console.error('Error resetting intro status:', error);
    }
  }
}