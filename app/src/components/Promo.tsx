import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import Icon from './Icon';
import { colors, fonts } from '../theme';

export function SectionHeader({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <Pressable hitSlop={8} onPress={onViewAll} style={styles.viewAll}>
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}

// A soft vanity-mirror illustration for the right side of the banner.
function Vanity() {
  return (
    <Svg
      pointerEvents="none"
      width={120}
      height={90}
      viewBox="0 0 120 90"
      style={styles.vanity}
    >
      <Rect x={30} y={8} width={70} height={50} rx={6} fill="#F8E6DE" />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <Circle key={`t${i}`} cx={34 + i * 12.4} cy={8} r={3} fill="#FFF6E8" />
      ))}
      {[0, 1, 2, 3].map(i => (
        <Circle key={`s${i}`} cx={100} cy={16 + i * 13} r={3} fill="#FFF6E8" />
      ))}
      <Rect x={20} y={60} width={100} height={30} rx={3} fill="#E8C3B5" />
      <Path d="M45 30c4-10 14-10 16 0-6 6-12 6-16 0z" fill="#F2C6CB" />
      <Circle cx={48} cy={28} r={4} fill="#F7D7DB" />
    </Svg>
  );
}

export function AppointmentBanner({ onBook }: { onBook?: () => void }) {
  return (
    <LinearGradient
      colors={['#F7DCD4', '#F3D1C7', '#EFC9BE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <Vanity />
      <View style={styles.iconCircle}>
        <Icon name="calendar" size={30} color={colors.gold} strokeWidth={1.5} />
      </View>
      <View style={styles.bannerBody}>
        <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>
          Book bridal appointment
        </Text>
        <Text style={styles.bannerText}>
          Get expert consultation, professional makeup & complete bridal styling
          at our salon.
        </Text>
      </View>
      <Pressable
        onPress={onBook}
        style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.bookText}>Book Now</Text>
        <Icon
          name="arrowRight"
          size={13}
          color={colors.brown}
          strokeWidth={1.8}
        />
      </Pressable>
    </LinearGradient>
  );
}

export function InfoStrip() {
  return (
    <View style={styles.info}>
      <View style={styles.infoItem}>
        <Icon
          name="truck"
          size={24}
          color={colors.brownSoft}
          strokeWidth={1.4}
        />
        <Text style={styles.infoText}>Delivery across Bangladesh</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.infoItem}>
        <Icon name="pin" size={22} color={colors.brownSoft} strokeWidth={1.4} />
        <Text style={styles.infoText}>Cash on Delivery Available</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 26,
    color: colors.brown,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 4,
  },
  viewAllText: { color: colors.gold, fontSize: 14 },
  banner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 14,
    paddingLeft: 12,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  vanity: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    opacity: 0.7,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F9E6DF',
    borderWidth: 1,
    borderColor: '#EDC9BD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBody: { flex: 1, marginLeft: 10, marginRight: 6 },
  bannerTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: '#8A4B32',
  },
  bannerText: {
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.brownSoft,
    marginTop: 3,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    backgroundColor: '#F6CFC6',
    borderWidth: 1,
    borderColor: '#EDB9AE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  bookText: { fontSize: 12, color: colors.brown, fontWeight: '500' },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.tile,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  infoText: { fontSize: 11, color: colors.text, flexShrink: 1 },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.brownSoft,
    opacity: 0.5,
    marginHorizontal: 4,
  },
});
