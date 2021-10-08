import React from 'react'
import cookingRalfImage from './assets/cookingralf.png'
import twoDoorsImage from './assets/twodoors.png'
import snakeImage from './assets/snake.png'
import pepeMueveCajasImage from './assets/pepeMueveCajas.png'
import { loadGitRepo } from '../filesSelector/GitSelector'
import { ButtonBase, Grid, Paper, Typography } from '@material-ui/core'

const games = [
  {
    title: 'Cooking Ralf',
    image: cookingRalfImage,
    url: 'https://github.com/pdepjm/juego-overcooked',
    description: 'Inspirado en el clasico Overcooked, Cooking Ralf pone a prueba las habilidades de cocina y, sobre todo, de cooperación.',
  },
  {
    title: 'Two Doors',
    image: twoDoorsImage,
    url: 'https://github.com/algo1unsam/2020s1-tp-juego-the-two-doors',
    description: 'Estás en un experimento en el cual tenés que escapar de un lugar a base de ir eligiendo de a dos puertas, una con pistas y otra misteriosa. De esta manera, se estudiará qué tanto le temés a lo desconocido.',
  },
  {
    title: 'Pepe el mueve cajas',
    image: pepeMueveCajasImage,
    url: 'https://github.com/algo1unsam/2021s1-tp-grupal-juego-mentagranizada',
    description: 'Pepe consiguió un nuevo trabajo en el supermercado TOCO, y en su primer día debe ordenar la mercadería del depósito. Ayudá a Pepe a acomodar las cajas y ponerlas en el lugar que les corresponde para completar todas sus tareas. Basado en el juego Sokoban.',
  },
  {
    title: 'Snake',
    image: snakeImage,
    url: 'https://github.com/pdepjm/2020-o-tpi-juego-fate_zero',
    description: 'Juego clásico de la serpiente, Snake Game, en el cual el jugador controla a una serpiente y trata de comer frutas que se le aparecen aleatoriamente para ganar puntos y que esta última se alargue.',
  },
]

const FeaturedGames = () => (<div style={{ display: 'block' }}>
  <h1>También podés probar algunos de los juegos ya creados!</h1>
  <br />
  <Grid container spacing={2} justify="center">
    {games.map(({ image, title, description, url }, index) => (
      <Grid item style={{ maxWidth: '300px', height: '350px' }} key={index}>
        <Paper style={{ height: '100%' }}>
          <ButtonBase onClick={() => loadGitRepo(url)}>
            <img style={{ maxWidth: '98%', marginTop: '1%', maxHeight: '175px' }} src={image} alt="" />
          </ButtonBase>
          <Grid item xs={12} sm container style={{ marginTop: '2%' }}>
            <Grid item xs container direction="column" spacing={1}>
              <Grid item xs >
                <Typography gutterBottom variant="h6">
                  {title}
                </Typography>
                <Typography style={{ paddingLeft: '5px', paddingRight: '5px' }} align="justify" variant="body1">
                  {description}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </ Grid>
    ))}
  </Grid>
</div>)

export default FeaturedGames