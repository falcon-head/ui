// Utils
import {parseDuration, timeRangeToDuration} from 'src/shared/utils/duration'
import {asAssignmentNode} from 'src/variables/utils/convertVariables'

// Constants
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'

// Types
import {RemoteDataState, TimeRange, Variable} from 'src/types'
import {VariableAssignment} from 'src/types/ast'

export const getTimeRangeVarAssignments = (
  timeRange: TimeRange
): VariableAssignment[] => {
  return getTimeRangeVars(timeRange).map(v => asAssignmentNode(v)).filter(v => !!v)
}

export const getTimeRangeVars = (
  timeRange: TimeRange
): Variable[] => {
  return [
    getRangeVariable(TIME_RANGE_START, timeRange),
    getRangeVariable(TIME_RANGE_STOP, timeRange),
  ]
}

export const getRangeVariable = (
  which: string,
  timeRange: TimeRange
): Variable => {
  const range = which === TIME_RANGE_START ? timeRange.lower : timeRange.upper

  if (which === TIME_RANGE_STOP && !timeRange.upper) {
    return {
      orgID: '',
      id: TIME_RANGE_STOP,
      name: TIME_RANGE_STOP,
      arguments: {
        type: 'system',
        values: ['now()'],
      },
      status: RemoteDataState.Done,
      labels: [],
    }
  }

  if (which === TIME_RANGE_START && timeRange.type !== 'custom') {
    const duration = parseDuration(timeRangeToDuration(timeRange))

    return {
      orgID: '',
      id: which,
      name: which,
      arguments: {
        type: 'system',
        values: [duration],
      },
      status: RemoteDataState.Done,
      labels: [],
    }
  }

  if (isNaN(Date.parse(range))) {
    return {
      orgID: '',
      id: which,
      name: which,
      arguments: {
        type: 'system',
        values: [null],
      },
      status: RemoteDataState.Done,
      labels: [],
    }
  }

  return {
    orgID: '',
    id: which,
    name: which,
    arguments: {
      type: 'system',
      values: [range],
    },
    status: RemoteDataState.Done,
    labels: [],
  }
}
