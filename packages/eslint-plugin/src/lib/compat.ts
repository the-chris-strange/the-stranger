import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export async function importOptionalPeer(name: string) {
  try {
    await import(name)
    return true
  } catch {
    return false
  }
}

export async function importsAvailable(...peerDependencies: string[]) {
  try {
    await Promise.all(peerDependencies.map(peer => import(peer)))
    return true
  } catch {
    return false
  }
}

/**
 * Determine whether an optional peer dependency is installed.
 * @param peer the module id of the peer dependency
 * @returns true if the peer dependency is installed in the project
 */
export function peerAvailable(peer: string) {
  try {
    require.resolve(peer)
    return true
  } catch {
    return false
  }
}

export function peersAvailable(...peerDependencies: string[]) {
  return peerDependencies.every(peerAvailable)
}
