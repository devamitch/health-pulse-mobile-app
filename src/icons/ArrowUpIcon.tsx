import * as React from "react"
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg"

interface ArrowUpIconProps {
  width?: number;
  height?: number;
  isPositive?: boolean;
}

function ArrowUpIcon({ width = 67, height = 80, isPositive = true, ...props }: ArrowUpIconProps) {
  return (
   <Svg
      width={67}
      height={80}
      viewBox="0 0 67 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M46.319 80H20.68V33.665H0L33.5 0 67 33.665H46.319V80z"
        fill="url(#paint0_linear_8564_8433)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_8564_8433"
          x1={33.5}
          y1={0}
          x2={33.5}
          y2={80}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#27A864" />
          <Stop offset={1} stopColor="#27A864" stopOpacity={0} />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}

export default ArrowUpIcon
