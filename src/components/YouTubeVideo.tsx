import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const YouTubeVideo = () => {
    const [playing, setPlaying] = useState(false);
    const playerRef = useRef(null);

    useEffect(() => {
        togglePlaying()
    }, [])

    const onStateChange = useCallback((state: any) => {
        if (state === 'ended') {
            setPlaying(false);
            //   alert('Video has finished playing!');
        }
    }, []);

    const togglePlaying = useCallback(() => {
        setPlaying((prev) => !prev);
    }, []);

    return (
        <View style={styles.container}>
            <YoutubePlayer
                ref={playerRef}
                height={200}
                // width={null}
                videoId={'RLDCb7W5xNo'} // Replace with your video ID
                play={playing}
                onChangeState={onStateChange}
                webViewStyle={{ borderRadius: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden'
    },
    playingText: {
        marginTop: 20,
        fontSize: 18,
        color: 'blue',
    },
});

export default YouTubeVideo;