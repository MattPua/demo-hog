type StoreContext = Record<string, unknown>

function formatScope(scope: string) {
  return `[Quill:${scope}]`
}

export function logStoreContext(
  scope: string,
  message: string,
  context?: StoreContext,
) {
  if (context) {
    console.info(formatScope(scope), message, context)
    return
  }

  console.info(formatScope(scope), message)
}

export function warnStoreContext(
  scope: string,
  message: string,
  context?: StoreContext,
) {
  if (context) {
    console.warn(formatScope(scope), message, context)
    return
  }

  console.warn(formatScope(scope), message)
}

export function errorStoreContext(
  scope: string,
  message: string,
  context?: StoreContext,
) {
  if (context) {
    console.error(formatScope(scope), message, context)
    return
  }

  console.error(formatScope(scope), message)
}
