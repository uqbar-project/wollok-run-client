import wollok.game.*

object pepita{
  var hambre = 10

  method position() = game.at(0,0)

  method image() = "pepita.png"

  method comer(){
    hambre -= 1
  }

}