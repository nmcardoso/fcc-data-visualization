document.addEventListener('DOMContentLoaded', e => {
  const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
  
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  };
  const svgWidth = 900;
  const svgHeight = 400;
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleLinear().range([0, height]);
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const svg = d3.select('#graph-holder')
                .append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight);
  const g = svg.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip');

  const pad = (n, width, z) => {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  };

  d3.json(dataUrl).then(data => {
    x.domain(d3.extent(data, d => d.Year));
    y.domain(d3.extent(data, d => d.Seconds));

    g.append('g')
      .attr('id', 'x-axis')
      .attr('transform',  `translate(0,${height})`)
      .call(d3.axisBottom().scale(x).tickFormat(d3.format('d')));

    g.append('g')
      .attr('id', 'y-axis')
      .call(d3.axisLeft().scale(y).tickFormat(d => {
        const min = Math.floor(d / 60);
        const sec = d % 60;
        return `${pad(min, 2)}:${pad(sec, 2)}`;
      }));

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 6)
      .attr('cx', d => x(d.Year))
      .attr('cy', d => y(d.Seconds))
      .style('fill', d => color(d.Doping != ''))
      .attr('data-xvalue', d => d.Year)
      .attr('data-yvalue', d => new Date(1970, 0, 1, 0, 0, d.Seconds).toISOString())
      .on('mouseover', d => {
        tooltip.transition()
                .duration(200)
                .style('opacity', .9);
        tooltip.attr('data-year', d.Year);
        tooltip.html(d.Name + ': ' + d.Nationality + '<br>' +
                      'Year: ' + d.Year + ', Time: ' + d.Time +
                      '<br>' + d.Doping)
                .style('left', `${d3.event.pageX}px`)
                .style('top', `${d3.event.pageY - 28}px`);
      })
      .on('mouseout', d => {
        tooltip.transition()
                .duration(300)
                .style('opacity', 0);
      })

    const legend = g.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('id', 'legend')
      .attr('transform', (d, i) => `translate(0,${height/2 - i*20})`);

    legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(d => d ? 'Riders with doping allegations' : 'No doping allegations');
  });
});