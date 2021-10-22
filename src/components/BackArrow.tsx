import { Button } from '@material-ui/core'
import { Link } from '@reach/router'
import React from 'react'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

type BackArrowProps = { returnPath: string }

type BackArrowToProps = { action: () => void }

export const BackArrow = ({ returnPath }: BackArrowProps) =>
  <Button color="primary" component={Link} to={returnPath} startIcon={<ArrowBackIcon />} variant="contained">Volver</Button>

export const BackArrowTo = ({ action }: BackArrowToProps) => <Button color="primary" onClick={action} startIcon={<ArrowBackIcon />} variant="contained">Volver</Button>