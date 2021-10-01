import {trim} from 'lodash'

const typeStrings = ['timestamp', 'tag', 'field']
const dataTypeStrings = ['integer', 'float', 'boolean', 'string', 'unsigned']

/**
 * manually checking that the literal string union types are correct
 *
 * our types are generated, and changing it so there is an exported array that is *then* used
 * for literal union type creation is out of scope.
 * https://newbedev.com/checking-validity-of-string-literal-union-type-at-runtime
 *
 * right now, just checking true/false; is it valid?  later on, may add a message saying which part(s) are invalid
 * */
export const areColumnsKosher = columns => {
  if (Array.isArray(columns)) {
    const validArray = columns.map(item => {
      // for each item, does it have the necessary stuff?
      const hasName = 'name' in item && typeof item.name === 'string'
      const hasType = 'type' in item && typeStrings.includes(item.type)

      // the semi-optional part: if it isn't there; it is fine; but if it is check it!
      // BUT, if the type is 'field' it is required!
      let dataTypePartIsValid = true

      if ('dataType' in item) {
        dataTypePartIsValid = dataTypeStrings.includes(item.dataType)
      } else {
        // not there:
        if (item.type === 'field') {
          dataTypePartIsValid = false
        }
      }
      return hasName && hasType && dataTypePartIsValid
    })

    return validArray.reduce((prevVal, curVal) => prevVal && curVal, true)
  }
  return false
}

export const START_ERROR = "cannot start with '_' or a number"
export const TOO_LONG_ERROR = 'too long, max length is 128 characters'

/**
 *  is the name valid?
 *
 *  this does NOT check if the name has content/ if it is empty.
 *
 *  this is about validating the name *after* the user has entered data
 *
 * */
export const isNameValid = name => {
  name = trim(name)

  // ok; it has contents:
  const illegalStartRegex = /^[0-9]/

  if (name.startsWith('_') || illegalStartRegex.test(name)) {
    return {valid: false, message: START_ERROR}
  }
  if (name.length > 128) {
    return {valid: false, message: TOO_LONG_ERROR}
  }
  return {valid: true}
}