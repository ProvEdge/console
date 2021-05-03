import { get, omit } from 'lodash'
import { action, observable } from 'mobx'
import { LIST_DEFAULT_ORDER } from 'utils/constants'

import Base from './base'

export default class ImageStore extends Base {
  @observable
  initializing = true

  module = 'image'

  getListUrl = () => {
    return `${this.apiVersion}/listRepos`
  }

  getWatchListUrl = ({ workspace, ...params }) => {
    return `api/v1/watch${this.getPath(params)}/namespaces`
  }

  getArtifactUrl = () => {
    // return `${this.apiVersion}/${workspace}/artifacts`
  }

  getAdvancedUrl = () => {
    return 'http://116.203.78.99:30002/'
  }

  @action
  async fetchList({ workspace, ...params } = {}) {
    this.list.isLoading = true

    if (!params.sortBy && params.ascending === undefined) {
      params.sortBy = LIST_DEFAULT_ORDER[this.module] || 'createTime'
    }

    if (params.limit === Infinity || params.limit === -1) {
      params.limit = -1
      params.page = 1
    }

    params.limit = params.limit || 10

    const result = await request.get(this.getListUrl({ workspace }))
    const data = get(result, 'harbor-repos', []).map(item => ({
      /* cluster, */
      ...this.mapper(item),
    }))

    this.list.update({
      data,
      total: result.totalItems || result.total_count || data.length || 0,
      ...omit(params, 'labelSelector'),
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    })

    return data
  }
}
