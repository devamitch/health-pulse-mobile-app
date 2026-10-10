import { FloatingActionButton } from "../FloatingActionButton";
import { logButtonTap } from "@/services/analyticsService";
import React, { useState } from 'react';
import { useAppTheme } from "@/hooks/themeHook";
import { Toast } from "@/utils/toast";
import { 
  ImagePickerResponse, 
  launchCamera, 
  launchImageLibrary 
} from "react-native-image-picker";
import { Camera } from "react-native-vision-camera";
import { claudeVisionHelper } from "@/services/api/claude_client";
import { 
  MetricReport, 
  Metrics 
} from "@/services/mmkv-redux/slices";
import { addVitalToDB } from "@/services/sqlite/vitals";
import { getPrioritizedVitalData } from "@/services/sqlite/queries";
import { Vital } from "@/services/sqlite/interface";
import ImageResizer from "react-native-image-resizer";
import RNFS from 'react-native-fs';
import AddCustomMetricsModal from "../modals/home/add-custom-metric-modal";
import InfoModal from "../modals/info-alert-modal";
import MetricsModal from "../modals/home/metric-modal";
import FilePickerModal from "../modals/home/file-picker-modal";
import ImagePreviewModal from "../modals/image-preview-modal";

interface HomeActionValues{
  isOptionsVisible: boolean;
  hasPermission: boolean;
  imageUri: string;
  isImageModalVisble: boolean;
  currentMetric: MetricReport;
  isMetricsModalVisible: boolean;
  isInfoModalVisible: boolean;
  isAddMetricModalVisible: boolean;
  customMetrics: Metrics[];
}

interface HomeActionButtonProps{
  priorityVitalTags: string[],
  setVitals: React.Dispatch<React.SetStateAction<Vital[]>>
}

const HomeActionButton: React.FC<HomeActionButtonProps> = ({ 
  priorityVitalTags,
  setVitals
}) => {
  const [values, setValues] = useState<HomeActionValues>({
    isOptionsVisible: false,
    hasPermission: false,
    imageUri: '',
    isImageModalVisble: false,
    currentMetric: {
      description: '',
      success: false
    },
    isMetricsModalVisible: false,
    isInfoModalVisible: false,
    isAddMetricModalVisible: false,
    customMetrics: [],
  });

  const { Colors, DEffect } = useAppTheme();

  const handleValueUpdate = (update: Partial<HomeActionValues>) => {
    setValues(prev => ({ ...prev, ...update }));
  };

  const openCamera = async () => {
    try {
      if (!values.hasPermission) {
        const status = await Camera.requestCameraPermission();
        const granted = status === 'granted';
        handleValueUpdate({ hasPermission: granted });
        if (!granted) return;
      }

      launchCamera(
        {
          mediaType: 'photo',
          includeBase64: true,
          maxHeight: 500,
          maxWidth: 500,
        },
        processImage,
      );
    } catch (error) {
      Toast(String(error));
    }
  };

  const pickFile = () => {
    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: true,
          maxHeight: 500,
          maxWidth: 500,
        },
        processImage,
      );
    } catch (error) {
      Toast(String(error));
    }
  };

  const openAddCustomMetric = () => {
    handleValueUpdate({ 
      isAddMetricModalVisible: true, 
      customMetrics: [{
        metric: "",
        value: "",
        unit: ""
      }] 
    })
  }

  const processImage = async (response: ImagePickerResponse) => {
    try {
      if (response.didCancel) throw new Error('User cancelled image picker');

      const asset = response.assets?.[0];
      if (!asset || !asset.uri) return;

      const { path } = await ImageResizer.createResizedImage(
        asset.uri,
        500, 
        500,
        'JPEG',
        1
      );

      const base64 = await RNFS.readFile(path, 'base64');

      const selectedImage = {
        uri: path,
        imgB64: base64,
        type: 'image/jpeg',
        name: path.split('/').pop(),
      };

      handleValueUpdate({
        imageUri: selectedImage.uri,
        isImageModalVisble: true,
      });

      const res = await claudeVisionHelper(
        String(selectedImage.imgB64),
        'image/jpeg' 
      ) as MetricReport;

      handleValueUpdate({
        currentMetric: res,
        isImageModalVisble: false,
      });

      handleValueUpdate(
        res.success 
          ? {isMetricsModalVisible: true} 
          : {isInfoModalVisible: true}
      );
    } catch (error) {
      Toast(String(error));
    }
  };
  
  const saveMetrics = (metrics: Metrics[]) => {
    const sys = metrics?.find(item => item.metric === 'SYS');
    const dia = metrics?.find(item => item.metric === 'DIA');
  
    const result = [];
  
    if (sys && dia) {
      result.push({
        metric: 'BP',
        value: `${sys.value}/${dia.value}`,
        unit: sys.unit, // assuming both have the same unit
      });
    }
  
    metrics?.forEach(item => {
      if (item.metric !== 'SYS' && item.metric !== 'DIA') {
        result.push(item);
      }
    });
  
    console.log(result);
  
    if (result) {
      for (const metric of result) {
        addVitalToDB({
          vital_type: metric.metric,
          value: metric.value,
          unit: metric.unit,
        }).then(() => {
          getPrioritizedVitalData(priorityVitalTags).then(fetchedVitals => {
            setVitals(fetchedVitals);
          });
        });
      }
    }

    handleValueUpdate({isAddMetricModalVisible: false});
  };

  return (
    <>
      {/* <FloatingActionButton
        icon={require('./../../assets/icons/add.png')}
        onPress={async () => {
          await logButtonTap('Home Add Icon');
          handleValueUpdate({ isOptionsVisible: true });
        }}
      /> */}

      <FilePickerModal
        isVisible={values.isOptionsVisible}
        onClose={() => handleValueUpdate({ isOptionsVisible: false })}
        openCamera={openCamera}
        pickFile={pickFile}
        Colors={Colors}
        DEffect={DEffect}
        onOpenCustomMetricsModal={openAddCustomMetric}
      />

      <ImagePreviewModal
        isVisible={values.isImageModalVisble}
        imageUri={values.imageUri}
        primaryColor={Colors.primaryColor}
      />

      <MetricsModal
        isVisible={values.isMetricsModalVisible}
        onClose={() => handleValueUpdate({ isMetricsModalVisible: false })}
        onSave={saveMetrics}
        metrics={values.currentMetric.metrics ?? []}
        title={values.currentMetric.type ?? ''}
        Colors={Colors}
        DEffect={DEffect}
        onMetricsChange={(metrics) => handleValueUpdate({
            currentMetric: {
                ...values.currentMetric,
                metrics,
            }
        })}
      />

      <InfoModal
        isVisible={values.isInfoModalVisible}
        onClose={() => handleValueUpdate({ isInfoModalVisible: false })}
        description={values.currentMetric.message ?? ''}
        Colors={Colors}
      />

      <AddCustomMetricsModal
        isVisible={values.isAddMetricModalVisible}
        onClose={() => handleValueUpdate({ isAddMetricModalVisible: false })}
        Colors={Colors} 
        metrics={values.customMetrics} 
        onMetricChange={(metrics) => handleValueUpdate({customMetrics: metrics})}
        onSave={saveMetrics}
      />
    </>
  );
};

export default HomeActionButton;
