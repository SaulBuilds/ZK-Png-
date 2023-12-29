import React from 'react';
import { Dialog, DialogTitle, DialogContent, LinearProgress, Typography } from '@mui/material';

// Define type for props
interface ProgressModalProps {
  open: boolean;
  progress: {
    completed: number;
    total: number;
  };
  privateKeys: Record<string, string>;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ open, progress, privateKeys }) => {
    return (
        <Dialog open={open}>
            <DialogTitle>Encryption Progress</DialogTitle>
            <DialogContent>
                <LinearProgress variant="determinate" value={(progress.completed / progress.total) * 100} />
                <Typography>{`Completed: ${progress.completed}/${progress.total}`}</Typography>
                <div>
                    {Object.entries(privateKeys).map(([imageName, privateKey]) => (
                        <Typography key={imageName}>{`Image: ${imageName}, Private Key: ${privateKey}`}</Typography>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProgressModal;
