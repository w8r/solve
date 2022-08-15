import uuid from 'react-native-uuid';

export default function uuuid(): string {
  return uuid.v4() as string;
}
