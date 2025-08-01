// src/pages/ExperimentPage.tsx
import { useState } from 'react';
// import { useEffect, useRef } from 'react';
import styles from './ExperimentPage.module.css';
import config from '.././config';

export default function ExperimentPage() {
    const [rationalMode, setRationalMode] = useState(false);
    // const [videoPath, setVideoPath] = useState('clothes/10.mp4');
    // const videoRef = useRef<HTMLVideoElement>(null);

    // useEffect(() => {
    //     setVideoPath('clothes/10.mp4');
    // }, [rationalMode]);

    return (
        <div className={styles.pageCenter}>
            {/* 开关：相对于这个居中的容器左上角 */}
            <label className={styles.switchWrapper}>
                <input
                    type="checkbox"
                    checked={rationalMode}
                    onChange={() => setRationalMode(prev => !prev)}
                />
                <span className={styles.slider} />
                <span className={styles.labelText}>
          理性消费模式
        </span>
            </label>
            {/* <div className={styles.videoBox}>
                <video
                    ref={videoRef}
                    width={640}
                    controls
                    autoPlay
                    key={videoPath}
                    src={`/src/assets/videos/${videoPath}`}
                />
            </div> */}
            <video src={`${config.BACKEND_BASE_URL}/media/videos/10.mp4`} controls />
        </div>
    );
}