import * as conf from './conf'
import { useRef, useEffect} from 'react'
import { Obstacles, State, step, click, mouseMove, onKeyBoardMove, onKeyBoardUpUp , endOfGame} from './state'
import { render } from './renderer'

/*const randomInt = (max: number) => Math.floor(Math.random() * max)
const randomSign = () => Math.sign(Math.random() - 0.5)*/

const MapObstacles : Array<Array<number>> = []
for (let i = 0 ; i < conf.OBSTACLES.length ; i += 60){
  MapObstacles.push(conf.OBSTACLES.slice(i,i+60))
}

const obstaclesReel : Array<Obstacles> = []
MapObstacles.forEach((row,i) => {
  row.forEach((symbol,j) => {
    if (symbol === 421){
    obstaclesReel.push(
      {coord : 
        { x : (j * 64) - 1472, y : (i * 64) - 1568, dx : 0 , dy : 0}
      }
    )
    }
  }
  )
})


const initCanvas =
  (iterate: (ctx: CanvasRenderingContext2D) => void) =>
  (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    requestAnimationFrame(() => iterate(ctx))
  }

const Canvas = ({ height, width }: { height: number; width: number }) => {
  const initialState: State = {
    map : {
      coord : {
        x : -1472,
        y : -1568,
        dx : 0,
        dy :0
      },
      up : false,
      down : false,
      right : false,
      left : false,
      moving : true,
      input : '',
    },
    joueur : {
      coord: {
        x: width/2 ,
        y: height/ 2,
        dx: 0,
        dy: 0
      }, 
      frame : 0 
    },
    size: { width : 1024 , height : 576 },
    obstacles : obstaclesReel,
    endOfGame: true
  }

 
  const ref = useRef<any>()
  const state = useRef<State>(initialState)

  const iterate = (ctx: CanvasRenderingContext2D) => {
    state.current = step(state.current) 
    state.current.endOfGame = !endOfGame(state.current)
    render(ctx)(state.current)
    if (!state.current.endOfGame) requestAnimationFrame(() => iterate(ctx))
  }
  const onClick = (e: PointerEvent) => {
    state.current = click(state.current)(e)
  }

  const onMove = (e: PointerEvent) => {
    state.current = mouseMove(state.current)(e)
  }

  const onKeyBoard = (e: any) => {    
    state.current = onKeyBoardMove(state.current)(e)
  }


  const onKeyBoardUp = (e: any) => {
    state.current = onKeyBoardUpUp(state.current)(e)
  }

  useEffect(() => {
    if (ref.current) {
      initCanvas(iterate)(ref.current)
      ref.current.addEventListener('click', onClick)
      ref.current.addEventListener('mousemove', onMove)
      window.addEventListener('keydown', onKeyBoard)
      window.addEventListener('keyup', onKeyBoardUp)
    }
    return () => {
      ref.current.removeEventListener('click', onClick)
      ref.current.removeEventListener('mousemove', onMove)
      window.removeEventListener('keydown', onKeyBoard)
      window.removeEventListener('keyup', onKeyBoardUp)

    }
  }, [])
  return <canvas {...{ height  , width, ref }} />
}

export default Canvas
