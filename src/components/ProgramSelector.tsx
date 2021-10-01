import { LoadErrorProps } from './game/LoadError'
import React, { useState } from 'react'
import { Button, FormControl, NativeSelect } from '@material-ui/core'
import $ from './game/Game.module.scss'
import PublishIcon from '@material-ui/icons/Publish'
import { BaseErrorScreen } from './ErrorScreen'
import { MultiProgramException } from './game/gameProject'

export const ProgramSelector = <T extends MultiProgramException>({ error, reload }: LoadErrorProps<T>) => {
  const [program, setProgram] = useState<string>() // TODO: Tenerlo en la URL?

  function selector(){
    const button = {
      children: (
        <Button style={{ float: 'right' }} startIcon={<PublishIcon />} onClick={() => program && reload(error.files, program)} variant="contained" color="primary">
          Cargar Juego
        </Button>
      ),
    }

    return (
      <BaseErrorScreen description = 'Se encontraron varios programas en el proyecto. Seleccione uno para continuar:'
        bottom = { button }>
        <FormControl className={$.wpgmPicker}>
          <NativeSelect defaultValue="" style={{ padding: '0.75%' }} onChange={(e) => setProgram(e.target.value) }>
            <option value="" disabled>Seleccione el programa para correr el juego</option>
            {error.wpgmFiles.map((file, i) => <option key={i} value={file.name}>{file.name}</option>)}
          </NativeSelect>
        </FormControl>
      </BaseErrorScreen>
    )
  }

  return selector()
}