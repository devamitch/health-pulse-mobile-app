import * as React from "react"
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg"

interface ArrowDownIconProps {
  width?: number;
  height?: number;
}

function ArrowDownIcon({ width = 67, height = 80, ...props }: ArrowDownIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 67 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M46.319 0H20.68v46.335H0L33.5 80 67 46.335H46.319V0z"
        fill="url(#paint0_linear_8589_8843)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_8589_8843"
          x1={33.5}
          y1={80}
          x2={33.5}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#C63F2C" />
          <Stop offset={1} stopColor="#C63F2C" stopOpacity={0} />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}

export default ArrowDownIcon
