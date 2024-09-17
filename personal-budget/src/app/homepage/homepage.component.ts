import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DataService } from '../data.service';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import * as d3 from 'd3';

interface PieChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss', '../menu/menu.component.scss', '../breadcrumbs/breadcrumbs.component.scss']
})
export class HomepageComponent implements OnInit {

  width = 960;
  height = 450;
  radius = Math.min(this.width, this.height) / 2;

  public dataSource = {
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [
          'red',
          'orange',
          'yellow',
          'green',
          'blue',
          'purple',
          'black',
        ]
      }
    ],
    labels: [] as string[]
  };

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    Chart.register(PieController, ArcElement, Tooltip, Legend);


    this.dataService.fetchData();


    this.dataService.getData().subscribe((data: any) => {
      if (data) {
        this.dataSource.datasets[0].data = data.myBudget.map((item: any) => item.budget);
        this.dataSource.labels = data.myBudget.map((item: any) => item.title);
        this.createChart();
        this.getD3Data();
      }
    });
  }

  createChart() {
    const chartElement = document.getElementById('myChart') as HTMLCanvasElement | null;

    if (chartElement) {
      const ctx = chartElement.getContext('2d');

      if (ctx) {
        new Chart(ctx, {
          type: 'pie',
          data: this.dataSource
        });
      } else {
        console.error('Unable to get 2D context for chart');
      }
    } else {
      console.error('Chart element with ID "myChart" not found');
    }
  }

  getD3Data(): void {
    this.dataService.getData().subscribe((data: any) => {
      const pieData: PieChartData[] = data.myBudget.map((item: any) => ({
        label: item.title,
        value: item.budget
      }));
      this.createD3Chart(pieData);
    });
  }

  createD3Chart(data: PieChartData[]): void {
    d3.select("#myChart2").select("svg").remove();

    const svg = d3.select("#myChart2")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

    const pie = d3.pie<PieChartData>()
      .sort(null)
      .value(d => d.value);

    const arc = d3.arc<d3.PieArcDatum<PieChartData>>()
      .outerRadius(this.radius * 0.8)
      .innerRadius(this.radius * 0.4);

    const outerArc = d3.arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const slices = svg.selectAll(".slice")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "slice");

    slices.append("path")
      .attr("d", arc)
      .style("fill", d => color(d.data.label));

    slices.append("text")
      .attr("transform", d => {
        const pos = outerArc.centroid(d);
        pos[0] = this.radius * 0.95 * (d.endAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr("dy", ".35em")
      .text(d => d.data.label)
      .style("text-anchor", d => (d.endAngle < Math.PI ? "start" : "end"));

    const polyline = svg.selectAll(".lines")
      .data(pie(data))
      .enter().append("polyline");

    polyline.transition().duration(1000)
      .attr("points", d => {
        const pos = outerArc.centroid(d);
        pos[0] = this.radius * 0.95 * (d.endAngle < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos].join(" ");
      });
  }
}
