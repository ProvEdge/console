import React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { isEmpty } from 'lodash'
import { Loading } from '@pitrix/lego-ui'

import { trigger } from 'utils/action'
import UserStore from 'stores/user'
import WorkspaceStore from 'stores/workspace'

import DetailPage from 'core/containers/Base/Detail/Page'

import routes from './routes'

@inject('rootStore')
@observer
@trigger
export default class ImageDetail extends React.Component {
  store = new UserStore()

  workspaceStore = new WorkspaceStore()

  componentDidMount() {
    this.fetchData()
  }

  get workspace() {
    return this.props.match.params.workspace
  }

  get module() {
    return this.store.module
  }

  get name() {
    return 'Artifact'
  }

  get listUrl() {
    return `/workspaces/${this.workspace}/imagerepos`
  }

  get routing() {
    return this.props.rootStore.routing
  }

  fetchData = () => {
    this.store.fetchDetail(this.props.match.params)
  }

  getOperations = () => []

  getAttrs = () => {
    const detail = toJS(this.store.detail)

    if (isEmpty(detail)) {
      return
    }

    return [
      {
        name: t('Repository'),
        value: this.workspace,
      },
    ]
  }

  render() {
    const stores = {
      detailStore: this.store,
      workspaceStore: this.workspaceStore,
    }

    if (this.store.isLoading && !this.store.detail.name) {
      return <Loading className="ks-page-loading" />
    }

    const sideProps = {
      module: this.module,
      name: this.store.detail.name,
      desc: this.store.detail.email,
      operations: this.getOperations(),
      attrs: this.getAttrs(),
      breadcrumbs: [
        {
          label: t('Image Repos'),
          url: this.listUrl,
        },
      ],
    }

    return <DetailPage stores={stores} routes={routes} {...sideProps} />
  }
}
