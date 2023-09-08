import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface DeleteDialogComponentProps {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    confirmDelete: () => void;
}

export const DeleteDialogComponent: React.FC<DeleteDialogComponentProps> = ({ deleteDialogOpen, setDeleteDialogOpen, confirmDelete }) => (
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
            Are you sure you want to delete this button?
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete}>Delete</Button>
        </DialogActions>
    </Dialog>
);
