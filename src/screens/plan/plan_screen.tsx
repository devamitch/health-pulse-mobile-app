import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenLayout from '@/components/ui/layout';
import SubscriptionModal from '../../components/SubscriptionModal';
import { logButtonTap } from '../../services/analytics-service';
import Food from '@/assets/svg/food.svg';
import Medicine from '@/assets/svg/medicine.svg';
import Workout from '@/assets/svg/workout.svg';
import EditPlanModal from '@/components/modals/edit-plan-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PlanGradientCard from '../../components/PlanGradientCard';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '../../hooks/themeHook';
import PreferencesModal from '@/components/preferences-modal';
import PlanMessageModal from '@/components/modals/plan-message-modal';
import StatusMenu from '@/components/status/layout-list/status-menu';
import BuildMealModal from '@/components/modals/build-meal-modal';
import BuildWorkoutModal from '@/components/modals/build-workout-modal';
import FilterIcon from '@/icons/filter-icon';
import { usePlanScreen } from '@/hooks/use-plan-generation';
import { IconButton } from '@/components/ui/buttons/button';

const PlanScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const {
    // State
    superFoodsList,
    supplementsList,
    activitesList,
    selectedList,
    setSelectedList,
    isEditModalVisible,
    setIsEditModalVisible,
    isMessageModalVisible,
    setIsMessageModalVisible,
    isModalVisible,
    setModalVisible,
    isMenuVisible,
    setMenuVisible,
    isPreferenceModalVisible,
    setPreferenceModalVisible,
    isBuildMealModalVisible,
    setBuildMealModalVisible,
    isBuildWorkoutModalVisible,
    setBuildWorkoutModalVisible,
    planType,
    setPlanType,
    message,
    loading,
    // Refs
    scrollViewRef,
    supplementsRef,
    superfoodRef,
    activityRef,
    
    // Redux data
    weeklyWorkoutPlan,
    CategorisedPreferences,
    
    // PanResponder
    subscriptionModalPanResponder,
    
    // Menu
    menuItems,
    
    // Functions
    generatePlan,
    savePlan,
    displayPlan,
  } = usePlanScreen(props.navigation);

  const renderHeaderContent = () => (
    <View style={styles.greetingWrapper}>
      <Text
        style={{
          color: 'white',
          fontFamily: FONT_FAMILIES.nunitoRegular,
          fontSize: 18,
        }}
      > 
        YOUR PLANS
      </Text>
      <View style={styles.greetingWrapContainer}>
            <View style={{ flexDirection: 'row', paddingLeft: 5 }}>
              <Text style={styles.textstyle}>Today Plans</Text>
              <View style={{ flex: 1 }} />
              {/* <IconButton
                onPress={() => setMenuVisible(true)}
                variant="light"
                icon={<FilterIcon width={24} height={24} color={Colors.primaryColor} />}
              /> */}
            </View>
            <View style={{ height: 10 }} />
            <Text style={styles.testlistStyle}>
              A personalized plan designed specially for you based on your
              reports ans data, backed by science.
            </Text>
          </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={[styles.mainContainer, { flex: 1 }]}>
      <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      <ScreenLayout
        variant="scrollable"
        headerContent={renderHeaderContent()}
        headerBackgroundColor="#1857C1"
        backgroundColor={Colors.backgroundColor}
        headerPaddingTop={240}
      >
        <View style={{ height: 50 }} />
        <Text style={styles.label}>Diet Plan</Text>
        <View style={{ height: 10 }} />
        <View style={{ width: '100%', alignSelf: 'center' }} ref={superfoodRef}>
          <TouchableOpacity
            onPress={async () => {
              await logButtonTap('Superfood Chat');
              props.navigation.navigate('SuperfoodsChatScreen');
            }}
          >
            <PlanGradientCard
              angle={292.08}
              colors={['#76D176', '#3E7F3E']}
              text="Super foods"
              textComponent={displayPlan(superFoodsList)}
              onCartPress={
                () => setBuildMealModalVisible(true)
                // await generatePlan(superFoodPrompts, dietRecord, [])
              }
              imageComponent={<Food />}
              onLabelPress={async () => {
                await logButtonTap('Superfood Chat');
                props.navigation.navigate('SuperfoodsChatScreen');
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
        <Text style={styles.label}>Physical Training</Text>
        <View style={{ height: 10 }} />

        {/* Activity Card with Tooltip */}
        <View style={{ width: '100%', alignSelf: 'center' }} ref={activityRef}>
          <TouchableOpacity
            onPress={async () => {
              await logButtonTap('Activity Chat');
              props.navigation.navigate('ActivitiesChatScreen');
            }}
          >
            <PlanGradientCard
              colors={['#76000B', '#DC0014']}
              angle={126.57}
              text="Activity"
              textComponent={displayPlan(activitesList)}
              onCartPress={
                () => setBuildWorkoutModalVisible(true)
                // await generatePlan(activityPrompts, activitiesRecord, [])
              }
              imageComponent={<Workout />}
              onLabelPress={async () => {
                await logButtonTap('Activity Chat');
                props.navigation.navigate('ActivitiesChatScreen');
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
        <Text style={styles.label}>Supplement Routine</Text>
        <View style={{ height: 10 }} />
        <View
          style={{ width: '100%', alignSelf: 'center' }}
          ref={supplementsRef}
        >
          <TouchableOpacity
            onPress={async () => {
              await logButtonTap('Supplement Chat');
              props.navigation.navigate('SupplementsChatScreen');
            }}
          >
            <PlanGradientCard
              angle={126.57}
              colors={['#AC5B00', '#FEDD00']}
              text="Supplements"
              textComponent={displayPlan(supplementsList)}
              onCartPress={async () => {
                setSelectedList([
                  {
                    routine: 'Morning Supplement',
                    routine_items: [],
                    time: '8:00',
                    notification_message:
                      'Start your morning strong Take your supplement now.',
                    notification_days: [
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ],
                  },
                  {
                    routine: 'Afternoon Supplement',
                    routine_items: [],
                    time: '13:00',
                    notification_message:
                      "Afternoon boost time! Don't forget your supplement.",
                    notification_days: [
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ],
                  },
                  {
                    routine: 'Evening Supplement',
                    routine_items: [],
                    time: '19:00',
                    notification_message:
                      'A healthy end to a healthy day. Time for your supplement!',
                    notification_days: [
                      'Sunday',
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                    ],
                  },
                ]);
                setPlanType('supplement'); // Set the plan type for supplements
                setIsEditModalVisible(true);
              }}
              imageComponent={<Medicine />}
              onLabelPress={async () => {
                await logButtonTap('Supplement Chat');
                console.log(CategorisedPreferences);

                // props.navigation.navigate('SupplementsChatScreen');
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScreenLayout>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View
          style={styles.modalContainer}
          {...subscriptionModalPanResponder.panHandlers}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  props.navigation.goBack();
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={Colors.textColor}
                />
              </TouchableOpacity>
            </View>
            <SubscriptionModal
              onClose={() => {
                setModalVisible(false);
                props.navigation.goBack();
              }}
            />
          </View>
        </View>
      </Modal>

      <EditPlanModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        savePlan={() => savePlan(planType)}
      />

      <PlanMessageModal
        isVisible={isMessageModalVisible}
        onClose={() => setIsMessageModalVisible(false)}
        description={message}
        Colors={Colors}
        onShare={() => {
          props.navigation.navigate('QuizScreen');
          setIsMessageModalVisible(false);
        }}
      />

      <PreferencesModal
        visible={isPreferenceModalVisible}
        onClose={() => setPreferenceModalVisible(false)}
      />

      <StatusMenu
        insetTop={insets.top}
        menuItems={menuItems}
        menuVisible={isMenuVisible}
        setMenuVisible={setMenuVisible}
      />

      <BuildMealModal
        isVisible={isBuildMealModalVisible}
        onClose={() => setBuildMealModalVisible(false)}
        onGeneratePress={async requirement =>
          await generatePlan('superfood', requirement)
        }
        onEditPress={() => {
          setSelectedList(superFoodsList);
          setPlanType('diet');
          setIsEditModalVisible(true);
        }}
      />

      <BuildWorkoutModal
        isVisible={isBuildWorkoutModalVisible}
        onClose={() => setBuildWorkoutModalVisible(false)}
        onGeneratePress={async requirement =>
          await generatePlan('activity', { ...requirement, weeklyWorkoutPlan })
        }
        existingWorkoutList={activitesList}
        onEditPress={() => {
          setSelectedList(activitesList);
          setPlanType('activities');
          setIsEditModalVisible(true);
        }}
      />
    </GestureHandlerRootView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flexGrow: 1,
      backgroundColor: Colors.white,
      paddingBottom: 30,
    },
    filterIcon: {
      height: 25,
      width: 25,
      tintColor: Colors.textPrimaryColor,
      marginRight: 5,
    },
    graphContainer: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: 100,
      width: '90%',
      marginHorizontal: 20,
      ...DEffect,
    },
    testlistStyle: {
      color: Colors.textColor,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      fontSize: 16,
      textAlign: 'left',
    },
    lowsmalltextstyle: {
      color: Colors.textColor,
      fontSize: 10,
      fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    lowtextstyle: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    nextButton: {
      borderRadius: 20,
      height: 50,
      width: '100%',
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors.primaryColor,
      ...DEffect,
    },
    nextButtonText: {
      color: Colors.white,
      flex: 1,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      fontSize: 17,
      alignSelf: 'center',
    },
    secondstyle: {
      color: Colors.white,
      fontSize: 20,
      left: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    planContainer: {
      position: 'absolute',
      bottom: 0,
      width: '90%',
      borderRadius: 20,
      backgroundColor: Colors.white,
      margin: 20,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 20,
      ...DEffect,
    },
    greetingWrapper: {
      width: '90%',
      position: 'absolute',
      bottom: 100,
      borderRadius: 20,
      margin: 20,
      flexDirection: 'column',
      paddingVertical: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    greetingWrapContainer: {
      width: '100%',
      position: 'absolute',
      bottom: -170,
      borderRadius: 20,
      backgroundColor: Colors.white,
      margin: 20,
      flexDirection: 'column',
      padding: 20,
      height: 150,
      ...DEffect,
    },
    container: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      margin: 20,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 20,
      ...DEffect,
    },
    imageStyle: {
      height: 50,
      width: 50,
      resizeMode: 'contain',
    },
    iconStyle: {
      height: 25,
      width: 25,
      alignSelf: 'center',
      alignItems: 'center',
      resizeMode: 'contain',
    },
    contentContainer: {
      marginLeft: 15,
      marginTop: 15,
      flexDirection: 'row',
      flex: 1,
    },
    contentIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
    },
    buttonContainer: {
      padding: 6,
      backgroundColor: Colors.white,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 10,
      ...DEffect,
    },
    arrowIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
      tintColor: Colors.black,
    },
    pointsContainerWrapper: {
      minHeight: 100,
      flexDirection: 'row',
      alignSelf: 'flex-start',
    },
    pointsContainer: {
      flexDirection: 'column',
      alignContent: 'flex-start',
      alignSelf: 'flex-start',
      marginLeft: 22,
      marginBottom: 15,
      width: '70%',
    },
    cartIcon: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
      tintColor: Colors.black,
      alignSelf: 'flex-end',
      marginBottom: 15,
      marginRight: 15,
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    editstyle: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      marginHorizontal: 0,
      marginVertical: 0,
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
    },
    cancelText: {
      marginLeft: 10,
      fontSize: 16,
      color: Colors.textPrimaryColor,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContent: {
      width: '80%', // Modal width
      backgroundColor: Colors.white, // Modal background color
      borderRadius: 30, // Rounded corners
      padding: 20, // Padding inside the modal
      maxHeight: '65%',
    },
    innerModalContent: {
      marginTop: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16, // Text size
      color: Colors.textColor, // Text color,
      textAlign: 'justify',
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },
    textBoxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    removeIcon: {
      height: 20,
      width: 20,
      marginLeft: 6,
    },
    modalButtonWrapper: {
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      gap: 10,
    },
    label: {
      left: 20,
      fontSize: 22,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
    },
    loaderOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalInnerContainer: {
      width: '90%',
      borderRadius: 20,
      backgroundColor: Colors.white,
      padding: 20,
      alignItems: 'center',
      ...DEffect,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalButton: {
      minWidth: 120,
      height: 45,
      justifyContent: 'center',
      borderRadius: 12,
    },
    preferenceList: {
      width: '100%',
      borderColor: Colors.greyColor,
      borderWidth: 1,
      borderRadius: 10,
    },
    preferenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderColor: Colors.greyColor,
    },
    preferenceText: {
      color: Colors.textColor,
      fontSize: 16,
      flex: 1,
      marginRight: 10,
    },
    removePreferenceButton: {
      padding: 8,
    },
    modalItem: {
      flexDirection: 'row',
      padding: 15,
      width: '100%',
    },
    modeltextStyle: {
      flex: 1,
      color: Colors.textColor,
      fontSize: 17,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      textAlign: 'center',
    },
    input: {
      borderColor: Colors.greyColor,
      borderWidth: 1,
      padding: 12,
      borderRadius: 10,
      width: '100%',
      minHeight: 120,
      textAlignVertical: 'top',
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textColor,
    },
    // Tooltip specific styles
    tooltipContentContainer: {
      padding: 8,
      minWidth: 250,
      maxWidth: 300,
    },
    tooltipText: {
      color: 'black',
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      marginBottom: 15,
      textAlign: 'left',
    },
    tooltipTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: 'white',
      marginBottom: 6,
    },
    tooltipButton: {
      borderRadius: 10,
      marginTop: 5,
      alignSelf: 'flex-end',
    },
     iconButton: {
     width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 87, 193, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  });
};

export default PlanScreen;
