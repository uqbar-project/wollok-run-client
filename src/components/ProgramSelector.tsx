import { MultiProgramErrorProps } from './game/LoadError'
import React, { useState } from 'react'
import { Button, FormControl, NativeSelect } from '@material-ui/core'
import $ from './game/Game.module.scss'
import PublishIcon from '@material-ui/icons/Publish'
import { BaseErrorScreen } from './ErrorScreen'

export const ProgramSelector = ({ error, reload }: MultiProgramErrorProps) => {
  const [program, setProgram] = useState<string>() // TODO: Tenerlo en la URL?

  function selector(){
    const props = {
      description: 'Se encontraron varios programas en el proyecto. Seleccione uno para continuar:',
      children: (
        <>
          <FormControl className={$.wpgmPicker}>
            <NativeSelect defaultValue="" style={{ padding: '0.75%' }} onChange={(e) => setProgram(e.target.value) }>
              <option value="" disabled>Seleccione el programa para correr el juego</option>
              {error.wpgmFiles.map((file, i) => <option key={i} value={file.name}>{file.name}</option>)}
            </NativeSelect>
          </FormControl>
        </>
      ),
      bottom: {
        children: (
          <Button style={{ float: 'right' }} startIcon={<PublishIcon />} onClick={() => program && reload(error.files, program)} variant="contained" color="primary">
            Cargar Juego
          </Button>
        ),
      },
    }

    return <BaseErrorScreen { ... props } />
  }

  return selector()
}