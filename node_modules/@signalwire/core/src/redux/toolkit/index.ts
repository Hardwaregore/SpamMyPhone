/**
 * Cherry-picked (and adapted) version of Redux Toolkit. API
 * wise it remains fully compatible but we changed a couple
 * of things to reduce the overall bundle size. Most
 * important is that our version doesn't depend on Immer and
 * we don't include any of the default middleares included
 * by RTK like thunks or inmutable state (we do this through
 * TS).
 */
export * from 'redux'
export * from './createAction'
export * from './configureStore'
