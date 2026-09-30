import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

export default function ScreenTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={90} height={10} viewBox="0 0 80 10">
        <Path
          d="M6 5h26M48 5h26"
          stroke={colors.goldLight}
          strokeWidth={0.8}
          strokeLinecap="round"
        />
        <Path d="M40 1.5l3 3.5-3 3.5-3-3.5z" fill={colors.gold} />
      </Svg>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 10, paddingBottom: 12 },
  title: {
    fontFamily: fonts.serifMedium,
    fontSize: 28,
    color: colors.brown,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
