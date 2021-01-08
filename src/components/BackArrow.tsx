import { Button } from '@material-ui/core'
import { Link } from '@reach/router'
import React from 'react'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

type BackArrowProps = { returnPath: string }

export const BackArrow = ({ returnPath }: BackArrowProps) =>
  <Button color="primary" component={Link} to={returnPath} startIcon={<ArrowBackIcon />} variant="contained">Volver</Button>