document.addEventListener('DOMContentLoaded', e => {
  const DATA_SETS = {
    videogame: {
      title: 'Videogame Sales',
      description: 'Top 100 Most Sold Video Games Grouped by Platform',
      dataUrl: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
    },
    movies: {
      title: 'Movies Sales',
      description: 'Top 100 Highest Grossing Movies Grouped By Genre',
      dataUrl: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
    },
    kickstarter: {
      title: 'Kickstarter Pledges',
      description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
      dataUrl: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
    }
  };

  document.querySelectorAll('#nav span')
      .forEach(el => {
        el.addEventListener('click', () => clickHandler(el.id));
      });

  function clickHandler(id) {
    document.getElementById('title').textContent = DATA_SETS[id].title;
    document.getElementById('description').textContent = DATA_SETS[id].description;
    renderGraph(DATA_SETS[id].dataUrl);
  }

  function renderGraph(dataUrl) {
    const width = 960,
          height = 570;

    d3.selectAll('svg').remove();
    
    const svg = d3.select('#graph-holder')
                  .append('svg')
                  .attr('id', 'treemap')
                  .attr('width', width)
                  .attr('height', height);

    const treemap = d3.treemap()
                      .size([width, height])
                      //.round(true) (fcc test fails when round)
                      .paddingInner(1);

    const colorScheme = [];
    d3.schemeCategory10.forEach(color => {
      colorScheme.push(color);
      colorScheme.push(d3.interpolateRgb(color, '#fff')(0.4));
    });
    const colorScale = d3.scaleOrdinal(colorScheme);

    const tooltip = d3.select('body')
                      .append('div')
                      .attr('id', 'tooltip');

    d3.json(dataUrl).then(data => {
      const root = d3.hierarchy(data)
          .eachBefore(d => {
            d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
          })
          .sum(d => d.value)
          .sort((a, b) => b.height - a.height || b.value - a.value);

      treemap(root);

      const cell = svg.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`)
            .on('mousemove', d => {
              tooltip.transition()
                      .duration(200)
                      .style('opacity', 0.75);
              tooltip.attr('data-value', d.data.value);
              tooltip.html(
                'Name: ' + d.data.name + '<br>' +
                'Category: ' + d.data.category + '<br>' +
                'Value: ' + d.data.value
              )
                .style('top', `${d3.event.pageY + 10}px`)
                .style('left', `${d3.event.pageX + 8}px`);
            })
            .on('mouseout', d => {
              tooltip.transition()
                      .duration(200)
                      .style('opacity', 0);
            });

      cell.append('rect')
          .attr('id', d => d.data.id)
          .attr('class', 'tile')
          .attr('data-name', d => d.data.name)
          .attr('data-value', d => d.data.value)
          .attr('data-category', d => d.data.category)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('fill', d => colorScale(d.data.category));

      cell.append('text')
          .selectAll('tspan')
          .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
          .enter()
          .append('tspan')
          .attr('x', 4)
          .attr('y', (d, i) => 13 + 10*i)
          .text(d => d);


      // Legend
      const categories = d3.set(root.leaves(), d => d.data.category).values();
      const legWidth = 500;
      const legPadding = 10;
      const legRectSize = 15;
      const legXSpacing = 150;
      const legYSpacing = 10;
      const legTextXPadding = 3;
      const legTextYPadding = -2;
      const legElemsPerRow = Math.floor(legWidth / legXSpacing);

      const legend = d3.select('#graph-holder')
                        .append('svg')
                        .attr('id', 'legend')
                        .attr('width', legWidth);

      const legendElem = legend.append('g')
          .attr('transform', `translate(60,${legPadding})`)
          .selectAll('g')
          .data(categories)
          .enter()
          .append('g')
          .attr('transform', (d, i) => 'translate(' + ((i % legElemsPerRow) * legXSpacing) + ',' +
              (Math.floor(i / legElemsPerRow) * legRectSize + legYSpacing * Math.floor(i / legElemsPerRow)) + ')');
      
      legendElem.append('rect')
          .attr('width', legRectSize)
          .attr('height', legRectSize)
          .attr('class', 'legend-item')
          .attr('fill', d => colorScale(d));

      legendElem.append('text')
          .attr('x', legRectSize + legTextXPadding)
          .attr('y', legRectSize + legTextYPadding)
          .text(d => d);
    });
  }

  clickHandler('videogame');
});