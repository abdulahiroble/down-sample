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
      type: 'datetime',
      labels: {
        enabled: false,
      },
    },
    yAxis: {
      title: {
        text: null,
      },
    },
    legend: {
      enabled: false,
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
            lineWidthPlus: 0,
          },
        },
      },
    },
    credits: {
      enabled: false,
    },
  };

  private returnDownsampledData(): [number, number][] {
    console.time('returnDownsampledData');
    const dataToDownsample: [number, number][] = [...this.timeseriesData];

    if (dataToDownsample.length <= 1000) {
      return dataToDownsample;
    }

    const sampledData = this.largestTriangleThreeBuckets(dataToDownsample, 1000);

    console.timeEnd('returnDownsampledData');
    console.log(`Input ${this.timeseriesData.length}, Output ${sampledData.length}`);
    return sampledData;
  }

  private largestTriangleThreeBuckets(data: [number, number][], threshold: number): [number, number][] {
    const dataLength = data.length;
    if (threshold >= dataLength || threshold === 0) {
      return data;
    }

    const sampled = [data[0]];

    const calculateBucketSize = (dataLength - 2) / (threshold - 2);
    let a = 0;

    for (let i = 0; i < threshold - 2; i++) {
      const avgRangeStart = Math.floor((i + 1) * calculateBucketSize) + 1;
      const avgRangeEnd = Math.min(Math.floor((i + 2) * calculateBucketSize) + 1, dataLength);
      const avgRange = data.slice(avgRangeStart, avgRangeEnd);

      const [avgX, avgY] = avgRange.reduce(
        ([sumX, sumY], [x, y]) => [sumX + x, sumY + y],
        [0, 0]
      ).map(sum => sum / avgRange.length);

      const rangeOffs = Math.floor(i * calculateBucketSize) + 1;
      const rangeTo = Math.floor((i + 1) * calculateBucketSize) + 1;
      const pointA = data[a];
      const [pointAX, pointAY] = pointA;

      const result = data.slice(rangeOffs, rangeTo).reduce(
        (acc: { maxArea: number, maxAreaPoint: [number, number] | null, nextA: number }, point, index) => {
          const area = Math.abs((pointAX - avgX) * (point[1] - pointAY) - (pointAX - point[0]) * (avgY - pointAY)) * 0.5;
          if (area > acc.maxArea) {
            return { maxArea: area, maxAreaPoint: point, nextA: index + rangeOffs };
          }
          return acc;
        },
        { maxArea: -1, maxAreaPoint: null, nextA: a }
      );

      const { maxAreaPoint, nextA } = result;

      if (maxAreaPoint) {
        sampled.push(maxAreaPoint);
        a = nextA;
      }
    }

    sampled.push(data[dataLength - 1]);

    return sampled;
  }
}
