import PropTypes from 'prop-types'
import React, { createContext } from 'react'

export const Context = createContext()

export class Provider extends React.Component {
  static propTypes = { children: PropTypes.node.isRequired }
  state = {
    count: 0
  }
  decrement = () => {
    this.setState({
      count: this.state.count - 1
    })
  }
  increment = () => {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    const value = {
      count: this.state.count,
      decrement: this.decrement,
      increment: this.increment,
    }
    return (
      <Context.Provider value={value}>
        {this.props.children}
      </Context.Provider>

    )
  }
}