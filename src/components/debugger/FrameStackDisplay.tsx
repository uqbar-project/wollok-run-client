import React, { useContext } from 'react'
import { DebuggerContext } from './Debugger'
import $ from './FrameStackDisplay.module.scss'
import { nodeLabel } from './utils'

const FrameStackDisplay = () => {
  const { interpreter } = useContext(DebuggerContext)

  return (
    <div className={$.FrameStackDisplay}>
      <h2>Frame Stack</h2>
      <div className={$.stack}>
        {
          [...interpreter.evaluation.frameStack].reverse().map((frame, frameIndex) =>
            <div key={`${frame.node.id}${frameIndex}`}>
              {nodeLabel(frame.node)}
            </div>
          )
        }
      </div>

      <h2>Locals</h2>
      <div>
        {
          interpreter.evaluation.currentFrame.contextHierarchy().map(context => {
            return <div key={context.id} className={$.context}>
              <h4>{context.id}</h4>
              <div className={$.stack}>
                {[...context.locals.keys()].map(local => {
                  const value = context.get(local)
                  const stringValue = interpreter.fork().do(
                    function* () {
                      return value && (yield* this.send('toString', value))
                    }).finish()

                  const valueLabel = stringValue.error ? 'ERROR!' : stringValue.result?.innerValue ?? 'null'

                  return <div className={$.local} key={local}>
                    <div>{local}</div>
                    <div>{valueLabel}</div>
                  </div>
                })}
              </div>
            </div>
          })
        }
      </div>
    </div>
  )
}

export default FrameStackDisplay