import classnames from 'classnames'
import React from 'react'

import {InfluxColors} from '@influxdata/clockface'

import {StepCompleteIcon} from 'src/homepageExperience/components/HomepageIcons'

type StepProps = {
  stepIsActive: boolean
  stepIsComplete: boolean
  icon: JSX.Element
  text: string
}

const Step = (props: StepProps) => {
  const {text, icon, stepIsActive, stepIsComplete} = props
  const iconAndTextColor =
    stepIsActive || stepIsComplete ? InfluxColors.Pool : InfluxColors.Grey95

  return (
    <span
      className={classnames('subway-navigation-step-flex-wrapper', {
        stepIsComplete: stepIsComplete,
      })}
    >
      <div
        className={classnames('subway-navigation-step', {
          showBorderColor: stepIsActive || stepIsComplete,
        })}
      >
        <span
          className="subway-navigation-step-icon-container"
          style={{
            fill: iconAndTextColor,
            background: stepIsComplete ? InfluxColors.Pool : '',
          }}
        >
          {stepIsComplete ? StepCompleteIcon : icon}
        </span>
        <span
          style={{
            color: iconAndTextColor,
          }}
        >
          {text.split('\n').map(function(item, key) {
            return (
              <span key={key}>
                {item}
                <br />
              </span>
            )
          })}
        </span>
      </div>
    </span>
  )
}

export default Step