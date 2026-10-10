import Activity from '@/assets/svg/vitals-icon/activity.svg';
import BodyComp from '@/assets/svg/vitals-icon/body-composition.svg';
import BloodPressure from '@/assets/svg/vitals-icon/bp.svg';
import Calories from '@/assets/svg/vitals-icon/calories.svg';
import Fitness from '@/assets/svg/vitals-icon/fitness.svg';
import HeartHealth from '@/assets/svg/vitals-icon/heart-health.svg';
import HeartRate from '@/assets/svg/vitals-icon/heart-health.svg';
import SleepEfficiency from '@/assets/svg/vitals-icon/sleep-efficiency.svg';
import SleepHealth from '@/assets/svg/vitals-icon/sleep-health.svg';
import SleepInterruptions from '@/assets/svg/vitals-icon/sleep-interruptions.svg';
import Temperature from '@/assets/svg/vitals-icon/temperature.svg';
import { SvgProps } from 'react-native-svg';

export type VitalIconType =
  | "BP"
  | "HR"
  | "HRV"
  | "Efficiency"
  | "Sleep Efficiency"
  | "Calories"
  | "Temperature"
  | "Body Temperature"
  | "BMI"
  | "Weight"
  | "Walking"
  | "Distance Walking"
  | "VO2 Max"
  | "Duration"
  | "Sleep Duration"
  | "Interruptions"
  | "Sleep Interruptions"
  | "Active";

interface VitalIconProps extends SvgProps {
    vital: VitalIconType
}

export const VitalIcon: React.FC<VitalIconProps> = ({ vital, ...rest }) => {
  switch (vital) {
    case "BP":
      return <BloodPressure {...rest} />;
    case "HR":
      return <HeartRate {...rest} />;
    case "HRV":
      return <HeartHealth {...rest} />;
    case "Efficiency":
      return <SleepEfficiency {...rest} />;
    case "Sleep Efficiency":
      return <SleepEfficiency {...rest} />;
    case "Calories":
      return <Calories {...rest} />;
    case "Temperature":
      return <Temperature {...rest} />;
    case "Body Temperature":
      return <Temperature {...rest} />;
    case "BMI":
    case "Weight":
      return <BodyComp {...rest} />;
    case "Walking":
      return <Activity {...rest} />;
    case "Distance Walking":
      return <Activity {...rest} />;
    case "VO2 Max":
      return <Fitness {...rest} />;
    case "Duration":
      return <SleepHealth {...rest} />;
    case "Sleep Duration":
      return <SleepHealth {...rest} />;
    case "Interruptions":
      return <SleepInterruptions {...rest} />;
    case "Sleep Interruptions":
      return <SleepInterruptions {...rest} />;
    case "Active":
      return <Activity {...rest} />;
  }
};
