import * as React from 'react';
import {Box, IconButton, Typography, Modal} from '@material-ui/core'
import $ from './ModalFileSelector.module.scss'
import { ReactNode } from 'react';
import Game from './game/Game';

export type ModalProps = {
    children: ReactNode
  }
export const ModalFileSelector = ({ children }: ModalProps) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <IconButton style={{color: 'white'}} onClick={handleOpen}> {children} </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={$.box}>
            <Game />
        </Box>
      </Modal>
    </div>
  );
}