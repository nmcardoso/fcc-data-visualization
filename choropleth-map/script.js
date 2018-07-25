document.addEventListener('DOMContentLoaded', e => {
  const dataUrls = [
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json',
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'
  ];

  const svgWidth = 1000,
        svgHeight = 620;

  const svg = d3.select('#graph-holder')
                .append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight);

  const tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip');

  const education = d3.map();
  const path = d3.geoPath();

  Promise.all(dataUrls.map(url => d3.json(url)))
          .then(ready)
          .catch(err => console.log(err));

  function ready(responses) {
    const eduData = responses[0];
    const countyData = responses[1];
    eduData.forEach(e => {
      education.set(e.fips, e.bachelorsOrHigher);
    });

    // Color scale
    const colorScheme = d3.schemePurples[9];
    const minEdu = d3.min(eduData, d => d.bachelorsOrHigher);
    const maxEdu = d3.max(eduData, d => d.bachelorsOrHigher);
    const domain = d3.range(minEdu, maxEdu, (maxEdu - minEdu) / (colorScheme.length - 1));

    const color = d3.scaleThreshold()
                    .domain(domain)
                    .range(colorScheme);

    // Color legend
    const x = d3.scaleLinear()
                .domain([minEdu, maxEdu])
                .range([0, 300]);

    const xAxis = d3.axisBottom(x)
                    .tickSize(16)
                    .tickFormat(d => `${d3.format('d')(d)}%`)
                    .tickValues(color.domain());

    const legend = svg.append('g')
        .attr('class', 'key')
        .attr('fill', 'none')
        .attr('id', 'legend')
        .attr('transform', `translate(550,30)`)

    legend.selectAll('rect')
      .data(color.range().map(d => {
        d = color.invertExtent(d);
        if (!d[0]) d[0] = x.domain()[0];
        if (!d[1]) d[1] = x.domain()[1];
        return d;
      }))
      .enter()
      .append('rect')
      .attr('height', 10)
      .attr('x', d => x(d[0]))
      .attr('width', d => x(d[1]) - x(d[0]))
      .attr("fill", d => color(d[0]))

    legend.call(xAxis)
      .select('.domain')
      .remove();

    // Path
    svg.append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(topojson.feature(countyData, countyData.objects.counties).features)
      .enter()
      .append('path')
      .attr('class', 'county')
      .attr('data-fips', d => d.id)
      .attr('data-education', d => education.get(d.id))
      .attr('fill', d => color(education.get(d.id)))
      .attr('d', path)
      .on('mouseover', d => {
        tooltip.transition()
                .duration(200)
                .style('opacity', '.75');
        tooltip.attr('data-education', education.get(d.id));
        const e = eduData.find(e => e.fips === d.id);
        tooltip.html(e.area_name + ', ' + e.state + ': ' + e.bachelorsOrHigher + '%')
                .style('left', `${d3.event.pageX}px`)
                .style('top', `${d3.event.pageY}px`);
      })
      .on('mouseout', d => {
        tooltip.transition()
                .duration(200)
                .style('opacity', '0');
      })
    svg.append('path')
      .datum(topojson.mesh(countyData, countyData.objects.states, (a, b) => a !== b))
      .attr('class', 'states')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('d', path);
  }
});