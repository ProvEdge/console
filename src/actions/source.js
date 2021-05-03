export default {
  'source.advanced': {
    on({ store }) {
      window.open(store.getAdvancedUrl(), '_blank')
    },
  },
}
