import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import { actionTypes, sorting } from '../constants'

const initialState = {
  text: "",
  words: {},
  sortingMethod: sorting.NONE,
  word: "",
  definition: null,
  found: false,
  error: null,
  fetchingDefinition: false
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_WORDS:
      return updateWords(state, action)
    case actionTypes.SORT_WORDS:
      return sortWords(state, action)
    case actionTypes.SET_SORTING:
      return setSorting(state, action)
    case actionTypes.FETCH_DEFINITION_PENDING:
      return {...state, fetchingDefinition: true, word: action.word, error: null, found: false}
    case actionTypes.FETCH_DEFINITION_SUCCESS:
      return {...state, fetchingDefinition: false, definition: action.definition, found: action.found, error: null}
    case actionTypes.FETCH_DEFINITION_ERROR:
      return {...state, fetchingDefinition: false, error: action.error, found: false}
    default:
      return state
  }
}

const setSorting = (state, action) => {
  return {
    ...state,
    sortingMethod: action.sortingMethod
  }
}

const updateWords = (state, action) => {
  const text = action.text
  const wordList = text.match(/\w+/g)
  const words = {}

  if(text.length === 0)
    return {...state, text: '', words: {}}

  if(wordList) {
    wordList.forEach(word => {
      if(words[word])
        words[word] += 1
      else
        words[word] = 1
    })

    const newState = {...state, text, words}

    return sortWords(newState, {indicator: state.sortingMethod})
  }

  return state
}

const sortWords = (state, action) => {
  const indicator = action.indicator
  const { words, text } = state

  switch(indicator) {
    case sorting.ALPHABETICAL:
      return {
        ...state,
        words: sortAlphabetically(words, {reverse: false})
      }
    case sorting.REVERSE_ALPHABETICAL:
      return {
        ...state,
        words: sortAlphabetically(words, {reverse: true})
      }
    case sorting.TIME_ADDED:
      return {
        ...state,
        words: sortByTimeAdded(words, state.text, {reverse: false})
      }
    case sorting.REVERSE_TIME_ADDED:
      return {
        ...state,
        words: sortByTimeAdded(words, state.text, {reverse: true})
      }
    default:
      return state
  }
}

const sortByTimeAdded = (words, text, opts) => {
  const reverse = opts.reverse || false
  const splitWords = text.split(' ')
  const wordList = reverse ? splitWords.reverse() : splitWords
  const sortedWords = {}

  wordList.forEach(word => {
    sortedWords[word] = words[word]
  })

  return sortedWords
}

const sortAlphabetically = (words, opts) => {
  const reverse = opts.reverse || false
  const incOrDec = reverse ? 1 : -1
  const wordList = Object.keys(words)
  const sortedWords = {}

  wordList.sort((a, b) => {
    if(a < b)
      return incOrDec
    else if(a > b)
      return -incOrDec
    else
      return 0
  })

  wordList.forEach(word => {
    sortedWords[word] = words[word]
  })

  return sortedWords
}

export const initializeStore = (preloadedState = initialState) => {
  return createStore(
    reducer,
    preloadedState,
    composeWithDevTools(applyMiddleware(thunk))
  )
}