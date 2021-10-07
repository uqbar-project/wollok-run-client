import React, { useState } from 'react'
import GitSelector, { loadGitFiles } from './GitSelector'
import LocalSelector from './LocalSelector'
import Spinner from '../Spinner'
import $ from './FilesSelector.module.scss'
import { WollokLogo } from '../Home/Home'
import { BackArrow } from '../BackArrow'
import { ButtonBase, Grid, Paper, Typography } from '@material-ui/core'
import { featuredGames } from './assets/featuredGames'

const GIT = 'git'

export type File = {
  name: string
  content: Buffer
}

export type FilesCallback = (files: File[]) => void

export type SelectorProps = FilesSelectorProps & { onStartLoad: () => void }

type FilesSelectorProps = { onFilesLoad: FilesCallback }
const FilesSelector = (props: FilesSelectorProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const onStartLoad = () => setLoading(true)
  const cargarJuego = (url: string) => {
    loadGitFiles({...props, onStartLoad} )(url)
    document.location.search = `${GIT}=${url}`
  }

  return loading
    ? <Spinner />
    : <div className={$.container}>
      <div><BackArrow returnPath='/' /></div>
      <WollokLogo />
      <div>
        <GitSelector {...props} onStartLoad={onStartLoad} />
        <LocalSelector {...props} onStartLoad={onStartLoad} />
      </div>
      <div className={$.breaker} />
      <h1>También podés probar algunos de los juegos ya creados!</h1>
      <Grid container spacing={2} justify="center">
        {featuredGames.map(({ image, title, description, url }, index) => (
          <Grid item style={{ maxWidth:'300px', height:'350px' }} key={index}>
            <Paper style={{ height:'100%' }}>
              <ButtonBase onClick={() => { cargarJuego(url) }}>
                <img style={{ maxWidth:'98%', marginTop:'1%', maxHeight:'175px' }} src={image} alt="" />
              </ButtonBase>
              <Grid item xs={12} sm container style={{ marginTop:'2%' }}>
                <Grid item xs container direction="column" spacing={1}>
                  <Grid item xs >
                    <Typography gutterBottom variant="h6">
                      {title}
                    </Typography>
                    <Typography style={{ paddingLeft:'5px', paddingRight:'5px' }} align="justify" variant="body1">
                      {description}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </ Grid>
        ))}
      </Grid>
    </div>
}

export default FilesSelector