// Smooth-scroll to a section of the single-page layout (navbar is 64px tall; sections use scroll-mt-16).
export function scrollToId(id) {
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
