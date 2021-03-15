/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { get } from 'lodash'

import { renderRoutes } from 'utils/router.config'
import { Nav, RouteButton } from 'components/Layout'
import Selector from 'projects/components/Selector'

@inject('rootStore', 'projectStore')
@observer
class ProjectLayout extends Component {
  getRoutes(navs) {
    const { routes, path } = this.props.route
    const nav = get(navs, '[0].items[0]', {})
    const name = get(nav.children, '[0].name') || nav.name

    if (!name) {
      return []
    }

    if (routes) {
      routes.forEach(route => {
        if (route.path === path && route.redirect) {
          route.redirect.to = `${path}/${name}`
        }
      })
    }
    return routes
  }

  handleChange = url => this.props.rootStore.routing.push(url)

  render() {
    const { match, location } = this.props
    const { workspace, cluster, namespace } = match.params
    const { detail } = this.props.projectStore

    const navs = globals.app.getProjectNavs({
      cluster,
      workspace,
      project: namespace,
    })

    return (
      <div className="ks-page">
        <div className="ks-page-side">
          <RouteButton icon="dashboard" title="Workbench" link="dashboard" />
          <div>
            <Selector
              title={t('Projects')}
              detail={detail}
              onChange={this.handleChange}
            />
            <Nav
              className="ks-page-nav"
              navs={navs}
              location={location}
              match={match}
            />
          </div>
          {globals.app.getGlobalNavs().map(nav => (
            <RouteButton icon={nav.icon} title={nav.title} link={nav.name} />
          ))}
          {globals.app.enableAppStore && (
            <RouteButton icon="appcenter" title="App Store" link="apps" />
          )}
        </div>
        <div className="ks-page-main">{renderRoutes(this.getRoutes(navs))}</div>
      </div>
    )
  }
}

export default ProjectLayout
