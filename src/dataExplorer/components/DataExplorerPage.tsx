// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {Switch, Route, Link, useHistory} from 'react-router-dom'

// Components
import DataExplorer from 'src/dataExplorer/components/DataExplorer'
import FluxQueryBuilder from 'src/dataExplorer/components/FluxQueryBuilder'
import {
  Page,
  Icon,
  IconFont,
  FlexBox,
  ComponentSize,
  InputLabel,
  SlideToggle,
} from '@influxdata/clockface'
import SaveAsButton from 'src/dataExplorer/components/SaveAsButton'
import VisOptionsButton from 'src/timeMachine/components/VisOptionsButton'
import GetResources from 'src/resources/components/GetResources'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import SaveAsOverlay from 'src/dataExplorer/components/SaveAsOverlay'
import ViewTypeDropdown from 'src/timeMachine/components/ViewTypeDropdown'
import {AddAnnotationDEOverlay} from 'src/overlays/components/index'
import {EditAnnotationDEOverlay} from 'src/overlays/components/index'
import TemplatePage from 'src/dataExplorer/components/resources/TemplatePage'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {event, useLoadTimeReporting} from 'src/cloud/utils/reporting'
import {FeatureFlag, isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {ResourceType} from 'src/types'

import 'src/shared/components/cta.scss'
import {AppSettingContext} from 'src/shared/contexts/app'
import {
  PersistanceContext,
  PersistanceProvider,
} from 'src/dataExplorer/context/persistance'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import {SCRIPT_EDITOR_PARAMS} from 'src/dataExplorer/components/resources'

const DataExplorerPageHeader: FC = () => {
  const {fluxQueryBuilder, setFluxQueryBuilder} = useContext(AppSettingContext)
  const {resource, save} = useContext(PersistanceContext)
  const history = useHistory()

  const toggleSlider = () => {
    event('toggled new query builder', {active: `${!fluxQueryBuilder}`})
    if (!fluxQueryBuilder) {
      history.push({
        search: SCRIPT_EDITOR_PARAMS,
      })
    } else {
      history.push({search: null})
    }
    setFluxQueryBuilder(!fluxQueryBuilder)
  }

  const handleRename = (name: string) => {
    resource.data.name = name
    save(resource?.language)
  }

  const showNewExplorer = fluxQueryBuilder && isFlagEnabled('newDataExplorer')

  let pageTitle = <Page.Title title="Data Explorer" />

  if (showNewExplorer && resource?.data?.hasOwnProperty('name')) {
    pageTitle = (
      <RenamablePageTitle
        onRename={handleRename}
        name={resource?.data?.name || ''}
        placeholder="Untitled Script"
        maxLength={100}
      />
    )
  }

  return (
    <Page.Header
      fullWidth={true}
      className={`${
        showNewExplorer ? 'flux-query-builder' : 'data-explorer'
      }--header`}
      testID="data-explorer--header"
    >
      {pageTitle}
      <FlexBox margin={ComponentSize.Large}>
        {isFlagEnabled('newDataExplorer') && (
          <FlexBox margin={ComponentSize.Medium}>
            <InputLabel>&#10024; Try New Script Editor</InputLabel>
            <SlideToggle
              active={fluxQueryBuilder}
              onChange={toggleSlider}
              testID="flux-query-builder-toggle"
            />
          </FlexBox>
        )}
      </FlexBox>
    </Page.Header>
  )
}

const DataExplorerPage: FC = () => {
  const {flowsCTA, fluxQueryBuilder, setFlowsCTA} =
    useContext(AppSettingContext)
  useLoadTimeReporting('DataExplorerPage load start')
  const showNewExplorer = fluxQueryBuilder && isFlagEnabled('newDataExplorer')
  const history = useHistory()

  const hideFlowsCTA = () => {
    setFlowsCTA({explorer: false})
  }

  const recordClick = () => {
    event('Data Explorer Page - Clicked Notebooks CTA')
  }

  useEffect(() => {
    if (fluxQueryBuilder) {
      history.push({
        search: SCRIPT_EDITOR_PARAMS,
      })
    } else {
      history.push({
        search: null,
      })
    }
    return () => {
      event('Exited Data Explorer')
    }
  }, [fluxQueryBuilder, history])

  return (
    <Page titleTag={pageTitleSuffixer(['Data Explorer'])}>
      <Switch>
        <Route
          path="/orgs/:orgID/data-explorer/from"
          component={TemplatePage}
        />
        <Route
          path="/orgs/:orgID/data-explorer/save"
          component={SaveAsOverlay}
        />
        <Route
          path="/orgs/:orgID/data-explorer/add-annotation"
          component={AddAnnotationDEOverlay}
        />
        <Route
          path="/orgs/:orgID/data-explorer/edit-annotation"
          component={EditAnnotationDEOverlay}
        />
      </Switch>
      <GetResources resources={[ResourceType.Variables]}>
        <PersistanceProvider>
          <DataExplorerPageHeader />
        </PersistanceProvider>
        {flowsCTA.explorer && (
          <FeatureFlag name="flowsCTA">
            <div className="header-cta--de">
              <div className="header-cta">
                <Icon glyph={IconFont.Pencil} />
                Now you can use {PROJECT_NAME_PLURAL} to explore and take action
                on your data
                <Link
                  to={`/${PROJECT_NAME.toLowerCase()}/from/default`}
                  onClick={recordClick}
                >
                  Create a {PROJECT_NAME}
                </Link>
                <span className="header-cta--close-icon" onClick={hideFlowsCTA}>
                  <Icon glyph={IconFont.Remove_New} />
                </span>
              </div>
            </div>
          </FeatureFlag>
        )}
        {!showNewExplorer && (
          <Page.ControlBar fullWidth={true}>
            <Page.ControlBarLeft>
              <ViewTypeDropdown />
              <VisOptionsButton />
            </Page.ControlBarLeft>
            <Page.ControlBarRight>
              <TimeZoneDropdown />
              <SaveAsButton />
            </Page.ControlBarRight>
          </Page.ControlBar>
        )}
        <Page.Contents fullWidth={true} scrollable={false}>
          {!showNewExplorer && <DataExplorer />}
          {showNewExplorer && <FluxQueryBuilder />}
        </Page.Contents>
      </GetResources>
    </Page>
  )
}

export default DataExplorerPage
