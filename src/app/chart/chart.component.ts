import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() timeseriesData: [number, number][] = [];
  @Input() downsample: boolean = false;

  constructor() { }

  chartInitialized(chart: Highcharts.Chart): void {
    const data: [number, number][] = !this.downsample
      ? this.timeseriesData
      : this.returnDownsampledData();

    chart.series[0].setData(data);
  }

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
    },
    title: {
      text: '',
    },
    xAxis: {
      type: 'datetime', // Use datetime type for time series
      labels: {
        enabled: false, // Disable x-axis labels
      },
    },
    yAxis: {
      title: {
        text: null, // Remove y-axis title
      },
    },
    legend: {
      enabled: false, // Disable the legend
    },
    series: [
      {
        type: 'line',
        lineWidth: 1,
      },
    ],
    plotOptions: {
      series: {
        states: {
          hover: {
            lineWidthPlus: 0, // Prevent line from growing bold on hover
          },
        },
      },
    },
    credits: {
      enabled: false,
    },
  };

  /** Modify and extend the code where indicated. You're also allowed to add utility functions below.*/
  private returnDownsampledData(): [number, number][] {
    console.time('returnDownsampledData');
    const dataToDownsample: [number, number][] = [...this.timeseriesData];
    const plotWidth: number = 548;

    // <-- Modify start
    let downsampledData: [number, number][] = dataToDownsample;

    var limited = downsampledData.filter((val, i) => i < 1000)

    // --> Modify end

    console.timeEnd('returnDownsampledData');
    console.log(
      `Input ${this.timeseriesData.length}, Output ${limited.length}`
    );
    return downsampledData;
  }
}
