document.addEventListener('DOMContentLoaded', e => {
  const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

  const svgWidth = 1500,
        svgHeight = 550;
  
  const margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 70
  };

  const width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom;

  const svg = d3.select('#graph-holder')
                .append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight);
            
  const g = svg.append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip');

  const months = ['January', 'February', 'March', 'April',
                  'May', 'June', 'July', 'August', 'September',
                  'October', 'November', 'December'];

  d3.json(dataUrl).then(res => {
    const baseTemp = res.baseTemperature,
          data = res.monthlyVariance;

    // y scale and axis
    const y = d3.scaleBand()
              .domain(months.map((v, i) => i))
              .range([0, height]);
    const yAxis = d3.axisLeft(y)
                    .tickFormat(d => months[d])
                    .tickSizeOuter(0);

    g.append('g')
      .attr('id', 'y-axis')
      .call(yAxis);

    // x scale and axis
    const x = d3.scaleBand()
                .domain(d3.set(data, d => d.year).values())
                .range([1, width]);
    const xAxis = d3.axisBottom(x)
                    .tickValues(x.domain().filter(d => d % 10 === 0))
                    .tickSizeOuter(0);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('id', 'x-axis')
      .call(xAxis);

    // color scale
    const colorScheme = d3.schemeRdYlBu[11].reverse();
    const minTemp = baseTemp + d3.min(data, d => d.variance);
    const maxTemp = baseTemp + d3.max(data, d => d.variance);
    const tick = (maxTemp - minTemp) / colorScheme.length;
    const tempDomain = [];

    for (let i = 1; i < colorScheme.length; i++) {
      tempDomain.push(minTemp + i * tick);
    }

    const colorScale = d3.scaleThreshold()
        .domain(tempDomain)
        .range(colorScheme);

    // color legend
    const legendWidth = 400,
          legendHeight = 30;
    
    const legendX = d3.scaleLinear()
                      .domain([minTemp, maxTemp])
                      .range([0, legendWidth]);
    const legendXAxis = d3.axisBottom(legendX)
                          .tickValues(colorScale.domain())
                          .tickFormat(d3.format('.1f'))
                          .tickSizeOuter(0);
    const legend = svg.append('g')
                    .attr('transform', `translate(${2*margin.left},${height + margin.top + 40})`);

    legend.append('g')
          .attr('id', 'legend')
          .selectAll('rect')
          .data(colorScale.range().map(color => {
            const d = colorScale.invertExtent(color);
            if (!d[0]) d[0] = legendX.domain()[0];
            if (!d[1]) d[1] = legendX.domain()[1];
            return d;
          }))
          .enter()
          .append('rect')
          .attr('fill', d => colorScale(d[0]))
          .attr('x', d => legendX(d[0]))
          .attr('y', 0)
          .attr('width', d => legendX(d[1]) - legendX(d[0]))
          .attr('height', legendHeight);

      legend.append('g')
            .attr('transform', `translate(0,${legendHeight})`)
            .call(legendXAxis);

    // cells
    g.append('g')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => baseTemp + d.variance)
      .attr('x', d => x(d.year))
      .attr('y', d => y(d.month - 1))
      .attr('width', d => x.bandwidth(d.year))
      .attr('height', d => y.bandwidth(d.month - 1))
      .attr('fill', d => colorScale(baseTemp + d.variance))
      .on('mouseover', d => {
        tooltip.transition()
                .duration(200)
                .style('opacity', .75);
        tooltip.html(d.year + ' - ' + months[d.month - 1] + '<br>'
                    + d3.format('.1f')(baseTemp + d.variance) + ' &deg;C<br>'
                    + d3.format('+.1f')(d.variance) + ' &deg;C')
                .style('left', `${d3.event.pageX}px`)
                .style('top', `${d3.event.pageY}px`);
        tooltip.attr('data-year', d.year);
      })
      .on('mouseout', d => {
        tooltip.transition()
                .duration(200)
                .style('opacity', 0);
      });
  }).catch(e => console.log('Error loading data'));
});