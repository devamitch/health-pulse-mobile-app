import { ColorScheme } from "@/constants/theme";
import { getGamingDesign } from "@/screens/home/ProgressSummaryScreen";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
Text,
View,
} from 'react-native';import Animated, {
Easing,
useAnimatedProps,
useAnimatedStyle,
useSharedValue,
withRepeat,
withSequence,
withSpring,
withTiming,
} from 'react-native-reanimated';
import Svg, {
Circle,
ClipPath,
Defs,
G,
Path,
Stop,
LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

interface GamingProgressRingProps {
  progress: number;
  color: string;
  gradientColors: [string, string, string];
  size?: number;
  showWaterDrop?: boolean;
  Colors: ColorScheme;
  DESIGN: ReturnType<typeof getGamingDesign>;
}
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const GamingProgressRing: React.FC<GamingProgressRingProps> = ({
  progress,
  color,
  gradientColors,
  size = CIRCLE_SIZE,
  showWaterDrop = false,
  Colors,
  DESIGN,
}) => {
  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const wavePhase = useSharedValue(0);
  const fillLevel = useSharedValue(0);
  const [waterDrops, setWaterDrops] = useState<number[]>([]);

  const innerSize = size - 16;
  const center = innerSize / 2;
  const radius = innerSize / 2 - 2;

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 15,
      stiffness: 60,
    });

    fillLevel.value = withTiming(progress * 100, {
      duration: 1800,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    });

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1500 }),
        withTiming(0.25, { duration: 1500 }),
      ),
      -1,
      true,
    );

    wavePhase.value = withRepeat(
      withTiming(2 * Math.PI, { duration: 2500, easing: Easing.linear }),
      -1,
      false,
    );

    // Trigger water drops on progress increase
    if (showWaterDrop && progress > 0) {
      const drops = Array.from({ length: 5 }, (_, i) => i);
      setWaterDrops(drops);
    }
  }, [
    progress,
    showWaterDrop,
    animatedProgress,
    fillLevel,
    pulseScale,
    glowOpacity,
    wavePhase,
  ]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const waveAnimatedProps = useAnimatedProps(() => {
    const fill = fillLevel.value / 100;
    const phase = wavePhase.value;
    const waveHeight = 8 + (1 - fill) * 6;
    const liquidY = innerSize - fill * innerSize;

    let path = `M 0 ${liquidY}`;
    for (let x = 0; x <= innerSize; x += 2) {
      const y =
        liquidY + Math.sin((x / innerSize) * 4 * Math.PI + phase) * waveHeight;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${innerSize} ${innerSize} L 0 ${innerSize} Z`;

    return { d: path };
  });

  const wave2AnimatedProps = useAnimatedProps(() => {
    const fill = fillLevel.value / 100;
    const phase = wavePhase.value + Math.PI * 0.7;
    const waveHeight = 5 + (1 - fill) * 4;
    const liquidY = innerSize - fill * innerSize;

    let path = `M 0 ${liquidY}`;
    for (let x = 0; x <= innerSize; x += 2) {
      const y =
        liquidY +
        Math.sin((x / innerSize) * 3.5 * Math.PI + phase) * waveHeight;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${innerSize} ${innerSize} L 0 ${innerSize} Z`;

    return { d: path };
  });

  return (
    <View
      style={{
        width: size + 40,
        height: size + 40,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Outer Glow */}

      {/* Pulse Ring */}

      {/* Water Drops */}
      {waterDrops.map(i => (
        <WaterDrop
          key={i}
          color={gradientColors[0]}
          delay={i * 100}
          startX={(Math.random() - 0.5) * 40}
        />
      ))}

      {/* Main Ring */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: color + '40',
        }}
      >
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: DESIGN.colors.gaming.cardBg,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <Svg
            width={innerSize}
            height={innerSize}
            style={{ position: 'absolute' }}
          >
            <Defs>
              <SvgLinearGradient
                id="liquid-gradient-main"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                {gradientColors.map((col, idx) => (
                  <Stop
                    key={idx}
                    offset={`${(idx / (gradientColors.length - 1)) * 100}%`}
                    stopColor={col}
                    stopOpacity={0.9 - idx * 0.1}
                  />
                ))}
              </SvgLinearGradient>

              <SvgLinearGradient
                id="liquid-gradient-light"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <Stop
                  offset="0%"
                  stopColor={gradientColors[0]}
                  stopOpacity="0.6"
                />
                <Stop
                  offset="100%"
                  stopColor={gradientColors[1]}
                  stopOpacity="0.4"
                />
              </SvgLinearGradient>

              <ClipPath id="circle-clip-main">
                <Circle cx={center} cy={center} r={radius} />
              </ClipPath>
            </Defs>

            <G clipPath="url(#circle-clip-main)">
              <AnimatedPath
                animatedProps={wave2AnimatedProps}
                fill="url(#liquid-gradient-light)"
              />
              <AnimatedPath
                animatedProps={waveAnimatedProps}
                fill="url(#liquid-gradient-main)"
              />
            </G>
          </Svg>

          {/* Text Overlay */}
          <View style={{ zIndex: 10, alignItems: 'center' }}>
            <Text
              style={[
                DESIGN.typography.heroTitle,
                {
                  color: progress > 0.45 ? Colors.white : color,
                  fontSize: 42,
                  textShadowColor: Colors.isDark
                    ? 'rgba(0,0,0,0.5)'
                    : 'rgba(0,0,0,0.15)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 3,
                },
              ]}
            >
              {Math.round(progress * 100)}%
            </Text>
            <Text
              style={[
                DESIGN.typography.caption,
                {
                  color: progress > 0.45 ? Colors.white : Colors.textSecondary,
                  marginTop: -4,
                },
              ]}
            >
              Complete
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
