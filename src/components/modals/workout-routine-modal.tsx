import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Button from "../ui/buttons/button";
import { useDispatch } from "react-redux";
import BaseModal from "./base-modal";
import TextBox from "../TextBox";
import { useAppTheme } from "@/hooks/themeHook";
import { useAppSelector } from "@/services/mmkv-redux/hooks";
import { haptic } from "@/utils";
import { addWeeklyWorkoutPlan } from "@/services/mmkv-redux/slices";
import { ColorScheme } from "@/constants/theme";

interface Routine {
  day: string;
  routine: string;
}

interface WorkoutRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  weeklyWorkoutPlanDay: Routine[];
  handleEditWeeklyRoutine: (value: string, index: number) => void;
}

const WorkoutRoutineModal: React.FC<WorkoutRoutineModalProps> = ({
  visible,
  onClose,
  weeklyWorkoutPlanDay,
  handleEditWeeklyRoutine,
}) => {
  const dispatch = useDispatch();
  const { Colors } = useAppTheme();
  const { haptic_level } = useAppSelector(state => state.message);
  const styles = createStyles(Colors);

  const renderItem = ({ item, index }: { item: Routine; index: number }) => (
    <View style={{ marginBottom: 10 }}>
      <Text
        style={[
          styles.modalText,
          {
            paddingLeft: 10,
            paddingBottom: 10,
            fontFamily: "Nunito-Bold",
          },
        ]}
      >
        {item.day}
      </Text>
      <TextBox
        value={item.routine}
        onChangeText={(value) => handleEditWeeklyRoutine(value, index)}
      />
    </View>
  );

  return (
    <BaseModal isVisible={visible} onClose={onClose} title={"Workout Routine"}>
      <FlatList
        data={weeklyWorkoutPlanDay}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListFooterComponent={
          <>
            <View style={styles.modalButtonWrapper}>
              <Button
                text="Save"
                variant="contained"
                onPress={async () => {
                  haptic(haptic_level);
                  dispatch(addWeeklyWorkoutPlan(weeklyWorkoutPlanDay));
                  onClose();
                }}
                             />
              <Button
                text="Cancel"
                variant="contained"
                onPress={() => {
                  haptic(haptic_level);
                  onClose();
                }}
                />
            </View>
            <View style={{ height: 40 }} />
          </>
        }
      />
    </BaseModal>
  );
};

const createStyles = (Colors: ColorScheme) => StyleSheet.create({
  modalText: {
    fontSize: 16,
    fontFamily: "Nunito-Medium",
    color: Colors.textColor,
  },
  modalButtonWrapper: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});

export default WorkoutRoutineModal;
