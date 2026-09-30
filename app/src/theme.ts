import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const colors = {
  background: '#FCF5EC',
  surface: '#FFFAF4',
  tile: '#F8ECE1',
  border: '#EEDFCD',
  gold: '#B8863A',
  goldDark: '#9C6F2B',
  goldLight: '#D4AA62',
  brown: '#5B3520',
  brownSoft: '#7A5236',
  text: '#3E2A1E',
  textMuted: '#8C7462',
  price: '#B0283A',
  blush: '#F5D9D1',
  blushDeep: '#EFC7BD',
  rose: '#E86C7E',
  white: '#FFFFFF',
};

export const fonts = {
  logo: 'Cinzel-SemiBold',
  logoMedium: 'Cinzel-Medium',
  serif: 'PlayfairDisplay-Regular',
  serifMedium: 'PlayfairDisplay-Medium',
  serifSemiBold: 'PlayfairDisplay-SemiBold',
  serifItalic: 'PlayfairDisplay-Italic',
  serifMediumItalic: 'PlayfairDisplay-MediumItalic',
};

// iOS picks the italic font face from fontFamily + fontStyle; on Android the
// italic font file is chosen by name alone, and adding fontStyle makes it fall
// back to the system font.
export const serifItalic = {
  fontFamily: fonts.serifItalic,
  ...(Platform.OS === 'ios' ? { fontStyle: 'italic' as const } : {}),
};

export const serifMediumItalic = {
  fontFamily: fonts.serifMediumItalic,
  ...(Platform.OS === 'ios' ? { fontStyle: 'italic' as const } : {}),
};

export const formatPrice = (value: number) =>
  `৳ ${value.toLocaleString('en-US')}`;
