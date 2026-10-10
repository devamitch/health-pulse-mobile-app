import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface IconProps {
  width?: number;
  height?: number;
  size?: number;
  color?: string;
  animatedColor?: Animated.SharedValue<string>;
}

// Animated Home Icon
export function AnimatedHomeIcon({
  width,
  height,
  size = 24,
  color = '#FE568D',
  animatedColor,
  ...props
}: IconProps) {
  const w = width || size;
  const h = height || size;

  const animatedProps = useAnimatedProps(() => {
    return {
      stroke: animatedColor?.value ?? color,
    };
  });

  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" fill="none" {...props}>
      <AnimatedPath
        d="M3 11.99v2.51c0 3.3 0 4.95 1.025 5.975C5.05 21.5 6.7 21.5 10 21.5h4c3.3 0 4.95 0 5.975-1.025C21 19.45 21 17.8 21 14.5v-2.51c0-1.682 0-2.522-.356-3.25-.356-.728-1.02-1.244-2.346-2.276l-2-1.555C14.233 3.303 13.2 2.5 12 2.5c-1.2 0-2.233.803-4.298 2.409l-2 1.555C4.375 7.496 3.712 8.012 3.356 8.74 3 9.468 3 10.308 3 11.99z"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
      <AnimatedPath
        d="M15 17c-.8.622-1.85 1-3 1s-2.2-.378-3-1"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

// Animated History Icon
export function AnimatedHistoryIcon({
  width,
  height,
  size = 20,
  color = '#ADB5BD',
  animatedColor,
  ...props
}: IconProps) {
  const w = width || size;
  const h = height || size;

  const animatedProps = useAnimatedProps(() => {
    return {
      stroke: animatedColor?.value ?? color,
    };
  });

  return (
    <Svg width={w} height={h} viewBox="0 0 20 20" fill="none" {...props}>
      <AnimatedPath
        d="M15.833 8.751v-.416c0-3.143 0-4.714-.976-5.69-.976-.977-2.548-.977-5.69-.977-3.143 0-4.714 0-5.69.976-.977.977-.977 2.548-.977 5.69v3.75c0 2.74 0 4.11.757 5.032.138.169.293.323.462.462.922.757 2.291.757 5.03.757M5.834 5.834h6.667M5.834 9.167h3.333"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
      <AnimatedPath
        d="M15 15.415l-1.25-.458v-2.042M10 14.582a3.75 3.75 0 107.5 0 3.75 3.75 0 00-7.5 0z"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

// Animated Plan Icon
export function AnimatedPlanIcon({
  width,
  height,
  size = 20,
  color = '#ADB5BD',
  animatedColor,
  ...props
}: IconProps) {
  const w = width || size;
  const h = height || size;

  const animatedProps = useAnimatedProps(() => {
    return {
      stroke: animatedColor?.value ?? color,
    };
  });

  return (
    <Svg width={w} height={h} viewBox="0 0 20 20" fill="none" {...props}>
      <AnimatedPath
        d="M9.166 5h8.333M9.166 10h8.333M9.166 15h8.333"
        strokeWidth={1.5}
        strokeLinecap="round"
        animatedProps={animatedProps}
      />
      <AnimatedPath
        d="M2.5 6.16s.833.543 1.25 1.339c0 0 1.25-3.125 2.917-4.167M2.5 15.327s.833.544 1.25 1.34c0 0 1.25-3.125 2.917-4.167"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
