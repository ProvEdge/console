import React from 'react'
import PropTypes from 'prop-types'

import { Icon } from '@kube-design/components'

import { Link } from 'react-router-dom'

import styles from './index.scss'

class RouteButton extends React.Component {
  static propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    link: PropTypes.string,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    icon: '',
    title: '',
    link: '',
    onClick() {},
  }

  render() {
    const { icon, title, link, onClick } = this.props

    return (
      <Link to={`/${link}`} data-name={title} onClick={onClick}>
        <div className={styles.routeButton}>
          <div className={styles.icon}>
            <Icon name={icon} size={24} type="dark" />
          </div>
          <div className={styles.title}>{t(title)}</div>
        </div>
      </Link>
    )
  }
}

export default RouteButton
