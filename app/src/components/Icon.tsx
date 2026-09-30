import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
  | 'menu'
  | 'heart'
  | 'bell'
  | 'search'
  | 'camera'
  | 'bag'
  | 'shop'
  | 'home'
  | 'calendar'
  | 'truck'
  | 'pin'
  | 'arrowRight'
  | 'chevronRight'
  | 'chevronLeft'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'check'
  | 'clock'
  | 'user'
  | 'box'
  | 'logout'
  | 'phone'
  | 'chat'
  | 'mail'
  | 'info'
  | 'help'
  | 'close'
  | 'edit'
  | 'tag'
  | 'cash'
  | 'wallet'
  | 'grid';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
  strokeWidth?: number;
};

export default function Icon({
  name,
  size = 24,
  color = colors.gold,
  filled = false,
  strokeWidth = 1.6,
}: Props) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const fill = filled ? color : 'none';

  const render = () => {
    switch (name) {
      case 'menu':
        return <Path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" {...stroke} />;
      case 'heart':
        return (
          <Path
            d="M12 20.3s-7.6-4.6-9.4-9.3C1.4 7.8 3.6 4.4 7.1 4.4c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.5 0 5.7 3.4 4.5 6.6-1.8 4.7-9.4 9.3-9.4 9.3z"
            {...stroke}
            fill={fill}
          />
        );
      case 'bell':
        return (
          <>
            <Path
              d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.6 2H4.4l1.6-2z"
              {...stroke}
              fill={fill}
            />
            <Path d="M10 20.5a2 2 0 0 0 4 0M12 3v2" {...stroke} />
          </>
        );
      case 'search':
        return (
          <>
            <Circle cx={10.8} cy={10.8} r={6.6} {...stroke} />
            <Path d="M15.8 15.8l4.7 4.7" {...stroke} />
          </>
        );
      case 'camera':
        return (
          <>
            <Path
              d="M3.5 8.5a1.5 1.5 0 0 1 1.5-1.5h2.4l1.5-2.2h6.2l1.5 2.2H19a1.5 1.5 0 0 1 1.5 1.5v9.2A1.5 1.5 0 0 1 19 19.2H5a1.5 1.5 0 0 1-1.5-1.5z"
              {...stroke}
            />
            <Circle cx={12} cy={12.9} r={3.3} {...stroke} />
          </>
        );
      case 'bag':
        return (
          <>
            <Path
              d="M5.2 8.5h13.6l-.9 11.2a1.5 1.5 0 0 1-1.5 1.3H7.6a1.5 1.5 0 0 1-1.5-1.3z"
              {...stroke}
              fill={fill}
            />
            <Path d="M9 10V7a3 3 0 0 1 6 0v3" {...stroke} />
          </>
        );
      case 'shop':
        return (
          <>
            <Rect
              x={4.5}
              y={7.5}
              width={15}
              height={13.5}
              rx={1.8}
              {...stroke}
              fill={fill}
            />
            <Path d="M8.5 10.5V7a3.5 3.5 0 0 1 7 0v3.5" {...stroke} />
          </>
        );
      case 'home':
        return filled ? (
          <>
            <Path
              d="M3 11.2 12 3.8l9 7.4-1.2 1.4-1.3-1V21h-4.8v-5.8h-3.4V21H5.5v-9.4l-1.3 1z"
              fill={color}
            />
          </>
        ) : (
          <>
            <Path d="M3.5 11.2 12 4.2l8.5 7" {...stroke} />
            <Path d="M5.8 9.6V20.5h12.4V9.6" {...stroke} />
            <Path d="M10 20.5v-5.5h4v5.5" {...stroke} />
          </>
        );
      case 'calendar':
        return (
          <>
            <Rect
              x={3.5}
              y={5}
              width={17}
              height={15.5}
              rx={2.2}
              {...stroke}
              fill={filled ? color : 'none'}
            />
            <Path d="M3.5 9.8h17M8 3v4M16 3v4" {...stroke} />
            {[8, 12, 16].map(x =>
              [13.3, 17].map(y => (
                <Rect
                  key={`${x}-${y}`}
                  x={x - 1}
                  y={y - 1}
                  width={2}
                  height={2}
                  rx={0.4}
                  fill={color}
                />
              )),
            )}
          </>
        );
      case 'truck':
        return (
          <>
            <Path
              d="M5 6.5h9.5v10H5M14.5 9.5h3.6l2.9 3.4v3.6h-6.5"
              {...stroke}
            />
            <Path d="M1.5 9.5h5M2.5 12.5h4" {...stroke} />
            <Circle
              cx={8}
              cy={17.5}
              r={1.8}
              {...stroke}
              fill={colors.surface}
            />
            <Circle
              cx={17.2}
              cy={17.5}
              r={1.8}
              {...stroke}
              fill={colors.surface}
            />
          </>
        );
      case 'pin':
        return (
          <>
            <Path
              d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"
              {...stroke}
            />
            <Circle cx={12} cy={10} r={2.4} {...stroke} />
          </>
        );
      case 'arrowRight':
        return <Path d="M4.5 12h15M13.5 6l6 6-6 6" {...stroke} />;
      case 'chevronRight':
        return <Path d="M9 5l7 7-7 7" {...stroke} />;
      case 'chevronLeft':
        return <Path d="M15 5l-7 7 7 7" {...stroke} />;
      case 'plus':
        return <Path d="M12 5v14M5 12h14" {...stroke} />;
      case 'minus':
        return <Path d="M5 12h14" {...stroke} />;
      case 'trash':
        return (
          <Path
            d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.9 12.5a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7M10 11v6M14 11v6"
            {...stroke}
          />
        );
      case 'check':
        return <Path d="M5 12.5l4.5 4.5L19 7.5" {...stroke} />;
      case 'user':
        return (
          <>
            <Circle cx={12} cy={8.5} r={4} {...stroke} />
            <Path
              d="M4.5 20.5c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2"
              {...stroke}
            />
          </>
        );
      case 'box':
        return (
          <>
            <Path
              d="M3.8 7.6 12 3.5l8.2 4.1v8.8L12 20.5l-8.2-4.1z"
              {...stroke}
            />
            <Path
              d="M3.8 7.6 12 11.7l8.2-4.1M12 11.7v8.8M7.9 5.5l8.2 4.1"
              {...stroke}
            />
          </>
        );
      case 'logout':
        return (
          <Path
            d="M14.5 4.5H18a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3.5M10 8l-4 4 4 4M6 12h9.5"
            {...stroke}
          />
        );
      case 'phone':
        return (
          <Path
            d="M6.6 3.5h2.6l1.4 4-2 1.4a11 11 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a1.8 1.8 0 0 1-2 1.8A16.5 16.5 0 0 1 4.8 5.5a1.8 1.8 0 0 1 1.8-2z"
            {...stroke}
          />
        );
      case 'chat':
        return (
          <>
            <Path
              d="M12 3.8a8.2 8.2 0 0 0-7.1 12.3L3.8 20.2l4.2-1.1A8.2 8.2 0 1 0 12 3.8z"
              {...stroke}
            />
            <Path
              d="M8.5 12h.01M12 12h.01M15.5 12h.01"
              {...stroke}
              strokeWidth={2.4}
            />
          </>
        );
      case 'mail':
        return (
          <>
            <Rect x={3.5} y={5.5} width={17} height={13} rx={2} {...stroke} />
            <Path d="M4 7l8 6 8-6" {...stroke} />
          </>
        );
      case 'info':
        return (
          <>
            <Circle cx={12} cy={12} r={8.5} {...stroke} />
            <Path d="M12 11v5.5M12 7.8h.01" {...stroke} strokeWidth={2} />
          </>
        );
      case 'help':
        return (
          <>
            <Circle cx={12} cy={12} r={8.5} {...stroke} />
            <Path
              d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6M12 17h.01"
              {...stroke}
            />
          </>
        );
      case 'close':
        return <Path d="M6 6l12 12M18 6 6 18" {...stroke} />;
      case 'edit':
        return (
          <Path
            d="M4.5 19.5h4l10-10a2.1 2.1 0 0 0-4-4l-10 10zM13.5 6.5l4 4"
            {...stroke}
          />
        );
      case 'tag':
        return (
          <>
            <Path
              d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.7 6.7a1.4 1.4 0 0 1-2 0z"
              {...stroke}
            />
            <Circle cx={8} cy={8} r={1.4} {...stroke} />
          </>
        );
      case 'cash':
        return (
          <>
            <Rect x={2.5} y={6} width={19} height={12} rx={2} {...stroke} />
            <Circle cx={12} cy={12} r={2.6} {...stroke} />
            <Path d="M6 9.5v5M18 9.5v5" {...stroke} />
          </>
        );
      case 'wallet':
        return (
          <>
            <Path
              d="M4 7.5A2 2 0 0 1 6 5.5h11.5v3M4 7.5v10a2 2 0 0 0 2 2h14v-11H6a2 2 0 0 1-2-1z"
              {...stroke}
            />
            <Path d="M16 14h.01" {...stroke} strokeWidth={2.6} />
          </>
        );
      case 'grid':
        return (
          <>
            <Rect x={4} y={4} width={6.5} height={6.5} rx={1.5} {...stroke} />
            <Rect
              x={13.5}
              y={4}
              width={6.5}
              height={6.5}
              rx={1.5}
              {...stroke}
            />
            <Rect
              x={4}
              y={13.5}
              width={6.5}
              height={6.5}
              rx={1.5}
              {...stroke}
            />
            <Rect
              x={13.5}
              y={13.5}
              width={6.5}
              height={6.5}
              rx={1.5}
              {...stroke}
            />
          </>
        );
      case 'clock':
        return (
          <>
            <Circle cx={12} cy={12} r={8.5} {...stroke} />
            <Path d="M12 7.5V12l3 2" {...stroke} />
          </>
        );
    }
  };

  return (
    <Svg pointerEvents="none" width={size} height={size} viewBox="0 0 24 24">
      {render()}
    </Svg>
  );
}
