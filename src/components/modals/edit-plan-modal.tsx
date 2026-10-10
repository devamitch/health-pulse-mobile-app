import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { Routine } from '@/services/mmkv-redux/slices';
import { haptic } from '@/utils';
import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BaseModal from './base-modal';
import ModalBtttons from './modal-buttons';

interface FlatListItem {
  routine: string;
  item: string;
  elementIndex: number;
  itemIndex: number;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  type: 'item' | 'addButton';
}

interface EditPlanModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedList: Routine[];
  setSelectedList: React.Dispatch<React.SetStateAction<Routine[]>>;
  savePlan: (selectedList: Routine[]) => void;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({
  isVisible,
  onClose,
  selectedList = [],
  setSelectedList,
  savePlan,
}) => {
  const { Colors } = useAppTheme();
  const { haptic_level } = useAppSelector(state => state.message);
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const flatData: FlatListItem[] = useMemo(() => {
    return selectedList.reduce((acc: FlatListItem[], routine, elementIndex) => {
      const routineItems = routine.routine_items.map(
        (routineItem, itemIndex) => ({
          routine: routine.routine,
          item: routineItem.item,
          elementIndex,
          itemIndex,
          isFirstInGroup: itemIndex === 0,
          isLastInGroup: itemIndex === routine.routine_items.length - 1,
          type: 'item' as const,
        }),
      );

      const addButton: FlatListItem = {
        routine: routine.routine,
        item: '',
        elementIndex,
        itemIndex: -1,
        isFirstInGroup: routine.routine_items.length === 0,
        isLastInGroup: true,
        type: 'addButton' as const,
      };

      return [...acc, ...routineItems, addButton];
    }, []);
  }, [selectedList]);

  const removeTextBox = useCallback(
    (elementIndex: number, itemIndex: number) => {
      haptic(haptic_level);
      setSelectedList(prevList => {
        const newList = [...prevList];
        if (newList[elementIndex]) {
          newList[elementIndex].routine_items.splice(itemIndex, 1);
          if (newList[elementIndex].routine_items.length === 0) {
            newList.splice(elementIndex, 1);
          }
        }
        return newList;
      });
    },
    [setSelectedList, haptic_level],
  );

  const deleteRoutine = useCallback(
    (elementIndex: number) => {
      haptic(haptic_level);
      setSelectedList(prevList => {
        const newList = [...prevList];
        newList.splice(elementIndex, 1);
        return newList;
      });
    },
    [setSelectedList, haptic_level],
  );

  const addItemToRoutine = useCallback(
    (elementIndex: number) => {
      haptic(haptic_level);
      setSelectedList(prevList => {
        const newList = [...prevList];
        if (newList[elementIndex]) {
          newList[elementIndex].routine_items.push({
            item: '',
            checked: false,
          });
        }
        return newList;
      });
    },
    [setSelectedList, haptic_level],
  );

  const handleEditListItem = useCallback(
    (data: string, elementIndex: number, itemIndex: number) => {
      setSelectedList(prevList => {
        const newList = [...prevList];
        if (newList[elementIndex]?.routine_items[itemIndex]) {
          newList[elementIndex].routine_items[itemIndex].item = data;
        }
        return newList;
      });
    },
    [setSelectedList],
  );

  const handleSave = useCallback(() => {
    haptic(haptic_level);
    savePlan(selectedList);
  }, [savePlan, selectedList, haptic_level]);

  const buttons = <ModalBtttons onClose={onClose} handleSave={handleSave} />;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FlatListItem>) => {
      if (item.type === 'addButton') {
        return (
          <View style={styles.itemContainer}>
            {item.isFirstInGroup && (
              <View style={styles.routineHeader}>
                <Text style={styles.routineTitle}>{item.routine}</Text>
                <TouchableOpacity
                  onPress={() => deleteRoutine(item.elementIndex)}
                >
                  <MaterialIcons
                    name="delete-outline"
                    color={Colors.textPrimaryColor}
                    size={25}
                  />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: Colors.primaryColor,
                  borderColor: Colors.primaryColor,
                },
              ]}
              onPress={() => addItemToRoutine(item.elementIndex)}
            >
              <MaterialIcons
                name="add"
                size={20}
                color={Colors.white}
                style={styles.addIcon}
              />
              <Text style={[styles.addButtonText, { color: Colors.white }]}>
                Add Item
              </Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View style={styles.itemContainer}>
          {item.isFirstInGroup && (
            <View style={styles.routineHeader}>
              <Text style={styles.routineTitle}>{item.routine}</Text>
              <TouchableOpacity
                onPress={() => deleteRoutine(item.elementIndex)}
              >
                <MaterialIcons
                  name="delete-outline"
                  color={Colors.textPrimaryColor}
                  size={25}
                />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.textBoxContainer}>
            <TextInput
              value={item.item}
              onChangeText={text =>
                handleEditListItem(text, item.elementIndex, item.itemIndex)
              }
              style={[
                styles.textBox,
                {
                  backgroundColor: Colors.white,
                  color: Colors.textColor,
                  borderColor: Colors.greyColor400,
                },
              ]}
              placeholder="Type here..."
              placeholderTextColor={Colors.greyColor600}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeTextBox(item.elementIndex, item.itemIndex)}
            >
              <MaterialIcons name="close" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [
      handleEditListItem,
      removeTextBox,
      addItemToRoutine,
      deleteRoutine,
      styles,
      Colors,
    ],
  );

  return (
    <BaseModal
      isVisible={isVisible}
      onClose={onClose}
      title="Edit Plan"
      buttons={buttons}
    >
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={item =>
          item.type === 'addButton'
            ? `${item.routine}-${item.elementIndex}-addButton`
            : `${item.routine}-${item.elementIndex}-${item.itemIndex}`
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ flexGrow: 1, width: '100%' }}
      />
    </BaseModal>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: 20,
      flexGrow: 1,
      width: '100%',
      gap: 16,
    },
    itemContainer: {
      gap: 12,
    },
    routineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      marginTop: 8,
      paddingLeft: 10,
      paddingRight: 15,
    },
    routineTitle: {
      fontSize: 18,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textPrimaryColor,
      flex: 1,
      letterSpacing: 0.3,
      fontWeight: '700',
    },
    textBoxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    textBox: {
      flex: 1,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 14,
      paddingRight: 52,
      borderWidth: 1,
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      fontWeight: '600',
    },
    removeButton: {
      position: 'absolute',
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.red,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      gap: 8,
    },
    addIcon: {
      marginRight: 4,
    },
    addButtonText: {
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    buttonContainer: {},
    button: {
      flex: 1,
      borderRadius: 24,
      height: 50,
      justifyContent: 'center',
    },
    cancelButton: {
      marginRight: 12,
      backgroundColor: Colors.secondaryColor,
    },
    saveButton: {
      backgroundColor: Colors.primaryColor,
    },
    buttonLabel: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: Colors.white,
      letterSpacing: 0.3,
      fontWeight: '600',
    },
  });

export default React.memo(EditPlanModal);
