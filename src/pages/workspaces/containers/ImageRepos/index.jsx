import React from 'react'
import ImageStore from 'stores/image'

import { Avatar } from 'components/Base'
import Banner from 'components/Cards/Banner'
import Table from 'components/Tables/List'
import withList, { ListPage } from 'components/HOCs/withList'

/* const MetricTypes = {
  artifacts: 'namespace_artifacts',
  pulls: 'namespace_pulls',
} */

@withList({
  store: new ImageStore(),
  name: 'Image Repo',
  module: 'imagerepos',
  injectStores: ['rootStore', 'workspaceStore'],
})
export default class ImageRepos extends React.Component {
  get itemActions() {
    return []
  }

  get tableActions() {
    const { tableProps, trigger } = this.props
    return {
      ...tableProps.tableActions,
      actions: [
        {
          key: 'advanced',
          type: 'control',
          text: t('Advanced'),
          action: 'advanced',
          onClick: () => trigger('image.advanced'),
        },
      ],
    }
  }

  getData = params => {
    this.store.fetchList({
      workspace: this.match.params.workspace,
      ...params,
    })
  }

  getColumns = () => {
    const { getSortOrder } = this.props
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        render: name => <Avatar to={`imagerepos/${name}`} title={name} />,
      },
      {
        title: t('Artifacts'),
        key: 'artifact_count',
        isHideable: true,
      },
      {
        title: t('Pulls'),
        key: 'pull_count',
        isHideable: true,
      },
    ]
  }

  render() {
    const { bannerProps, tableProps } = this.props

    return (
      <ListPage {...this.props}>
        <Banner
          {...bannerProps}
          title={t('Image Repositories')}
          description={t('IMAGE_REPOSITORIES_DESC')}
        />
        <Table
          {...tableProps}
          tableActions={this.tableActions}
          itemActions={this.itemActions}
          columns={this.getColumns()}
          searchType="name"
        />
      </ListPage>
    )
  }
}
