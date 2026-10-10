import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../constants';

const VideoRecorder = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [cameraType, setCameraType] = useState<'back' | 'front'>('front');
    const cameraRef = useRef<Camera>(null);
    const device = useCameraDevice(cameraType); // Use the back camera for recording

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            const microPhoneStatus = await Camera.requestMicrophonePermission();
            setHasPermission(status === 'granted' && microPhoneStatus === 'granted');
        })();
    }, []);

    // Start recording the video
    const startRecording = async () => {
        if (cameraRef.current && !isRecording) {
            try {
                setIsRecording(true);
                const video = cameraRef.current.startRecording({
                    onRecordingFinished: (video) => {
                        console.log('Recording finished:', video);
                        setIsRecording(false);
                    },
                    onRecordingError: (error) => {
                        console.error('Recording error:', error);
                        setIsRecording(false);
                    },
                });
            } catch (error) {
                console.error('Failed to start recording:', error);
                setIsRecording(false);
            }
        }
    };

    // Stop recording the video
    const stopRecording = async () => {
        if (cameraRef.current && isRecording) {
            await cameraRef.current.stopRecording();
            setIsRecording(false);
        }
    };

    // Switch between front and back cameras
    const switchCamera = () => {
        setCameraType((prevCameraType) => (prevCameraType === 'back' ? 'front' : 'back'));
    };

    if (device == null) return <Text>Loading camera...</Text>;
    if (!hasPermission) return <Text>No camera permission</Text>;

    return (
        <>
            {/* Camera Preview */}
            <Camera
                style={StyleSheet.absoluteFill}
                ref={cameraRef}
                device={device}
                isActive={true}
                video={true}
                audio={true} // Enable audio recording
            />

            {/* Switch Camera Button */}
            <TouchableOpacity
                style={styles.switchCameraButton}
                onPress={switchCamera}
            >
                <Icon name="refresh" size={24} color="#000" />
            </TouchableOpacity>

            {/* Record/Stop Button */}
            <TouchableOpacity
                style={[styles.recordButton, isRecording ? styles.stopButton : null]}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <Icon
                    name={isRecording ? 'stop' : 'video-camera'} // Change icon based on recording state
                    size={24}
                    color="#000"
                />
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    recordButton: {
        position: 'absolute',
        bottom: 20,
        left: '50%',
        marginLeft: -25,
        width: 50,
        height: 50,
        backgroundColor: Colors.white,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: Colors.red,
    },
    switchCameraButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 50,
        height: 50,
        backgroundColor: Colors.white,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VideoRecorder;