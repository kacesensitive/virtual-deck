import { BaseDirectory, writeBinaryFile } from "@tauri-apps/api/fs";
import { ButtonProps } from "../types/types";

export const saveImage = async (buttonData: any): Promise<ButtonProps | any> => {
    if (buttonData?.image) {
        const file = buttonData.image;
        try {
            console.log('Reading file data');
            const base64data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    if (reader.result && typeof reader.result === 'string') {
                        resolve(reader.result.split(',')[1]);
                    } else {
                        reject(new Error('Failed to read file data'));
                    }
                };
            });
            console.log('Saving file');
            const binaryString = window.atob(base64data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const response = await writeBinaryFile(buttonData.id + '.png', bytes, { dir: BaseDirectory.AppData });
            console.log('File saved successfully', buttonData, response);
            return { ...buttonData, imageName: buttonData.id + '.png' };
        } catch (error) {
            console.error('Failed to save file', error);
            return buttonData;
        }
    } else {
        return buttonData;
    }
};