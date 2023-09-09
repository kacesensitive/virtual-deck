import { Button } from "@mui/material";
import { invoke, path, tauri } from "@tauri-apps/api";
import { useState, useEffect } from "react";

interface CustomButtonProps {
    obs: any;
    onContextMenu: (e: React.MouseEvent) => void;
    command?: string;
    name?: string;
    colorStart?: string;
    colorEnd?: string;
    textColor?: string;
    sceneName?: string;
    image?: File;
    imageName: string;
    appSettings?: any;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    command,
    name,
    colorStart,
    colorEnd,
    textColor,
    sceneName,
    imageName,
    obs,
    appSettings,
    onContextMenu,
}) => {
    const [clicked, setClicked] = useState(false);
    const [imagePath, setImagePath] = useState("");

    useEffect(() => {
        (async () => {
            if (imageName) {
                try {
                    const userDir: string = await invoke('get_user_dir');
                    const basePath = await path.join(userDir, 'Library/Application Support/com.kacey.dev');
                    const newImagePath = await path.join(basePath, imageName);
                    const apiPath = tauri.convertFileSrc(newImagePath);
                    setImagePath(apiPath);
                } catch (error) {
                    console.error('Failed to get user directory or image path:', error);
                }
            } else {
            }
        })();
    }, [imageName]);

    const runCommand = async () => {
        setClicked(true);
        try {
            const output = await invoke<string>('run_command', { command });
            console.log(output);
        } catch (err) {
            console.error(`Error executing ${command}:`, err);
        }
        setTimeout(() => setClicked(false), 200);
    };
    const changeScene = async () => {
        setClicked(true);
        try {
            obs.connect(appSettings.obsAddress, appSettings.obsPassword).then(() => {
                obs.call('SetCurrentProgramScene', { 'sceneName': sceneName })
            });
        } catch (err) {
            console.error(`Error changing to scene ${sceneName}:`, err);
        }
        setTimeout(() => setClicked(false), 200);
    };
    const gradient = `linear-gradient(45deg, ${colorStart} 30%, ${colorEnd} 90%)`;
    return (
        <div className={`square-button ${clicked ? 'clicked' : ''}`} onContextMenu={onContextMenu}>
            <Button
                style={{
                    background: !imagePath ? gradient : undefined,
                    color: textColor,
                    position: 'relative',
                    padding: '10px',
                    textAlign: 'center',
                }}
                onClick={() => {
                    if (sceneName !== '') changeScene();
                    if (command !== '') runCommand();
                }}
            >
                {imagePath &&
                    <img
                        src={imagePath}
                        alt="img"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '100%',
                            height: '100%',
                            transform: 'translate(-50%, -50%)',
                            objectFit: 'contain',
                            zIndex: -1,
                        }}
                    />
                }
                {name}
            </Button>
        </div>
    );
};
