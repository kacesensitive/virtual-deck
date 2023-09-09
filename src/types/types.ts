export type ButtonProps = {
    command: string;
    name: string;
    colorStart: string;
    colorEnd: string;
    textColor: string;
    sceneName: string;
    image?: File;
    imageName: string;
    id: string;
};

export type Config = {
    buttons: ButtonProps[];
};

export type AppSettings = {
    obsAddress: string;
    obsPassword: string;
};