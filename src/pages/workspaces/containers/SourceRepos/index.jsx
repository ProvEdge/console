/* 
import React from 'react'
import { computed } from 'mobx'
import { get } from 'lodash'
import { Tooltip, Icon } from '@pitrix/lego-ui'

import { Avatar, Status } from 'components/Base'
import Banner from 'components/Cards/Banner'
import Table from 'components/Tables/List'
import withList, { ListPage } from 'components/HOCs/withList'

import { getDisplayName, getLocalTime } from 'utils'
import { getSuitableValue, getValueByUnit } from 'utils/monitoring'

import ProjectStore from 'stores/project'
import ProjectMonitorStore from 'stores/monitoring/project'

const MetricTypes = {
  cpu: 'namespace_cpu_usage',
  memory: 'namespace_memory_usage_wo_cache',
  pod: 'namespace_pod_count',
}

@withList({
  store: new ProjectStore(),
  name: 'Artifact',
  module: 'projects',
  injectStores: ['rootStore', 'workspaceStore'],
})
export default class SourceRepos extends React.Component {
  workspaceStore = this.props.workspaceStore

  monitoringStore = new ProjectMonitorStore()

  handleTabChange = value => {
    const { workspace } = this.props.match.params
    this.props.routing.push(`/workspaces/${workspace}/${value}`)
  }

  get tabs() {
    return {
      value: this.props.module,
      onChange: this.handleTabChange,
      options: [
        {
          value: 'projects',
          label: t('Projects'),
        },
        {
          value: 'federatedprojects',
          label: t('Multi-cluster Projects'),
        },
      ],
    }
  }

  get showFederated() {
    return globals.app.isMultiCluster
  }

  @computed
  get clusters() {
    return this.workspaceStore.clusters.data.map(item => ({
      label: item.name,
      value: item.name,
      disabled: !item.isReady,
      cluster: item,
    }))
  }

  get workspace() {
    return this.props.match.params.workspace
  }

  get clusterProps() {
    return {
      clusters: this.clusters,
      cluster: this.workspaceStore.cluster,
      onClusterChange: this.handleClusterChange,
      showClusterSelect: globals.app.isMultiCluster,
    }
  }

  handleClusterChange = cluster => {
    this.workspaceStore.selectCluster(cluster)
  }

  getData = async ({ silent, ...params } = {}) => {
    const { store } = this.props

    silent && (store.list.silent = true)
    const { cluster } = this.workspaceStore
    if (cluster) {
      await store.fetchList({
        cluster,
        ...this.props.match.params,
        ...params,
        labelSelector:
          'kubefed.io/managed!=true, kubesphere.io/kubefed-host-namespace!=true',
      })
      const resources = store.list.data.map(item => item.name)
      if (resources.length > 0) {
        await this.monitoringStore.fetchMetrics({
          cluster,
          resources,
          ...this.props.match.params,
          metrics: Object.values(MetricTypes),
          last: true,
        })
      }
    }
    store.list.silent = false
  }

  get itemActions() {
    const { trigger } = this.props
    return [
      {
        key: 'edit',
        icon: 'pen',
        text: t('Edit'),
        action: 'edit',
        onClick: item => trigger('resource.baseinfo.edit', { detail: item }),
      },
      {
        key: 'quotaEdit',
        icon: 'pen',
        text: t('Edit Quota'),
        action: 'edit',
        onClick: item =>
          trigger('project.quota.edit', {
            type: t('Project'),
            detail: item,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('Delete'),
        action: 'delete',
        onClick: item =>
          trigger('resource.delete', {
            type: t('Project'),
            detail: item,
          }),
      },
    ]
  }

  getLastValue = (record, type, unit) => {
    const metricsData = this.monitoringStore.data
    const result = get(metricsData, `${type}.data.result`) || []
    const metrics = result.find(
      item => get(item, 'metric.namespace') === record.name
    )
    return getValueByUnit(get(metrics, 'value[1]', 0), unit)
  }

  getCheckboxProps = record => ({
    disabled: record.status === 'Terminating',
    name: record.name,
  })

  getColumns = () => {
    const { getSortOrder } = this.props
    return [
      {
        title: t('Artifacts'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        render: (name, record) => (
          <Avatar
            to={
              record.status === 'Terminating' || record.isFedHostNamespace
                ? null
                : `/${this.workspace}/clusters/${
                    record.cluster
                  }/projects/${name}`
            }
            desc={record.description || '-'}
            title={this.renderTitle(record)}
          />
        ),
      },
      {
        title: t('Pull Command'),
        key: 'namespace_artifacts',
        isHideable: true,
        render: record => this.getLastValue(record, MetricTypes.artifacts),
      },
      {
        title: t('Tags'),
        key: 'namespace_pulls',
        isHideable: true,
        render: record => this.getLastValue(record, MetricTypes.pulls),
      },
      {
        title: t('Size'),
        key: 'namespace_artifacts',
        isHideable: true,
        render: record => this.getLastValue(record, MetricTypes.artifacts),
      },
      {
        title: t('Vulnerabilities'),
        key: 'namespace_pulls',
        isHideable: true,
        render: record => this.getLastValue(record, MetricTypes.pulls),
      },
      {
        title: t('Annotations'),
        key: 'namespace_artifacts',
        isHideable: true,
        render: record => this.getLastValue(record, MetricTypes.artifacts),
      },
      {
        title: t('Labels'),
        key: 'namespace_pulls',
        isHideable: true,
        render: record => this.getLastValue(record, MetricTypes.pulls),
      },
      {
        title: t('Push Time'),
        key: 'namespace_artifacts',
        isHideable: true,
        render: record => this.getLastValue(record, MetricTypes.artifacts),
      },
      {
        title: t('Pull Time'),
        key: 'namespace_pulls',
        isHideable: true,
        render: record => this.getLastValue(record, MetricTypes.pulls),
      },
    ]
  }

  renderTitle(record) {
    if (record.isFedHostNamespace) {
      return (
        <span>
          <span className="margin-r8">{getDisplayName(record)}</span>
          <Tooltip content={t('FED_HOST_NAMESPACE_TIP')}>
            <Icon name="information" />
          </Tooltip>
        </span>
      )
    }

    return getDisplayName(record)
  }

  showCreate = () =>
    this.props.trigger('project.create', {
      ...this.props.match.params,
      defaultCluster: this.workspaceStore.cluster,
      success: cluster => {
        if (cluster) {
          this.workspaceStore.selectCluster(cluster)
        }
        this.getData({ silent: true })
      },
    })

  render() {
    const { match, bannerProps, tableProps } = this.props

    const matchParams = {
      ...match,
      params: {
        ...match.params,
        cluster: this.workspaceStore.cluster,
      },
    }

    const isLoadingMonitor = this.monitoringStore.isLoading

    return (
      <ListPage
        {...this.props}
        match={matchParams}
        getData={this.getData}
        module="namespaces"
      >
        <Banner {...bannerProps} tabs={this.showFederated ? this.tabs : {}} />
        <Table
          {...tableProps}
          itemActions={this.itemActions}
          columns={this.getColumns()}
          onCreate={null}
          searchType="name"
          {...this.clusterProps}
          isLoading={tableProps.isLoading || isLoadingMonitor}
          getCheckboxProps={this.getCheckboxProps}
        />
      </ListPage>
    )
  }
} */

import React from 'react'
import { observer, inject } from 'mobx-react'
import { isEmpty } from 'lodash'
import { Loading } from '@pitrix/lego-ui'
import Banner from 'components/Cards/Banner'
import { parse } from 'qs'

import ComponentStore from 'stores/component'

import Info from 'components/Cards/Info'

import styles from './index.scss'

@inject('rootStore')
@observer
export default class ServiceComponents extends React.Component {
  constructor(props) {
    super(props)

    const { type } = parse(location.search.slice(1)) || {}

    this.state = {
      type: type || 'kubesphere',
    }

    this.store = new ComponentStore()
    this.store.fetchList({ cluster: this.cluster })
  }

  get prefix() {
    return this.props.match.url
  }

  get cluster() {
    return this.props.match.params.cluster
  }

  handleTypeChange = type => {
    this.setState({ type })
  }

  renderCards(data) {
    return (
      <div className={styles.cards}>
        {data.map(item => (
          <Info key={item.name} component={item} cluster={this.cluster} />
        ))}
      </div>
    )
  }

  renderComponents(type) {
    const { data } = this.store.list
    const components = data[type]

    if (isEmpty(components)) {
      return null
    }

    return (
      <div className={styles.cardsWrapper}>{this.renderCards(components)}</div>
    )
  }

  renderList() {
    const { isLoading } = this.store.list
    const { type } = this.state

    if (isLoading) {
      return (
        <div className="loading">
          <Loading />
        </div>
      )
    }

    return this.renderComponents(type)
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <Banner
          icon="components"
          title={t('Source Repositories')}
          description={t('SOURCE_REPOSITORIES_DESC')}
        />
        {this.renderList()}
      </div>
    )
  }
}
