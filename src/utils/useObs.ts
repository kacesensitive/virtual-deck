import { useState, useEffect } from 'react';
import OBSWebSocket from 'obs-websocket-js';

const useOBS = (url: string, password: string) => {
    const obs = new OBSWebSocket();
    const [obsStatus, setObsStatus] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let retryInterval: ReturnType<typeof setInterval>;

        if (retryCount < 10) {
            obs.connect(url, password)
                .then(() => {
                    console.log('Connected to OBS');
                    setObsStatus(true);
                    setRetryCount(0);
                })
                .catch(err => {
                    console.error('Could not connect to OBS:', err);
                    setObsStatus(false);
                    setRetryCount((prev) => prev + 1);
                    retryInterval = setInterval(() => {
                        obs.connect(url, password)
                            .then(() => {
                                console.log('Reconnected to OBS');
                                setObsStatus(true);
                                setRetryCount(0);
                                clearInterval(retryInterval);
                            })
                            .catch(err => {
                                console.error('Reconnection failed:', err);
                                setRetryCount((prev) => prev + 1);
                            });
                    }, 5000);
                });
        }

        return () => {
            clearInterval(retryInterval);
        };
    }, [url, password, retryCount]);

    return {
        obsStatus,
        obs
    };
};

export default useOBS;