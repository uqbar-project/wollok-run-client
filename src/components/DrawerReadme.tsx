import * as React from 'react';
import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import $ from './game/Game.module.scss'

type Anchor = 'top' | 'left' | 'bottom' | 'right';


export type DescriptionProps = {
  description: string
}
export const DrawerReadme = ({ description }: DescriptionProps) => {
  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.MouseEvent) => {
      setState({ ...state, [anchor]: open });
    };

  const list = (anchor: Anchor) => (
    <Box
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
    >
      <ReactMarkdown source={description} className={$.description} />
    </Box>
  );

  return (
    <div>
      <React.Fragment key={'right'}>
          <Button onClick={toggleDrawer('right', true)}>{'right'}</Button>
          <Drawer
            anchor={'right'}
            open={state['right']}
            onClose={toggleDrawer('right', false)}
          >
            {list('right')}
          </Drawer>
        </React.Fragment>
    </div>
  );
}