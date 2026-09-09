import { Text } from 'react-native';

// Material Symbols (los nuevos de Google), no los Material Icons viejos de
// @expo/vector-icons. La fuente se pide a Google recortada a un juego de
// caracteres, no a una lista de iconos: entran todas las ligaduras que se
// escriban con esas letras.
//
//   https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&text=<letras>
//
// El subset que hay guardado pide el alfabeto entero mas los digitos y el guion
// bajo (`_0123456789abcdefghijklmnopqrstuvwxyz`), asi que **cualquier nombre de
// Material Symbols funciona** y no hay que volver a bajar nada al agregar un
// icono. Son 1.1MB; el subset chico de antes eran 335KB, la diferencia no
// justifica tener que regenerar la fuente cada vez (el selector de categorias
// deja elegir el icono a mano).
//
// El nombre del icono se escribe tal cual y la ligadura de la fuente lo
// convierte en el glifo.
export default function Icon({ name, size = 20, color, style }) {
  return <Text style={[{ fontFamily: 'MaterialSymbols', fontSize: size, lineHeight: size, color }, style]}>{name}</Text>;
}
