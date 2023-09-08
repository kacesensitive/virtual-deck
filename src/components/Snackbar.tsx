import { FC } from 'react';
import { Snackbar } from "@mui/material";

interface SnackbarComponentProps {
    snackBarOpen: boolean;
    setSnackBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SnackbarComponent: FC<SnackbarComponentProps> = ({ snackBarOpen, setSnackBarOpen }) => (
    <Snackbar
        open={snackBarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackBarOpen(false)}
        message="Config copied to clipboard"
    />
);
