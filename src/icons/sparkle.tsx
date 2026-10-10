import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgProps } from "react-native-svg";

interface SparkleProps extends SvgProps {
  color?: string;
}

const Sparkle: React.FC<SparkleProps> = ({ color = "#fff", ...props }) => {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M10 7l-.516 1.394c-.676 1.828-1.014 2.742-1.681 3.409-.667.666-1.581 1.005-3.409 1.681L3 14l1.394.516c1.828.676 2.742 1.014 3.409 1.681.667.667 1.005 1.581 1.681 3.409L10 21l.516-1.394c.676-1.828 1.014-2.742 1.681-3.409.667-.666 1.581-1.005 3.409-1.681L17 14l-1.394-.516c-1.828-.676-2.742-1.014-3.409-1.681-.666-.667-1.005-1.581-1.681-3.409L10 7zM18 3l-.221.597c-.29.784-.435 1.176-.72 1.461-.286.286-.678.431-1.462.72L15 6l.598.221c.783.29 1.175.435 1.46.72.286.286.431.678.72 1.462L18 9l.221-.597c.29-.784.435-1.176.72-1.461.286-.286.678-.431 1.462-.72L21 6l-.598-.221c-.783-.29-1.175-.435-1.46-.72-.286-.286-.431-.678-.72-1.462L18 3z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Sparkle;
