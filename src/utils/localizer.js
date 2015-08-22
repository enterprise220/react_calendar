import { PropTypes } from 'react';
import invariant from 'invariant';

const localePropType = PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
      ]);

function _format(localizer, formatter, value, format, culture) {
  let result = typeof format === 'function'
    ? format(value, culture, localizer)
    : formatter.call(localizer, value, format, culture)

  invariant(result == null || typeof result === 'string'
    , '`localizer format(..)` must return a string, null, or undefined')

  return result
}

class DateLocalizer {

  constructor(spec) {
    invariant(typeof spec.format === 'function'
      , 'date localizer `format(..)` must be a function')
    invariant(typeof spec.parse === 'function'
      , 'date localizer `parse(..)` must be a function')
    invariant(typeof spec.firstOfWeek === 'function'
      , 'date localizer `firstOfWeek(..)` must be a function')

    this.propType = spec.propType || localePropType

    this.formats = spec.formats
    this.startOfWeek = spec.firstOfWeek

    this.format = (value, format, culture) => _format(this, spec.format, value, format, culture)

    this.parse = (value, format, culture) => {
      let result = spec.parse.call(this, value, format, culture)

      invariant(result == null
        || (result instanceof Date && !isNaN(result.getTime()))
        , 'date localizer `parse(..)` must return a valid Date, null, or undefined')

      return result
    }
  }
}

let localizer = {
  parse: error,
  format:error,
  startOfWeek: error
}


export function set(newLocalizer){
  localizer = new DateLocalizer(newLocalizer)
}

let exp = {
  parse(...args){
    return localizer.parse(...args)
  },

  format(...args){
    return localizer.format(...args)
  },

  startOfWeek(...args){
    return localizer.startOfWeek(...args)
  }
}

Object.defineProperty(exp, 'formats', {
  get(){
    return localizer.formats
  }
})

export default exp

function error(){
  throw new Error(
    'You are attempting to use big Calendar without a localizer. ' +
    'Please install a localizer')
}
