import React, {PureComponent} from 'react'
import {
  ClockIcon,
  PythonIcon,
} from 'src/homepageExperience/components/HomepageIcons'
import Step from 'src/homepageExperience/components/steps/Step'

import {HOMEPAGE_NAVIGATION_STEPS} from 'src/homepageExperience/utils'

interface OwnProps {
  currentStep: number
}

export class Navigation extends PureComponent<OwnProps> {
  render() {
    return (
      <div className="subway-navigation-container">
        <div className="subway-navigation-flex-wrapper">
          <div className="subway-navigation-title">
            <span className="subway-navigation-title-icon">{PythonIcon}</span>
            <div className="subway-navigation-title-text">
              <h3>Setting Up</h3>
              <h6>Python</h6>
            </div>
          </div>
          <div className="subway-navigation-time-to-complete">
            {ClockIcon}
            <h5> 5 minutes</h5>
          </div>
          {HOMEPAGE_NAVIGATION_STEPS.map((value, index) => (
            <Step
              stepIsActive={index === this.props.currentStep - 1}
              stepIsComplete={index < this.props.currentStep - 1}
              icon={value.icon}
              text={value.name}
              key={index}
            />
          ))}
        </div>
      </div>
    )
  }
}