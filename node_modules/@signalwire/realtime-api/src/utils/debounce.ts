type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
  ? A
  : never

type MethodTypes = {
  cancel: () => void
  flush: () => void
}

export function debounce<T extends Function>(
  fn: T,
  wait?: number,
  callFirst?: false
): ((...args: ArgumentTypes<T>) => void) & MethodTypes

export function debounce<T extends Function>(
  fn: T,
  wait: number = 0,
  callFirst?: false
) {
  let timeout: NodeJS.Timeout | null = null
  let debouncedFn: T | null = null

  const clear = function () {
    if (timeout) {
      clearTimeout(timeout)

      debouncedFn = null
      timeout = null
    }
  }

  const flush = function () {
    const call = debouncedFn
    clear()

    if (call) {
      call()
    }
  }

  const debounceWrapper = function () {
    if (!wait) {
      // @ts-expect-error
      return fn.apply(this, arguments)
    }

    // @ts-expect-error
    const context = this
    const args = arguments
    const callNow = callFirst && !timeout
    clear()

    // @ts-expect-error
    debouncedFn = function () {
      fn.apply(context, args)
    }

    timeout = setTimeout(function () {
      timeout = null

      if (!callNow) {
        const call = debouncedFn
        debouncedFn = null

        return call?.()
      }
    }, wait)

    if (callNow && debouncedFn) {
      return debouncedFn()
    }
  }

  debounceWrapper.cancel = clear
  debounceWrapper.flush = flush

  return debounceWrapper
}
