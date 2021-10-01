import * as React from 'react';
import {Box, IconButton, Typography, Modal} from '@material-ui/core'
import $ from './ModalFileSelector.module.scss'
import { ReactNode } from 'react';

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
            <Typography id="modal-modal-title" variant="h6" component="h2">
            Lorem Ipsum jest tekstem stosowanym jako przykładowy wypełniacz w przemyśle poligraficznym. 
            Został po raz pierwszy użyty w XV w. przez nieznanego drukarza do wypełnienia tekstem próbnej książki. 
            Pięć wieków później zaczął być używany przemyśle elektronicznym, pozostając praktycznie niezmienionym. 
            Spopularyzował się w latach 60. XX w. wraz z publikacją arkuszy Letrasetu, zawierających fragmenty Lorem Ipsum,
             a ostatnio z zawierającym różne wersje Lorem Ipsum oprogramowaniem przeznaczonym do realizacji druków na komputerach
              osobistych, jak Aldus PageMaker
            </Typography>
        </Box>
      </Modal>
    </div>
  );
}