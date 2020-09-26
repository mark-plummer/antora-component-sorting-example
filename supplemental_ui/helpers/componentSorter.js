'use strict'

module.exports = (components, sortOrder = undefined) => {
  if (sortOrder) {
    components = Object.assign({}, components)
    sortOrder = sortOrder.split(',').map((componentName) => componentName.trim())

    let restIdx
    let i = 0
    const sortedComponents = sortOrder.reduce((accum, name) => {
      if (name === '*') {
        restIdx = i
      } else if (name.startsWith('!')) {
        if ((name = name.slice(1)) in components) {
          delete components[name]
        } else {
          console.log(`no such component to omit named: ${name}`)
        }
      } else if (name in components) {
        i++
        accum.push(components[name])
        delete components[name]
      } else {
        console.log(`no such component named: ${name}`)
      }
      return accum
    }, [])
    if (restIdx !== undefined) {
      sortedComponents.splice(restIdx, 0, ...Object.values(components))
    } else if (Object.keys(components).length) {
      console.log(`Components ${Object.keys(components).join(', ')} not ordered or hidden`)
    }
    return sortVersions(sortedComponents)
  } else {
    return sortVersions(Object.values(components))
  }
}

function sortVersions (components) {
  return components.map((component) => {
    component = Object.assign({ name: component.name, title: component.title }, component)
    const versions = component.versions.slice()
    versions.sort((v1, v2) => {
      const k1 = v1.asciidoc.attributes['version-sort-key']
      const k2 = v2.asciidoc.attributes['version-sort-key']
      if (k1) {
        if (k2) {
          return k2.localeCompare(k1)
        }
        return -1
      }
      if (k2) return 1
      return component.versions.indexOf(v1) - component.versions.indexOf(v2)
    })
    component.versions = versions
    return component
  })
}
