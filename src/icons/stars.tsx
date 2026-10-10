import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgProps } from "react-native-svg";

const Stars: React.FC<SvgProps> = (props) => {
  return (
    <Svg
      width={512}
      height={512}
      viewBox="0 0 1707 1707"
      fillRule="evenodd"
      {...props}
    >
      <Path
        fill="#ffd93b"
        d="M1128 1066c-312 0-564-253-564-564 0 311-253 564-564 564 311 0 564 252 564 563 0-311 252-563 564-563z"
        transform="matrix(-1 0 0 1 1707 0)"
      />
      <Path
        d="M1707 1357c-171 0-309-139-309-309 0 170-139 309-309 309 170 0 309 138 309 309 0-171 138-309 309-309zm-178-940c-208 0-376-168-376-376 0 208-168 376-376 376 208 0 376 168 376 376 0-208 168-376 376-376z"
        transform="matrix(-1 0 0 1 1707 0)"
        fill="#ffb030"
      />
    </Svg>
  );
};

export default Stars;
