import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import Icon from './Icon';
import { Banner } from '../api/types';
import { imageUri } from '../api/config';
import { colors, SCREEN_WIDTH, serifItalic } from '../theme';

const SLIDE_WIDTH = SCREEN_WIDTH - 32;
const SLIDE_HEIGHT = Math.round(SLIDE_WIDTH * 0.5);
const AUTO_PLAY_MS = 4500;

// Pink panel whose right edge curves over the photo, outlined in gold.
const PANEL_PATH = 'M0 0H57C51 18 60 34 55 52 50 70 50 86 56 100H0Z';
const EDGE_PATH = 'M57 0C51 18 60 34 55 52 50 70 50 86 56 100';

function Slide({ slide, onPress }: { slide: Banner; onPress?: () => void }) {
  return (
    <View style={styles.slide}>
      <Image
        source={{ uri: imageUri(slide.imageUrl) }}
        style={styles.photo}
        resizeMode="cover"
      />
      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F7E0D8" />
            <Stop offset="1" stopColor="#F0CFC4" />
          </LinearGradient>
        </Defs>
        <Path d={PANEL_PATH} fill="url(#panel)" />
        {/* soft floral lace suggestion */}
        <Circle cx={4} cy={10} r={9} fill="#F3D2C8" opacity={0.55} />
        <Circle cx={7} cy={92} r={11} fill="#F3D2C8" opacity={0.45} />
        <Path
          d={EDGE_PATH}
          stroke={colors.goldLight}
          strokeWidth={2.2}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>

      <View style={styles.copy}>
        <Text style={styles.titleTop} numberOfLines={1} adjustsFontSizeToFit>
          {slide.titleTop}
        </Text>
        <Text style={styles.titleBottom} numberOfLines={1} adjustsFontSizeToFit>
          {slide.titleBottom}
        </Text>
        <Text style={styles.description}>{slide.description}</Text>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>{slide.cta}</Text>
          <Icon
            name="arrowRight"
            size={14}
            color={colors.white}
            strokeWidth={2}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function HeroCarousel({
  banners,
  onOpen,
}: {
  banners?: Banner[];
  onOpen?: (banner: Banner) => void;
}) {
  const heroSlides = banners ?? [];
  const listRef = useRef<FlatList<Banner>>(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (dragging || heroSlides.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      const next = (index + 1) % heroSlides.length;
      listRef.current?.scrollToOffset({
        offset: next * SLIDE_WIDTH,
        animated: true,
      });
      setIndex(next);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [index, dragging, heroSlides.length]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH));
    setDragging(false);
  };

  if (!banners) {
    return <View style={[styles.wrapper, styles.slide]} />;
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={heroSlides}
        keyExtractor={s => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => setDragging(true)}
        onScrollEndDrag={() => setDragging(false)}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => (
          <Slide slide={item} onPress={() => onOpen?.(item)} />
        )}
        getItemLayout={(_, i) => ({
          length: SLIDE_WIDTH,
          offset: SLIDE_WIDTH * i,
          index: i,
        })}
      />
      <View style={styles.dots} pointerEvents="none">
        {heroSlides.map((s, i) => (
          <View
            key={s.id}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.blush,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  },
  photo: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  copy: {
    width: '58%',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 6,
  },
  titleTop: {
    ...serifItalic,
    fontSize: 25,
    color: colors.brown,
    lineHeight: 30,
  },
  titleBottom: {
    ...serifItalic,
    fontSize: 25,
    color: colors.brown,
    lineHeight: 30,
    marginLeft: 26,
  },
  description: {
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.brownSoft,
    marginTop: 6,
    marginLeft: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    marginTop: 10,
    marginLeft: 22,
  },
  ctaText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dots: {
    position: 'absolute',
    bottom: 9,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F2E3D6',
  },
  dotActive: {
    backgroundColor: colors.gold,
  },
});
