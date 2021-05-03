export default {
  'image.advanced': {
    on({ store }) {
      window.open(store.getAdvancedUrl(), '_blank')
    },
  },
}
