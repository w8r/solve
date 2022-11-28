import * as Linking from 'expo-linking';

export function redirectTo(path: string): Promise<true> {
  const platformURL = Linking.makeUrl(path);
  return Linking.openURL(platformURL);
}
