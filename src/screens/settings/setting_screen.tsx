import BaseModal from '@/components/modals/base-modal';
import PreferencesModal from '@/components/preferences-modal';
import BackButton from '@/components/ui/buttons/back-button';
import Button from '@/components/ui/buttons/button';
import ScreenLayout from '@/components/ui/layout';
import useAuthentication from '@/hooks/use-authentication';
import { useGoogleDriveBackup } from '@/hooks/use-drive-backup';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import LinearGradient from '@/components/base/LinearGradient';
import { FONT_FAMILIES } from '@/constants/typography';
import { Toast } from '@/utils/toast';
import {
  AiIdeaIcon,
  Alert01Icon,
  BrainIcon,
  ColorsIcon,
  DatabaseExportIcon,
  DatabaseImportIcon,
  File02Icon,
  FileSecurityIcon,
  Logout02Icon,
  MailAtSign01Icon,
  Notification01Icon,
  PreferenceHorizontalIcon,
  ResetPasswordIcon,
  SmartWatch03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react-native';
import notifee from '@notifee/react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Loader from '../../constants/loader';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import { logButtonTap } from '../../services/analyticsService';
import {
  useAppDispatch,
  useAppSelector,
} from '../../services/mmkv-redux/hooks';
import {
  resetAllApp,
  resetAllUser,
  setLastFetch,
} from '../../services/mmkv-redux/slices';
import { backupDB, restoreDB } from '../../services/sqlite/back_db';
import { deleteAllDatabase } from '../../services/sqlite/queries';
import { addVitalToDB } from '../../services/sqlite/vitals';
import { haptic } from '../../utils';
import { getTierForLevel } from '../home/roadmap_screen';

interface MenuItemData {
  id: string;
  label: string;
  icon: IconSvgElement;
  onPress: () => void;
}

interface MenuSection {
  title: string;
  titleColor?: string;
  data: MenuItemData[];
}

const ProfileScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const { userData } = useAppSelector(state => state.user);
  const { haptic_level } = useAppSelector(state => state.message);
  const dispatch = useAppDispatch();
  const [isSyncing, setIsSyncing] = useState(false);
  const { userProfile } = useAppSelector(state => state.gameProgression);
  const {
    level: currentLevel,
    xp,
    xpToNextLevel,
  } = useAppSelector(state => state.gameProgression.userProfile);
  const tier = useMemo(() => getTierForLevel(currentLevel), [currentLevel]);
  const progress = xpToNextLevel > 0 ? xp / xpToNextLevel : 0;

  const [isPreferenceModalVisible, setPreferenceModalVisible] = useState(false);
  const [isSpikeModalVisible, setSpikeModalVisible] = useState(false);
  const [spikeMetrics, setSpikeMetrics] = useState<
    {
      time: string;
      metrics: {
        metric: string;
        value: number;
      }[];
    }[]
  >([]);

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);
  const gameProfile = useAppSelector(
    state => state.gameProgression.userProfile,
  );

  // console.log({ xp });

  const currentLevel2 = gameProfile?.level ?? 1;
  const currentXP = gameProfile?.xp ?? 0;
  const xpToNextLevel2 = gameProfile?.xpToNextLevel ?? 1000;
  const progressPercentage = Math.min((currentXP / xpToNextLevel) * 100, 15);
  const { Logout } = useAuthentication();

  const { uploadFile, downloadFile } = useGoogleDriveBackup();

  const googleSignOut = () => {
    try {
      GoogleSignin.signOut();
    } catch (e) {}
  };

  const onLogout = async () => {
    try {
      await logButtonTap('Logout');
      await Logout();
      await notifee.cancelAllNotifications();
      await notifee.cancelTriggerNotifications();
      await deleteAllDatabase();
      dispatch(resetAllApp());
      dispatch(resetAllUser());
      googleSignOut();

      props.navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeScreen' }],
      });

      // props.navigation.navigate('NavigationTab');
    } catch (error: any) {
      console.log(error);
      Alert.alert(error?.message ?? '');
    }
  };

  const onDeleteAccount = async () => {
    props.navigation.navigate('DeleteAccountScreen');
    return;
  };

  const exportDB = async (encryptionKey = userData?.email ?? '') => {
    try {
      setIsSyncing(true);
      const path = await backupDB(encryptionKey);
      if (path) {
        try {
          const fileId = await uploadFile({
            fileName: `HealthPulse.backup.db.zip`,
            mimeType: 'application/zip',
            filePath: path,
          });
          console.log({ fileId });

          Toast('File Uploaded to Drive Successfully');
        } catch (error) {
          console.error(error);
        }
      }
      setIsSyncing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const importDB = async (encryptionKey = userData?.email ?? '') => {
    try {
      setIsSyncing(true);
      const data = await downloadFile();
      console.log('dowloaded successfully');

      await restoreDB(encryptionKey, data);
      Toast('DB restored successfully');
      setIsSyncing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const saveSpikeVitalToDB = async () => {
    haptic(haptic_level);
    try {
      for (const spikeMetric of spikeMetrics) {
        for (const metric of spikeMetric.metrics) {
          await addVitalToDB({
            vital_type: metric.metric,
            value: String(metric.value),
            createdAt: spikeMetric.time,
          });
        }
      }
      console.log('completed');
      dispatch(setLastFetch(new Date()));
      setSpikeModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Define menu sections with data
  const menuSections: MenuSection[] = [
    {
      title: 'ACCOUNT SETTINGS',
      data: [
        {
          id: 'health-questionnaire',
          label: 'Health Questionnaire',
          icon: AiIdeaIcon,
          onPress: async () => {
            await logButtonTap('QuizScreen');
            props.navigation.navigate('QuizScreen', { screen: 'profile' });
          },
        },
        {
          id: 'adhd-questionnaire',
          label: 'ADHD Questionnaire',
          icon: BrainIcon,
          onPress: async () => {
            await logButtonTap('ADHD Questionnaire');
            // TODO: Navigate to ADHD questionnaire screen when created
            // Toast('ADHD Questionnaire - Coming Soon');
            props.navigation.navigate('ADHDQuestionnaireScreen');
          },
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Notification01Icon,
          onPress: async () => {
            await logButtonTap('Notification');
            props.navigation.navigate('Notifications');
          },
        },
        ...(userData?.providerId === 'password'
          ? [
              {
                id: 'change-password',
                label: 'Change Password',
                icon: ResetPasswordIcon,
                onPress: async () => {
                  await logButtonTap('Change Password');
                  props.navigation.navigate('ChangePasswordScreen');
                },
              },
            ]
          : []),
        {
          id: 'export-db',
          label: 'Export DB',
          icon: DatabaseExportIcon,
          onPress: async () => {
            await logButtonTap('Export DB');
            await exportDB();
          },
        },
        {
          id: 'import-db',
          label: 'Import DB',
          icon: DatabaseImportIcon,
          onPress: async () => {
            await logButtonTap('Import DB');
            await importDB();
          },
        },
      ],
    },
    {
      title: 'SERVICES',
      data: [
        {
          id: 'app-appearance',
          label: 'App Appearance',
          icon: ColorsIcon,
          onPress: () => {
            haptic(haptic_level);
            props.navigation.navigate('ThemeScreen', {
              onPress: () => props.navigation.goBack(),
            });
          },
        },
        {
          id: 'preferences',
          label: 'Preferences',
          icon: PreferenceHorizontalIcon,
          onPress: () => {
            haptic(haptic_level);
            setPreferenceModalVisible(true);
          },
        },
        {
          id: 'health-connect',
          label: 'HealthPulse Connect',
          icon: SmartWatch03Icon,
          onPress: async () => {
            haptic(haptic_level);
            props.navigation.navigate('HealthPulseConnect');
          },
        },
      ],
    },
    {
      title: 'SUPPORT',
      data: [
        {
          id: 'contact-us',
          label: 'Contact Us',
          icon: MailAtSign01Icon,
          onPress: async () => {
            await logButtonTap('Contact Us');
            props.navigation.navigate('ContactUsScreen');
          },
        },
      ],
    },
    {
      title: 'LEGAL',
      data: [
        {
          id: 'terms-conditions',
          label: 'Terms and conditions',
          icon: File02Icon,
          onPress: async () => {
            await logButtonTap('Terms and Condition');
            props.navigation.navigate('TermsConditionScreen');
          },
        },
        {
          id: 'privacy-policy',
          label: 'Privacy Policy',
          icon: FileSecurityIcon,
          onPress: async () => {
            await logButtonTap('Privacy Policy');
            props.navigation.navigate('PrivacyPolicyScreen');
          },
        },
      ],
    },
    {
      title: 'DANGER ZONE',
      titleColor: 'red',
      data: [
        {
          id: 'logout',
          label: 'Log out',
          icon: Logout02Icon,
          onPress: onLogout,
        },
        {
          id: 'delete-account',
          label: 'Delete Account',
          icon: Alert01Icon,
          onPress: onDeleteAccount,
        },
      ],
    },
  ];

  const MenuItem = ({
    item,
    isLast,
  }: {
    item: MenuItemData;
    isLast: boolean;
  }) => (
    <TouchableOpacity onPress={item.onPress}>
      <View style={[styles.rowWidthFull, !isLast && styles.endMenuItem]}>
        <HugeiconsIcon icon={item.icon} size={22} color={Colors.textColor} />
        <Text style={styles.contentContainerTextStyle}>{item.label}</Text>
        <Image
          source={require('./../../assets/icons/arrows.png')}
          style={styles.arrowStyle}
        />
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: MenuSection }) => (
    <Text
      style={[
        styles.labelStyle,
        section.titleColor && { color: section.titleColor },
      ]}
    >
      {section.title}
    </Text>
  );

  const renderItem = ({
    item,
    index,
    section,
  }: {
    item: MenuItemData;
    index: number;
    section: MenuSection;
  }) => {
    // Only render the container on first item, then render all items inside
    if (index === 0) {
      return (
        <View style={styles.contentContainer}>
          {section.data.map((menuItem, menuIndex) => {
            const isLast = menuIndex === section.data.length - 1;
            return (
              <MenuItem key={menuItem.id} item={menuItem} isLast={isLast} />
            );
          })}
        </View>
      );
    }
    return null;
  };

  const renderHeaderContent = () => (
    <View style={styles.profileWrapper}>
      <View style={styles.headerRow}>
        <BackButton
          onPress={async () => {
            props.navigation.goBack();
          }}
          iconColor={'white'}
        />
        <Text style={styles.profileTitle}>My Profile</Text>
        <View style={{ width: 42 }} />
      </View>
      <View style={styles.profileWrapContainer}>
        {/* Profile Image with Level Badge */}
        <View style={styles.profileImageSection}>
          <View style={styles.imageContainer}>
            <Image
              source={
                userData?.photoURL
                  ? { uri: userData?.photoURL }
                  : require('./../../assets/images/avatar.png')
              }
              style={styles.profileImage}
            />
            {/* Level Badge Overlay */}
            <View style={styles.levelBadgeOverlay}>
              <LinearGradient colors={tier.gradient} style={styles.levelBadge}>
                <MaterialCommunityIcons
                  name="shield-star"
                  size={16}
                  color={Colors.white}
                />
              </LinearGradient>
            </View>
          </View>

          {/* Name and Email */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {userData?.displayName}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {userData?.email}
            </Text>

            {/* XP Progress */}
            <View style={styles.xpProgressContainer}>
              <View style={styles.xpProgressTrack}>
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarTrack}>
                    <LinearGradient
                      colors={['#1857C1', '#2266DD']}
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPercentage}%` },
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
              </View>
              <Text style={styles.xpPercentage}>
                {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()}{' '}
                XP
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Level Stat */}
          <View style={styles.statItem}>
            <LinearGradient colors={tier.gradient} style={styles.levelBadge}>
              <MaterialCommunityIcons
                name="shield-star"
                size={16}
                color={Colors.white}
              />
            </LinearGradient>
            <View>
              <Text style={styles.statValue}>{currentLevel}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          {/* XP Stat */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(` Your Current XP: ${JSON.stringify(gameProfile)}`);
            }}
            style={styles.statItem}
          >
            <Image
              source={require('@/assets/images/coin-2.png')}
              style={styles.coinIcon}
            />
            <View>
              <Text style={styles.statValue}>{currentXP}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </TouchableOpacity>

          {/* Rewards Button */}
          <TouchableOpacity
            style={styles.rewardsButton}
            onPress={async () => {
              await logButtonTap('Rewards');
              props.navigation.navigate('RoadmapScreen');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.rewardsButtonGradient}>
              <Text style={styles.rewardsButtonText}>Rewards</Text>
              <View style={styles.rewardCoins}>
                <Image
                  source={require('@/assets/images/coin-2.png')}
                  style={styles.rewardCoinIcon}
                />
                <Image
                  source={require('@/assets/images/coin-2.png')}
                  style={[styles.rewardCoinIcon, { marginLeft: -8 }]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderListFooter = () => (
    <Image
      source={require('@/assets/images/AuraCore-logo-bnw.png')}
      style={styles.footerLogo}
    />
  );

  return (
    <View style={styles.mainContainer}>
      <Loader loading={isSyncing} />

      <ScreenLayout
        variant="scrollable"
        headerContent={renderHeaderContent()}
        headerBackgroundColor="#1857C1"
        backgroundColor={Colors.backgroundColor}
        headerPaddingTop={32}
        headerHeight={160}
      >
        <SectionList
          sections={menuSections}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListFooterComponent={renderListFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
          stickySectionHeadersEnabled={false}
        />

        <BaseModal
          isVisible={isSpikeModalVisible}
          onClose={() => setSpikeModalVisible(false)}
          title="Spike Metrics"
          showBackButton={true}
        >
          <ScrollView
            style={[
              styles.preferenceList,
              { maxHeight: '70%', minHeight: '10%' },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {spikeMetrics.map((value, valueIndex) => (
              <View
                key={`spike-${valueIndex}`}
                style={{ marginLeft: 30, marginBottom: 15 }}
              >
                <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                  <Text style={{ fontWeight: 'bold', color: Colors.textColor }}>
                    Date:{' '}
                  </Text>
                  <Text style={{ color: Colors.textColor }}>{value.time}</Text>
                </View>
                {value.metrics.map((metric, metricIndex) => (
                  <View
                    key={`metric-${metricIndex}`}
                    style={{ flexDirection: 'row', marginLeft: 30 }}
                  >
                    <Text
                      style={{ fontWeight: 'bold', color: Colors.textColor }}
                    >{`${metric.metric}: `}</Text>
                    <Text style={{ color: Colors.textColor }}>
                      {metric.value}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalButtonWrapper}>
            <Button
              text="Close"
              variant="contained"
              onPress={() => {
                haptic(haptic_level);
                setSpikeMetrics([]);
                setSpikeModalVisible(false);
              }}
              style={styles.modalButton}
            />
            <Button
              text="Add to DB"
              variant="contained"
              onPress={saveSpikeVitalToDB}
              style={[
                styles.modalButton,
                { backgroundColor: Colors.secondaryColor },
              ]}
            />
          </View>
        </BaseModal>
      </ScreenLayout>

      <PreferencesModal
        visible={isPreferenceModalVisible}
        onClose={() => setPreferenceModalVisible(false)}
      />
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    profileWrapper: {
      width: '90%',
      marginLeft: 20,
      gap: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileTitle: {
      color: 'white',
      fontFamily: FONT_FAMILIES.nunitoMedium,
      marginTop: 20,
      fontSize: 20,
      flex: 1,
      textAlign: 'center',
    },
    profileWrapContainer: {
      marginTop: 20,
      width: '100%',
      borderRadius: 20,
      backgroundColor: Colors.white,
      padding: 20,
      ...DEffect,
    },
    profileImageSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    profileImage: {
      height: 100,
      width: 100,
      backgroundColor: 'white',
      resizeMode: 'cover',
      borderRadius: 15,
    },
    levelBadgeOverlay: {
      position: 'absolute',
      bottom: -5,
      right: -5,
      borderRadius: 15,
      overflow: 'hidden',
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 6,
      borderRadius: 15,
    },
    profileInfo: {
      flex: 1,
      marginLeft: 16,
    },
    profileName: {
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      fontSize: 24,
      marginBottom: 2,
    },
    progressBarContainer: {
      width: '100%',
      maxWidth: 560,
      marginBottom: 12,
    },
    progressBarTrack: {
      height: 8,
      backgroundColor: Colors.isDark
        ? 'rgba(24, 87, 193, 0.2)'
        : 'rgba(24, 87, 193, 0.15)',
      borderRadius: 100,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 100,
      minWidth: 60,
    },
    progressText: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    profileEmail: {
      color: Colors.greyColor700,
      fontSize: 12,
      marginBottom: 8,
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statValue: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
    },
    statLabel: {
      fontSize: 8,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.greyColor700,
    },
    coinIcon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
    },
    rewardsButton: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    rewardsButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
      backgroundColor: '#1857C1',
    },
    rewardsButtonText: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.white,
    },
    rewardCoins: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rewardCoinIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
    },
    xpProgressContainer: {
      flexDirection: 'column',
      gap: 6,
    },
    xpProgressTrack: {
      width: '100%',
      height: 8,
      backgroundColor: Colors.greyColor,
      borderRadius: 4,
      overflow: 'hidden',
    },
    xpProgressFill: {
      height: '100%',
      backgroundColor: '#1857C1',
      borderRadius: 4,
    },
    xpPercentage: {
      fontSize: 11,
      color: Colors.greyColor700,
      textAlign: 'left',
      fontFamily: FONT_FAMILIES.nunitoMedium,
    },
    contentContainer: {
      backgroundColor: Colors.white,
      marginHorizontal: 20,
      marginVertical: 10,
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderRadius: 20,
      ...DEffect,
    },
    rowWidthFull: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingVertical: 8,
    },
    endMenuItem: {
      borderBottomColor: Colors.greyColor,
      borderBottomWidth: 1,
      marginBottom: 10,
    },
    arrowStyle: {
      height: 30,
      width: 30,
      alignSelf: 'center',
      resizeMode: 'contain',
      tintColor: Colors.textColor,
    },
    contentContainerTextStyle: {
      color: Colors.textColor,
      fontSize: 17,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      flex: 1,
      marginLeft: 12,
    },
    labelStyle: {
      color: Colors.textColor,
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      letterSpacing: 0.7,
      marginHorizontal: 28,
      marginTop: 20,
      marginBottom: 5,
    },
    footerLogo: {
      height: 60,
      width: 60,
      alignSelf: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    preferenceList: {
      width: '100%',
      borderColor: Colors.greyColor,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
    },
    preferenceText: {
      color: Colors.textColor,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      fontSize: 16,
      flex: 1,
      marginRight: 10,
    },
    modalButtonWrapper: {
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      gap: 10,
    },
    modalButton: {
      borderRadius: 8,
      paddingHorizontal: 8,
      flex: 1,
    },
    imageContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      width: 80,
      height: 80,
      borderRadius: 15,
      justifyContent: 'center',
    },
  });
};

export default ProfileScreen;
