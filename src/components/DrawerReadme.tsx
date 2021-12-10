import * as React from 'react'
import Drawer from '@material-ui/core/Drawer'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import $ from './DrawerReadme.module.scss'
import { Parent } from './utils'
import { MenuButton, unselectButton } from './Menu'


interface DescriptionProps extends Parent {
  description: string
}

const readmeID = 'readmeID'

export const DrawerReadme = ({ description, children }: DescriptionProps) => {
  const [state, setState] = useState({ right: false })

  const toggleDrawer =
    (open: boolean) =>
      () => {
        unselectButton(readmeID)
        setState({ ...state, right: open })
      }

  return (
    <div>
      <React.Fragment key={'right'}>
        <MenuButton id={readmeID} style={{ color: 'white' }} action={ toggleDrawer(true) }>{ children }</MenuButton>
        <Drawer
          anchor={'right'}
          open={state['right']}
          onClose={toggleDrawer(false)}
          className={$.container}
        >
          <div style={{ backgroundColor: '#1c1a1c', height:'100%' }}>
            <ReactMarkdown escapeHtml={false} source={description} className={$.description}/>
          </div>
        </Drawer>
      </React.Fragment>
    </div>
  )
}