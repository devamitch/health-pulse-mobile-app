import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export const WaterDroplet = ({
  filled = false,
  size = 40,
}: {
  filled?: boolean;
  size?: number;
}) => (
  <View style={{ marginHorizontal: 8 }}>
    <Svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
    >
      <Path
        d="M5.833 22.797c0-6.973 5.968-13.865 10.157-17.843 2.275-2.16 5.745-2.16 8.02 0 4.188 3.978 10.156 10.87 10.156 17.843 0 6.838-5.364 13.87-14.166 13.87S5.833 29.635 5.833 22.797z"
        stroke={filled ? '#0E87CC' : '#141B34'}
        strokeWidth={1.5}
        fill={filled ? '#0E87CC' : 'transparent'}
      />
      <Path
        d="M26.667 23.334A6.667 6.667 0 0120 30.001"
        stroke={filled ? '#FFFFFF' : '#141B34'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);
