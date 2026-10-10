import { ColorScheme } from "@/constants/theme";
import { getGamingDesign } from "@/screens/home/ProgressSummaryScreen";

export interface ComparisonCardProps {
  yesterdayProgress: number;
  todayProgress: number;
  color: string;
  gradientColors: [string, string, string];
  Colors: ColorScheme;
  DESIGN: ReturnType<typeof getGamingDesign>;
}

export type ProgressType = 'diet' | 'activity' | 'stress';

export interface BoostChallengeCardProps {
  color: string;
  gradientColors: [string, string, string];
  type: ProgressType;
  Colors: ColorScheme;
  DESIGN: ReturnType<typeof getGamingDesign>;
}

export interface SpecialQuestCardProps {
  Colors: ColorScheme;
  DESIGN: ReturnType<typeof getGamingDesign>;
}

export interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
  categoryColor: string;
}