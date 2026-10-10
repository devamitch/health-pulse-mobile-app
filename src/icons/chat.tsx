import Svg, { Circle, Defs, G, Path, SvgProps } from 'react-native-svg';

export function SendIcon(props: SvgProps) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.402 6.673c-.26-2.334 2.143-4.048 4.266-3.042l11.944 5.658c2.288 1.083 2.288 4.339 0 5.422L7.668 20.37c-2.123 1.006-4.525-.708-4.266-3.042L3.882 13H12a1 1 0 100-2H3.883l-.48-4.327z"
        fill="#1857C1"
      />
    </Svg>
  );
}

export function MicroPhoneIcon(props: SvgProps) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={64}
      height={64}
      viewBox="0 0 64 64"
      fill="none"
      {...props}
    >
      <G filter="url(#filter0_d_1346_531)">
        <Circle cx={30} cy={28} r={20} fill="#D9D9D9" />
      </G>
      <Defs></Defs>
    </Svg>
  );
}

export default MicroPhoneIcon;
