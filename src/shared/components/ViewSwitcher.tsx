// Libraries
import React, {FunctionComponent} from 'react'
import {Plot, FromFluxResult} from '@influxdata/giraffe'

// Components
import GaugeChart from 'src/shared/components/GaugeChart'
import SingleStat from 'src/shared/components/SingleStat'
import TableGraphs from 'src/shared/components/tables/TableGraphs'
import HistogramPlot from 'src/shared/components/HistogramPlot'
import HeatmapPlot from 'src/shared/components/HeatmapPlot'
import MosaicPlot from 'src/shared/components/MosaicPlot'
import FluxTablesTransform from 'src/shared/components/FluxTablesTransform'
import XYPlot from 'src/shared/components/XYPlot'
import ScatterPlot from 'src/shared/components/ScatterPlot'
import LatestValueTransform from 'src/shared/components/LatestValueTransform'
import CheckPlot from 'src/shared/components/CheckPlot'
import BandPlot from 'src/shared/components/BandPlot'
import GeoPlot from 'src/shared/components/GeoPlot'

// Types
import {
  Annotation,
  CheckType,
  CheckViewProperties,
  QueryViewProperties,
  SingleStatViewProperties,
  StatusRow,
  Theme,
  Threshold,
  TimeRange,
  TimeZone,
  XYViewProperties,
} from 'src/types'

interface Props {
  annotations: Annotation[]
  checkThresholds?: Threshold[]
  checkType?: CheckType
  files?: string[]
  giraffeResult: FromFluxResult
  properties: QueryViewProperties | CheckViewProperties
  statuses?: StatusRow[][]
  theme: Theme
  timeRange?: TimeRange | null
  timeZone: TimeZone
}

const ViewSwitcher: FunctionComponent<Props> = ({
  annotations,
  checkThresholds = [],
  checkType = null,
  files,
  giraffeResult: {table, fluxGroupKeyUnion},
  properties,
  statuses,
  theme,
  timeRange,
  timeZone,
}) => {
  switch (properties.type) {
    case 'single-stat':
      return (
        <LatestValueTransform table={table} allowString={true}>
          {latestValue => (
            <SingleStat
              stat={latestValue}
              properties={properties}
              theme={theme}
            />
          )}
        </LatestValueTransform>
      )

    case 'table':
      return (
        <FluxTablesTransform files={files}>
          {tables => (
            <TableGraphs
              tables={tables}
              properties={properties}
              timeZone={timeZone}
              theme={theme}
            />
          )}
        </FluxTablesTransform>
      )

    case 'gauge':
      return (
        <LatestValueTransform table={table} allowString={false}>
          {latestValue => (
            <GaugeChart
              value={latestValue}
              properties={properties}
              theme={theme}
            />
          )}
        </LatestValueTransform>
      )
    case 'xy':
      return (
        <XYPlot
          annotations={annotations}
          timeRange={timeRange}
          fluxGroupKeyUnion={fluxGroupKeyUnion}
          table={table}
          timeZone={timeZone}
          viewProperties={properties}
          theme={theme}
        >
          {config => <Plot config={config} />}
        </XYPlot>
      )
    case 'band':
      return (
        <BandPlot
          timeRange={timeRange}
          fluxGroupKeyUnion={fluxGroupKeyUnion}
          table={table}
          timeZone={timeZone}
          viewProperties={properties}
          theme={theme}
        >
          {config => <Plot config={config} />}
        </BandPlot>
      )

    case 'line-plus-single-stat':
      const xyProperties = {
        ...properties,
        colors: properties.colors.filter(c => c.type === 'scale'),
        type: 'xy' as 'xy',
        geom: 'line' as 'line',
      } as XYViewProperties

      const singleStatProperties = {
        ...properties,
        tickPrefix: '',
        tickSuffix: '',
        colors: properties.colors.filter(c => c.type !== 'scale'),
        type: 'single-stat',
      } as SingleStatViewProperties

      return (
        <XYPlot
          timeRange={timeRange}
          fluxGroupKeyUnion={fluxGroupKeyUnion}
          table={table}
          timeZone={timeZone}
          viewProperties={xyProperties}
          theme={theme}
        >
          {config => (
            <Plot config={config}>
              <LatestValueTransform
                table={config.table}
                quiet={true}
                allowString={false}
              >
                {latestValue => (
                  <SingleStat
                    stat={latestValue}
                    properties={singleStatProperties}
                    theme={theme}
                  />
                )}
              </LatestValueTransform>
            </Plot>
          )}
        </XYPlot>
      )

    case 'histogram':
      return (
        <HistogramPlot
          table={table}
          timeZone={timeZone}
          viewProperties={properties}
          theme={theme}
        >
          {config => <Plot config={config} />}
        </HistogramPlot>
      )

    case 'heatmap':
      return (
        <HeatmapPlot
          timeRange={timeRange}
          table={table}
          timeZone={timeZone}
          viewProperties={properties}
          theme={theme}
        >
          {config => <Plot config={config} />}
        </HeatmapPlot>
      )

    case 'mosaic':
      return (
        <MosaicPlot
          timeRange={timeRange}
          table={table}
          timeZone={timeZone}
          viewProperties={properties}
          theme={theme}
        >
          {config => <Plot config={config} />}
        </MosaicPlot>
      )

    case 'scatter':
      return (
        <ScatterPlot
          timeRange={timeRange}
          table={table}
          viewProperties={properties}
          timeZone={timeZone}
          theme={theme}
        >
          {config => <Plot config={config} />}
        </ScatterPlot>
      )

    case 'geo':
      return (
        <GeoPlot table={table} viewProperties={properties}>
          {config => <Plot config={config} />}
        </GeoPlot>
      )

    case 'check':
      return (
        <CheckPlot
          checkType={checkType}
          thresholds={checkThresholds}
          table={table}
          fluxGroupKeyUnion={fluxGroupKeyUnion}
          timeZone={timeZone}
          viewProperties={properties}
          statuses={statuses}
        >
          {config => <Plot config={config} />}
        </CheckPlot>
      )

    default:
      throw new Error('Unknown view type in <ViewSwitcher /> ')
  }
}

export default ViewSwitcher
