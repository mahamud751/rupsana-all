import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon, { IconName } from './Icon';
import { colors, fonts } from '../theme';
import { imageUri } from '../api/config';

/** Page wrapper that keeps content below the status bar / notch. */
export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

/** Top bar for pushed screens: back button, serif title, optional action. */
export function StackHeader({
  title,
  right,
  onBack,
  icon = 'chevronLeft',
}: {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
  icon?: IconName;
}) {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <Pressable
        hitSlop={10}
        onPress={onBack ?? (() => navigation.goBack())}
        style={styles.headerBtn}
      >
        <Icon name={icon} size={22} color={colors.brown} strokeWidth={2} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function GoldButton({
  title,
  onPress,
  disabled,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={disabled ? ['#DCC9AE', '#D2BD9F'] : ['#C99A4E', '#A97A33']}
        style={styles.goldBtn}
      >
        {icon && <Icon name={icon} size={19} color={colors.white} />}
        <Text style={styles.goldText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({
  title,
  onPress,
  icon,
  danger,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const tint = danger ? colors.price : colors.gold;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outlineBtn,
        { borderColor: tint },
        style,
        pressed && styles.pressed,
      ]}
    >
      {icon && <Icon name={icon} size={18} color={tint} />}
      <Text style={[styles.outlineText, { color: tint }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  multiline,
  autoCapitalize,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          !!error && styles.inputError,
        ]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function EmptyState({
  icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: IconName;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={42} strokeWidth={1.3} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {action && onAction && (
        <GoldButton title={action} onPress={onAction} style={styles.emptyBtn} />
      )}
    </View>
  );
}

export function SummaryRow({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={strong ? styles.summaryStrongLabel : styles.summaryLabel}>
        {label}
      </Text>
      <Text
        style={[
          strong ? styles.summaryStrongValue : styles.summaryValue,
          accent && styles.accent,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Small product photo. The sample photos come from the design mockup with a
 * heart icon baked into their top edge, so the image is bottom-anchored and
 * slightly taller than its frame to crop that area off.
 */
export function ProductThumb({
  source,
  width,
  height,
}: {
  source: ImageSourcePropType | string;
  width: number;
  height: number;
}) {
  return (
    <View style={[styles.thumb, { width, height }]}>
      <Image
        source={typeof source === 'string' ? { uri: imageUri(source) } : source}
        style={[
          styles.thumbImage,
          { height: Math.max(height, width * 1.16) * 1.18 },
        ]}
      />
    </View>
  );
}

export function LoadingView({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.centered, style]}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
}

/** Friendly error with a retry button, for failed API requests. */
export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.errorBox}>
      <View style={styles.emptyIcon}>
        <Icon name="info" size={40} strokeWidth={1.3} />
      </View>
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptyText}>{message}</Text>
      {onRetry && (
        <OutlineButton
          title="Try again"
          onPress={onRetry}
          style={styles.emptyBtn}
        />
      )}
    </View>
  );
}

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> =
  {
    placed: { bg: '#FBEBD3', fg: '#9C6F2B', label: 'Placed' },
    confirmed: { bg: '#E3EEFB', fg: '#2F5E9E', label: 'Confirmed' },
    shipped: { bg: '#EDE4FA', fg: '#6A45A8', label: 'Shipped' },
    delivered: { bg: '#E1F3E7', fg: '#2E7D4F', label: 'Delivered' },
    cancelled: { bg: '#F8E0E2', fg: '#B0283A', label: 'Cancelled' },
    requested: { bg: '#FBEBD3', fg: '#9C6F2B', label: 'Requested' },
    completed: { bg: '#E1F3E7', fg: '#2E7D4F', label: 'Completed' },
    pending: { bg: '#FBEBD3', fg: '#9C6F2B', label: 'Payment pending' },
    paid: { bg: '#E1F3E7', fg: '#2E7D4F', label: 'Paid' },
    refunded: { bg: '#EDE4FA', fg: '#6A45A8', label: 'Refunded' },
  };

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status.toLowerCase()] ?? STATUS_STYLE.placed;
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.pillText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tile,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.serifMedium,
    fontSize: 21,
    color: colors.brown,
  },
  headerRight: { minWidth: 40, alignItems: 'flex-end' },
  goldBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  goldText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  outlineBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
  },
  outlineText: { fontSize: 15, fontWeight: '600' },
  field: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 13,
    color: colors.brownSoft,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  inputMultiline: { minHeight: 84, paddingTop: 12, textAlignVertical: 'top' },
  inputError: { borderColor: colors.price },
  error: { color: colors.price, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  sectionTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: colors.brown,
    marginTop: 20,
    marginBottom: 10,
  },
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 60 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorBox: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 22,
    color: colors.brown,
    marginTop: 18,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: { marginTop: 22, alignSelf: 'stretch' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { color: colors.textMuted, fontSize: 14 },
  summaryValue: { color: colors.text, fontSize: 14 },
  summaryStrongLabel: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: colors.brown,
  },
  accent: { color: '#2E7D4F' },
  summaryStrongValue: { fontSize: 18, color: colors.price, fontWeight: '700' },
  thumb: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.blush,
  },
  thumbImage: { position: 'absolute', bottom: 0, width: '100%' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pillText: { fontSize: 11.5, fontWeight: '600' },
});
