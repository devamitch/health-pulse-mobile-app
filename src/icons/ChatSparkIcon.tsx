import Svg, { Path } from 'react-native-svg';

interface ChatSparkIconProps {
  width?: number;
  height?: number;
  color?: string;
}

function ChatSparkIcon({
  width = 24,
  height = 24,
  color = '#ADB5BD',
  ...props
}: ChatSparkIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M18.47 2.025c.006-.033.054-.033.06 0a4.419 4.419 0 003.445 3.444c.033.007.033.055 0 .062a4.419 4.419 0 00-3.444 3.444c-.007.033-.055.033-.062 0a4.419 4.419 0 00-3.444-3.444c-.033-.007-.033-.055 0-.062a4.419 4.419 0 003.444-3.444z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.992 11H12m-4.005 0h.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 3.005a99.735 99.735 0 00-5.244.083c-2.44.105-3.66.157-4.626 1.13-.965.972-1.007 2.159-1.09 4.532a63.924 63.924 0 000 4.5c.083 2.373.125 3.56 1.09 4.532.965.973 2.186 1.025 4.626 1.13l.244.01v2.348a.73.73 0 001.205.554l2.18-1.869c.547-.47.821-.704 1.147-.828.326-.124.696-.131 1.437-.145.78-.015 1.54-.039 2.275-.07 2.44-.105 3.66-.157 4.626-1.13.965-.972 1.007-2.159 1.09-4.532a63.997 63.997 0 00.023-3.75"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default ChatSparkIcon;

interface ChatSparkIconProps {
  width?: number;
  height?: number;
  color?: string;
}
