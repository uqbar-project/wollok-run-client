import React from 'react'
import cookingRalfImage from './assets/cookingralf.png'
import twoDoorsImage from './assets/twodoors.png'
import snakeImage from './assets/snake.png'
import pepeMueveCajasImage from './assets/pepeMueveCajas.png'
import { loadGitRepo } from '../filesSelector/GitSelector'
import { ButtonBase, Grid, Paper, Typography } from '@material-ui/core'
import $ from './FeaturedGames.module.scss'

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
  <Grid container spacing={2} className={$.container}>
    {games.map(({ image, title, description, url }, index) => (
      <Grid item style={{ maxWidth: '300px', height: '350px' }} key={index}>
        <Grid item xs={12} sm container style={{ marginTop: '2%' }}>
            <Grid item xs container direction="column" spacing={1}>
              <Grid item xs >
                <p className={$.title}>
                  {title}
                </p>
                <ButtonBase onClick={() => loadGitRepo(url)}>
                  <img className={$.screen} src={image} alt="" />
                </ButtonBase>
                <div className={$.keyboard}>
                  <div className={$.player}>
                    <div className={$.keyColumn}>
                      <span className={$.key1} />
                      <span className={$.key1} />
                    </div>
                    <div className={$.keyColumn}>
                      <span className={$.key1} />
                      <span className={$.key1} />
                    </div>
                    <div className={$.keyColumn}>
                      <span className={$.key1} />
                      <span className={$.key1} />
                    </div>
                    <div className={$.stick1}>
                      <span className={$.key1} />
                      <span className={$.pelotitaBase1} />
                    </div>
                  </div>
                  <div className={$.player}>
                    <div className={$.keyColumn}>
                      <span className={$.key1} />
                      <span className={$.key1} />
                    </div>
                    <div className={$.keyColumn}>
                      <span className={$.key1} />
                      <span className={$.key1} />
                    </div>
                    <div className={$.keyColumn}>
                      <span className={$.key1} />
                      <span className={$.key1} />
                    </div>
                    <div className={$.stick1}>
                      <span className={$.key1} />
                      <span className={$.pelotitaBase1} />
                    </div>
                  </div>
                </div>
                <Typography className={$.description} variant="body1">
                  {description}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
      </ Grid>
    ))}
  </Grid>
</div>)

export default FeaturedGames