import * as React from 'react'
import Drawer from '@material-ui/core/Drawer'
import { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import $ from './DrawerReadme.module.scss'
import { MenuItem } from '@material-ui/core'
type Anchor = 'top' | 'left' | 'bottom' | 'right'


export type DescriptionProps = {
  description: string
  children: ReactNode
  close: () => void
}
export const DrawerReadme = ({ description, children }: DescriptionProps) => {
  const [state, setState] = React.useState({ right: false })

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
      () => {
        setState({ ...state, [anchor]: open })
      }

  return (
    <div>
      <React.Fragment key={'right'}>
        <MenuItem onClick={toggleDrawer('right', true)}>{children}</MenuItem>
        <Drawer
          anchor={'right'}
          open={state['right']}
          onClose={toggleDrawer('right', false)}
          className={$.container}
        >
          <div style={{ backgroundColor: '#1c1a1c', height:'100%' }}>
            <ReactMarkdown source={description} className={$.description}/>
          </div>
        </Drawer>
      </React.Fragment>
    </div>
  )
}