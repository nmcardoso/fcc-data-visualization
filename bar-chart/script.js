document.addEventListener('DOMContentLoaded', e => {
  const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
  const gMargin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  };
  const gWidth = 900 - gMargin.left - gMargin.right;
  const gHeight = 400 - gMargin.top - gMargin.bottom;

  const x = d3.scaleLinear().range([0, gWidth]);
  const y = d3.scaleLinear().range([gHeight, 0]);

  const svg = d3.select('svg');
  const g = svg.append('g')
      .attr('transform', `translate(${gMargin.left},${gMargin.top})`);

  const tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip');

  d3.json(dataUrl).then((rawData) => {
    const data = rawData.data;
    const years = data.map(d => +d[0].substring(0, 4));
    const barWidth = gWidth / years.length;

    x.domain([d3.min(years), d3.max(years)]);
    y.domain([0, d3.max(data, d => d[1])]);

    g.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0,${gHeight})`)
        .call(d3.axisBottom().scale(x).tickFormat(d3.format('d')));

    g.append('g')
        .attr('id', 'y-axis')
        .call(d3.axisLeft(y));

    g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('data-date', d => d[0])
        .attr('data-gdp', d => d[1])
        .attr('x', (d, i) => i * barWidth)
        .attr('y', d => y(d[1]))
        .attr('width', barWidth)
        .attr('height', d => gHeight - y(d[1]))
        .style('fill', '#444')
        .on('mouseover', (d, i) => {
          tooltip.transition()
            .duration(100)		
            .style('opacity', .9);
          tooltip.text(`${d[0]}: $${d[1]}`)
            .style('left', (i * barWidth) + 60 + 'px')
            .style('top', gHeight * (3/4) + 'px');
          tooltip.attr('data-date', d[0]);
        })
        .on('mouseout', () => {		
          tooltip.transition()		
          .duration(400)		
          .style('opacity', 0);
        });
  });
});

